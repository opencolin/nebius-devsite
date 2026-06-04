// Hero3D — the iridescent membrane + particle halo behind the /integrations
// hero. Client-only by construction (uses WebGL); the parent HeroSection
// dynamically imports this module with `ssr: false` so neither this file
// nor any of its R3F dependencies are ever parsed on the server.
//
// Stack: three (raw geometry + colors) + @react-three/fiber (Canvas / hooks)
// + @react-three/drei (Float, Points, PointMaterial, shaderMaterial). Even
// though the rest of the site uses raw three.js (see PhosphorMesh), this
// surface leans on R3F because the spec asks for drei's <Float> wrapper +
// shaderMaterial helper, which would be tedious to reproduce.
//
// Bundle: with this file behind a dynamic import the integrations page
// keeps its small synchronous JS; R3F + drei (~280kB gzipped) only land
// on /integrations and only on the client.

import {Canvas, extend, useFrame, type Object3DNode} from '@react-three/fiber';
import {Float, PointMaterial, Points, shaderMaterial} from '@react-three/drei';
import {useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';

import styles from './Hero3D.module.scss';

// -----------------------------------------------------------------------------
// Reduced-motion hook
// -----------------------------------------------------------------------------
//
// Pause uTime advancement + the two rotations (mesh + halo) when the user
// has `prefers-reduced-motion: reduce` set. The canvas stays mounted and
// the membrane stays visible — frozen at its current displacement frame —
// so users still see the visual without the continuous animation that
// triggers vestibular issues. Mirrors the gate PhosphorMesh already uses.

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// -----------------------------------------------------------------------------
// Shaders
// -----------------------------------------------------------------------------
//
// Vertex: two-octave 3D simplex-noise displacement along the surface normal.
// Lower-freq octave for the "breathing" silhouette, higher-freq octave for
// the fine ripple. Outputs world-space position + normal so the fragment
// shader can do `cameraPosition - vPos` correctly (THREE's built-in
// `cameraPosition` uniform is in world space).
//
// Fragment: animated sin-banded gradient (uA → uB), then a fresnel-driven
// lift toward uC at grazing angles + a flat fresnel highlight. The result
// reads as a thin iridescent shell.

const VERTEX_SHADER = /* glsl */ `
  // 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;

  void main() {
    vec3 p = position;

    // Two-octave displacement: low freq for silhouette breathing, high freq
    // for surface ripple. Coefficients match the spec.
    float n  = snoise(p * 1.6 + vec3(uTime * 0.35));
    float n2 = snoise(p * 3.2 + vec3(uTime * 0.6, 0.0, 0.0));
    p += normal * (n * 0.28 + n2 * 0.08);

    // World-space outputs — fragment shader uses cameraPosition (a THREE
    // built-in, world-space) so vPos / vNormal need to live in the same space.
    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying vec3 vPos;
  varying vec3 vNormal;

  void main() {
    vec3 v = normalize(cameraPosition - vPos);
    float fresnel = pow(1.0 - max(dot(vNormal, v), 0.0), 2.5);

    // Animated horizontal banding — a slow sin sweep up the Y axis.
    float band = sin(vPos.y * 4.0 + uTime * 0.7) * 0.5 + 0.5;

    vec3 base = mix(uA, uB, band);
    vec3 col  = mix(base, uC, fresnel);
    col += fresnel * 0.4; // rim lift toward white at silhouette edges

    gl_FragColor = vec4(col, 1.0);
  }
`;

// -----------------------------------------------------------------------------
// Membrane material
// -----------------------------------------------------------------------------
//
// shaderMaterial() generates a ShaderMaterial subclass with getters/setters
// for each named uniform — so `matRef.current.uTime = x` proxies to
// `material.uniforms.uTime.value = x` automatically.

const MembraneMaterial = shaderMaterial(
  {
    uTime: 0,
    uA: new THREE.Color('#8a6bff'),
    uB: new THREE.Color('#ff5cb1'),
    uC: new THREE.Color('#5dd0ff'),
  },
  VERTEX_SHADER,
  FRAGMENT_SHADER,
);

// extend() registers the class so R3F can render it as <membraneMaterial />.
// Has to run at module-load (not inside a component) so the JSX element type
// is recognized before the first render.
extend({MembraneMaterial});

// TypeScript: tell R3F about the new JSX element so <membraneMaterial> type-
// checks. Using `Object3DNode<any, any>` keeps the typing honest enough
// without dragging in the full ShaderMaterial generic dance.
declare module '@react-three/fiber' {
  interface ThreeElements {
    membraneMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial> & {
      uTime?: number;
      uA?: THREE.Color;
      uB?: THREE.Color;
      uC?: THREE.Color;
    };
  }
}

// -----------------------------------------------------------------------------
// Membrane mesh
// -----------------------------------------------------------------------------

function Membrane() {
  const meshRef = useRef<THREE.Mesh>(null);
  // ShaderMaterial subclass — the intersection lies about uTime being a
  // raw number; at runtime it's a getter/setter generated by drei's
  // shaderMaterial helper that proxies to material.uniforms.uTime.value.
  const matRef = useRef<THREE.ShaderMaterial & {uTime: number}>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (reduced) return;
    if (matRef.current) matRef.current.uTime += delta;
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.12 * delta;
      meshRef.current.rotation.y += 0.18 * delta;
    }
  });

  return (
    // speed={0} freezes Float's own internal wobble in reduced-motion mode.
    // The intensities still pass through (they multiply speed under the hood),
    // so passing 0 is the cleanest no-anim configuration.
    <Float
      speed={reduced ? 0 : 1.4}
      rotationIntensity={0.6}
      floatIntensity={1.4}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.45, 64]} />
        <membraneMaterial ref={matRef} />
      </mesh>
    </Float>
  );
}

// -----------------------------------------------------------------------------
// Particle halo — 1,200 points on a thick oblate spherical shell
// -----------------------------------------------------------------------------

const HALO_COUNT = 1200;

function Halo() {
  const ref = useRef<THREE.Points>(null);
  const reduced = useReducedMotion();

  // Distribute uniformly on a thick spherical shell, then flatten Y so the
  // halo reads as an oblate ring around the membrane.
  const positions = useMemo(() => {
    const arr = new Float32Array(HALO_COUNT * 3);
    for (let i = 0; i < HALO_COUNT; i++) {
      const r = 2.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += 0.04 * delta;
    ref.current.rotation.x -= 0.02 * delta;
  });

  return (
    // frustumCulled={false} — when the membrane rotates the bounding sphere
    // of the precomputed positions can briefly fall outside the camera
    // frustum and the whole halo pops. Disabling culling is cheap (1.2k
    // additive points) and removes the artifact.
    <Points ref={ref} positions={positions} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#c8b8ff"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// -----------------------------------------------------------------------------
// Top-level Hero3D — the canvas itself
// -----------------------------------------------------------------------------

export function Hero3D() {
  return (
    <div className={styles.canvasWrap} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        gl={{antialias: true, alpha: true}}
        camera={{position: [1.4, 0.2, 4.2], fov: 45}}
        // var() resolves at the <canvas> element via the cascade from
        // HeroSection's .root; the fallback keeps the canvas visible if
        // it's ever rendered outside HeroSection.
        style={{background: 'var(--nb-hero-bg, #0a1628)'}}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={2.0} color="#8a6bff" />
        <pointLight position={[-3, -2, -2]} intensity={1.4} color="#ff5cb1" />
        <Membrane />
        <Halo />
      </Canvas>
    </div>
  );
}
