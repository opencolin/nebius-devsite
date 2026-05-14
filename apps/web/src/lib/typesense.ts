// Typesense clients.
//
// `typesenseAdmin()` — server-only, uses the admin API key. Used by the
//                      indexer (infra/typesense/sync.ts) and any server-side
//                      mutation endpoints.
// `typesenseSearch()` — server-only proxy use. Holds the search-only key in
//                       env so it never reaches the browser. Browsers hit
//                       /api/search instead and this server uses this client
//                       to forward the query.
//
// We deliberately don't expose the search-only key to the browser. Two
// reasons: (1) keeps options open for IP-throttling later; (2) lets us
// scope the result projection per call.

import {Client} from 'typesense';

const HOST = process.env.TYPESENSE_HOST ?? 'localhost';
const PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const PROTOCOL =
  (process.env.TYPESENSE_PROTOCOL as 'http' | 'https' | undefined) ?? 'http';

let _admin: Client | undefined;
let _search: Client | undefined;

export function typesenseAdmin() {
  if (!_admin) {
    _admin = new Client({
      nodes: [{host: HOST, port: PORT, protocol: PROTOCOL}],
      apiKey: process.env.TYPESENSE_ADMIN_KEY ?? '',
      connectionTimeoutSeconds: 5,
    });
  }
  return _admin;
}

export function typesenseSearch() {
  if (!_search) {
    _search = new Client({
      nodes: [{host: HOST, port: PORT, protocol: PROTOCOL}],
      apiKey: process.env.TYPESENSE_SEARCH_KEY ?? '',
      connectionTimeoutSeconds: 3,
    });
  }
  return _search;
}

export const TYPESENSE_COLLECTION = 'nebius_builders';
