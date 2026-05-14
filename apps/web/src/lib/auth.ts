// Auth helpers backed by Directus.
//
// Flow:
//  1. Browser POSTs email/password to /api/auth/login.
//  2. The route forwards to Directus's POST /auth/login, receives
//     { access_token, refresh_token, expires }, and stores them in two
//     httpOnly cookies (the access token expires in ~15min, the refresh
//     token in ~7 days).
//  3. getServerSession(req) reads the cookies and pulls the current user
//     from Directus. If the access token is expired, it transparently
//     refreshes via the refresh token and rotates the cookies.
//  4. requireRole(role) is a getServerSideProps helper that returns a
//     redirect to /login?next=… if the visitor lacks the required role.

import {parse, serialize} from 'cookie';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {GetServerSidePropsContext} from 'next';

import {directusAsUser} from './directus';
import type {DirectusUserRow, RoleName} from './types';

const COOKIE_ACCESS = (process.env.AUTH_COOKIE_NAME ?? 'nb_session') + '_at';
const COOKIE_REFRESH = (process.env.AUTH_COOKIE_NAME ?? 'nb_session') + '_rt';
const COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === '1';
const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface DirectusAuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires: number;
  };
}

export async function loginWithDirectus(email: string, password: string) {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({email, password}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Directus login failed (${res.status}): ${body}`);
  }
  return (await res.json()) as DirectusAuthResponse;
}

export async function refreshDirectusSession(refreshToken: string) {
  const res = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({refresh_token: refreshToken, mode: 'json'}),
  });
  if (!res.ok) {
    throw new Error(`Directus refresh failed: ${res.status}`);
  }
  return (await res.json()) as DirectusAuthResponse;
}

export async function logoutDirectus(refreshToken: string) {
  // Best-effort — even if this fails we still clear the local cookies.
  try {
    await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({refresh_token: refreshToken, mode: 'json'}),
    });
  } catch {
    /* ignore */
  }
}

export function setSessionCookies(
  res: ServerResponse,
  access: string,
  refresh: string,
  accessExpiresMs: number,
) {
  const accessMaxAgeSec = Math.max(60, Math.floor(accessExpiresMs / 1000) - 30);
  const refreshMaxAgeSec = 60 * 60 * 24 * 7; // 7d
  const common = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax' as const,
    path: '/',
    domain: COOKIE_DOMAIN,
  };
  res.setHeader('set-cookie', [
    serialize(COOKIE_ACCESS, access, {...common, maxAge: accessMaxAgeSec}),
    serialize(COOKIE_REFRESH, refresh, {...common, maxAge: refreshMaxAgeSec}),
  ]);
}

export function clearSessionCookies(res: ServerResponse) {
  const common = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax' as const,
    path: '/',
    domain: COOKIE_DOMAIN,
    maxAge: 0,
  };
  res.setHeader('set-cookie', [
    serialize(COOKIE_ACCESS, '', common),
    serialize(COOKIE_REFRESH, '', common),
  ]);
}

export function readSessionCookies(req: IncomingMessage) {
  const cookies = parse(req.headers.cookie ?? '');
  return {
    accessToken: cookies[COOKIE_ACCESS] ?? null,
    refreshToken: cookies[COOKIE_REFRESH] ?? null,
  };
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: RoleName | null;
}

/**
 * Returns the current session user, refreshing the access token if needed.
 * Pass the response so cookies can be rotated transparently when refreshed.
 */
export async function getServerSession(
  req: IncomingMessage,
  res?: ServerResponse,
): Promise<SessionUser | null> {
  const {accessToken, refreshToken} = readSessionCookies(req);
  if (!accessToken && !refreshToken) return null;

  const tryFetchMe = async (token: string) => {
    const r = await fetch(
      `${DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name,role.name`,
      {headers: {authorization: `Bearer ${token}`}},
    );
    return r;
  };

  let token = accessToken;
  let me: Response | null = null;

  if (token) {
    me = await tryFetchMe(token);
  }

  if ((!me || me.status === 401) && refreshToken) {
    try {
      const refreshed = await refreshDirectusSession(refreshToken);
      token = refreshed.data.access_token;
      if (res) {
        setSessionCookies(
          res,
          refreshed.data.access_token,
          refreshed.data.refresh_token,
          refreshed.data.expires,
        );
      }
      me = await tryFetchMe(token);
    } catch {
      if (res) clearSessionCookies(res);
      return null;
    }
  }

  if (!me || !me.ok) return null;
  const json = (await me.json()) as {data: DirectusUserRow};
  const u = json.data;
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name ?? null,
    lastName: u.last_name ?? null,
    role: normalizeRole(u.role?.name),
  };
}

/**
 * Map Directus's role name (the human-readable string in directus_roles.name)
 * to our internal RoleName enum. Directus's default install creates an
 * "Administrator" role; teams can rename it to "admin", or add custom roles
 * named "builder", "ambassador", etc. We treat anything containing "admin"
 * (case-insensitive) as admin, and everything else as builder.
 */
function normalizeRole(name: string | undefined | null): RoleName | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('builder') || lower.includes('contributor') || lower.includes('ambassador')) {
    return 'builder';
  }
  // Default: treat any signed-in user as a builder (least-privilege authed
  // role). The auth gate then picks role mismatches up.
  return 'builder';
}

/**
 * getServerSideProps helper. Use as: `return requireRole('builder', ctx)`.
 * Returns either a redirect or `{props: {user}}` — useful when the page
 * itself only needs to know the user.
 */
export async function requireRole(
  role: RoleName,
  ctx: GetServerSidePropsContext,
) {
  const user = await getServerSession(ctx.req, ctx.res);
  if (!user || (role !== 'public' && user.role !== role && user.role !== 'admin')) {
    const next = encodeURIComponent(ctx.resolvedUrl);
    return {
      redirect: {destination: `/login?next=${next}`, permanent: false},
    } as const;
  }
  return {props: {user}} as const;
}

/**
 * Sibling helper for data-fetching pages: returns either a redirect result
 * (to be returned as-is from getServerSideProps) or null. Cleaner TypeScript
 * narrowing than `requireRole` because the success branch is `null`, not
 * an object that competes with the page's Props type.
 *
 * Use as:
 *   const guard = await enforceRole('admin', ctx);
 *   if (guard) return guard;
 *   const rows = await directus.request(...);
 *   return {props: {rows}};
 */
export async function enforceRole(
  role: RoleName,
  ctx: GetServerSidePropsContext,
): Promise<{redirect: {destination: string; permanent: false}} | null> {
  const user = await getServerSession(ctx.req, ctx.res);
  if (!user || (role !== 'public' && user.role !== role && user.role !== 'admin')) {
    const next = encodeURIComponent(ctx.resolvedUrl);
    return {redirect: {destination: `/login?next=${next}`, permanent: false}};
  }
  return null;
}

/**
 * Same role gate, but for API routes. Returns either an error payload to
 * return as JSON, or null to proceed.
 *
 *   const guard = await enforceRoleApi('admin', req);
 *   if (guard) return res.status(guard.status).json({error: guard.error});
 */
export async function enforceRoleApi(
  role: RoleName,
  req: IncomingMessage,
): Promise<{status: 401 | 403; error: string} | null> {
  const user = await getServerSession(req);
  if (!user) return {status: 401, error: 'Sign in required'};
  if (role !== 'public' && user.role !== role && user.role !== 'admin') {
    return {status: 403, error: `Requires ${role} role; you are ${user.role ?? 'unauthenticated'}`};
  }
  return null;
}

export {COOKIE_ACCESS, COOKIE_REFRESH};

/** Server-side typed Directus client scoped to the current user, if any. */
export async function directusForRequest(
  req: IncomingMessage,
  res?: ServerResponse,
) {
  const {accessToken, refreshToken} = readSessionCookies(req);
  let token = accessToken;
  if (!token && refreshToken) {
    const refreshed = await refreshDirectusSession(refreshToken);
    token = refreshed.data.access_token;
    if (res) {
      setSessionCookies(
        res,
        refreshed.data.access_token,
        refreshed.data.refresh_token,
        refreshed.data.expires,
      );
    }
  }
  if (!token) return null;
  return directusAsUser(token);
}
