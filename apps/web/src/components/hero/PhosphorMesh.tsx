// PhosphorMesh — the spinning green wave hero visual.
//
// A WebGL ribbon mesh deformed in a vertex shader, then post-processed with
// UnrealBloom for the signature "phosphor glow" halo. Dark-mode counterpart
// to the Nebius lime ribbon (nebius.com mobile-green3.jpg).
//
// Defaults are the Soft Haze (B1a) config locked in during /design-shotgun:
//   - palette: deep forest → forest → tw-lime-500 → bright lime peak
//   - bloom:   strength 1.10, radius 1.00, threshold 0.18
//   - spin:    0.18 rad/s (~35s/rev)
//
// Heavy: three.js is ~600KB. The whole three module is dynamic-imported inside
// useEffect so SSR doesn't see it and the main bundle stays light. The first
// frame on the client appears after the chunk lands (usually <100ms on prod).
//
// Usage:
//   import {PhosphorMesh} from '@/components/hero/PhosphorMesh';
//   <PhosphorMesh />                            // defaults (B1a Soft Haze)
//   <PhosphorMesh aspectRatio={21/9} />         // ultrawide hero
//   <PhosphorMesh bloom={{strength: 1.4}} />    // tweak just one bloom dial
//   <PhosphorMesh palette={['#000', '#0a0', '#5f5', '#df5']} />

import {useEffect, useRef} from 'react';

import styles from './PhosphorMesh.module.scss';

export interface PhosphorMeshPalette {
  /** Deepest shadow color (gradient stop at t=0). */
  deep: string;
  /** Mid-shadow forest green (t≈0.35). */
  forest: string;
  /** Primary brand lime (t≈0.75). */
  lime: string;
  /** Brightest peak — never pure white (t=1.0). */
  peak: string;
}

export interface PhosphorMeshBloom {
  /** Overall bloom intensity. Default 1.10. */
  strength?: number;
  /** Halo spread radius. Default 1.00. */
  radius?: number;
  /** Brightness threshold above which pixels feed the bloom. Default 0.18. */
  threshold?: number;
}

export interface PhosphorMeshProps {
  /** Class on the outer wrapper — control sizing and positioning from the parent. */
  className?: string;
  /** Wrapper aspect ratio (width/height). Default 16/9. */
  aspectRatio?: number;
  /** Override the 4-stop gradient. Defaults to Nebius lime palette. */
  palette?: Partial<PhosphorMeshPalette>;
  /** Override one or more UnrealBloom params. */
  bloom?: PhosphorMeshBloom;
  /** Rotation speed in radians per second around the vertical axis. Default 0.18. */
  spinSpeed?: number;
  /** Force-render even when prefers-reduced-motion is set. Default false. */
  ignoreReducedMotion?: boolean;
}

const DEFAULT_PALETTE: PhosphorMeshPalette = {
  deep: '#0d3320',
  forest: '#1f8a3a',
  lime: '#84cc16',
  peak: '#c0f53d',
};

const DEFAULT_BLOOM: Required<PhosphorMeshBloom> = {
  strength: 1.1,
  radius: 1.0,
  threshold: 0.18,
};

// Shader source kept as module-level constants so HMR doesn't re-allocate
// strings each render. The shader pipeline mirrors variant-B1a.html exactly.
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vFold;
  varying vec3 vNormalView;
  void main() {
    vUv = uv;
    vec3 p = position;
    float wave =
      sin(p.x * 1.05 + uTime * 0.55) * 0.55 +
      sin(p.x * 2.1  + uTime * 0.32) * 0.18;
    p.y += wave;
    float twist = sin(p.x * 0.45 + uTime * 0.35) * 1.15;
    float c = cos(twist), s = sin(twist);
    vec3 twisted = vec3(p.x, c * p.y - s * p.z * 0.6, s * p.y + c * p.z * 0.6);
    vFold = wave;
    vec4 mv = modelViewMatrix * vec4(twisted, 1.0);
    vNormalView = normalize(normalMatrix * normalize(vec3(
      -cos(p.x * 1.05 + uTime * 0.55) * 1.05, 1.0, 0.0
    )));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA, uColorB, uColorC, uColorD;
  varying vec2 vUv;
  varying float vFold;
  varying vec3 vNormalView;
  vec3 ramp(float t) {
    // Peak band intentionally skinny — only the top ~12% of the gradient
    // (was 25%) hits the bright lime. Keeps the bright sliver visible but
    // not dominant.
    vec3 ab = mix(uColorA, uColorB, smoothstep(0.0, 0.35, t));
    vec3 bc = mix(ab, uColorC, smoothstep(0.35, 0.88, t));
    return mix(bc, uColorD, smoothstep(0.88, 1.0, t));
  }
  void main() {
    float t = fract(vUv.x + uTime * 0.04);
    vec3 base = ramp(t);
    // Tighter, dimmer specular: pow 18 (was 9) gives a much narrower
    // highlight; intensity 0.18 (was 0.30) reins it in further.
    float spec = pow(max(dot(vNormalView, vec3(0.0, 0.4, 1.0)), 0.0), 18.0);
    base += vec3(0.55, 1.0, 0.35) * spec * 0.18;
    // Rim light only on the highest-curvature folds (was 0.4..1.2).
    float rim = smoothstep(0.85, 1.3, abs(vFold));
    base += vec3(0.50, 0.90, 0.25) * rim * 0.18;
    float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    float alpha = 0.95 * edge;
    float depth = 1.0 - abs(vUv.y - 0.5) * 0.6;
    base *= depth;
    gl_FragColor = vec4(base, alpha);
  }
`;

export function PhosphorMesh({
  className,
  aspectRatio = 16 / 9,
  palette,
  bloom,
  spinSpeed = 0.18,
  ignoreReducedMotion = false,
}: PhosphorMeshProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Cancellation guards in case the effect cleanup fires before the
    // dynamic imports resolve (fast unmount, React strict mode double-invoke).
    let cancelled = false;
    let cleanup = () => {};

    void (async () => {
      // Lazy-load three.js + postprocessing addons. Bundler tree-shakes the
      // rest of three out of the page's main chunk.
      const [
        THREE,
        {EffectComposer},
        {RenderPass},
        {UnrealBloomPass},
        {OutputPass},
      ] = await Promise.all([
        import('three'),
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('three/examples/jsm/postprocessing/OutputPass.js'),
      ]);
      if (cancelled) return;

      const finalPalette: PhosphorMeshPalette = {...DEFAULT_PALETTE, ...palette};
      const finalBloom: Required<PhosphorMeshBloom> = {...DEFAULT_BLOOM, ...bloom};
      const reduced =
        !ignoreReducedMotion &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Initial size from the mount (parent controls aspect via aspect-ratio CSS).
      let width = mount.clientWidth || 1;
      let height = mount.clientHeight || 1;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x04060a);

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 6.2);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      mount.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(5.2, 1.5, 240, 36);

      const uniforms = {
        uTime: {value: 0},
        uColorA: {value: new THREE.Color(finalPalette.deep)},
        uColorB: {value: new THREE.Color(finalPalette.forest)},
        uColorC: {value: new THREE.Color(finalPalette.lime)},
        uColorD: {value: new THREE.Color(finalPalette.peak)},
      };

      const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      });

      const ribbon = new THREE.Mesh(geometry, material);
      scene.add(ribbon);

      // Ground glow quad for ambient haze behind the ribbon.
      const glowGeo = new THREE.PlaneGeometry(20, 8);
      const glowMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {},
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv;
          void main(){
            float d = distance(vUv, vec2(0.5, 0.55));
            float a = smoothstep(0.55, 0.0, d) * 0.18;
            vec3 col = mix(vec3(0.05, 0.22, 0.07), vec3(0.52, 0.80, 0.18), 1.0 - d * 2.0);
            gl_FragColor = vec4(col, a);
          }`,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -2.5;
      scene.add(glow);

      // Postprocessing — single UnrealBloom pass (B1a Soft Haze config).
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        finalBloom.strength,
        finalBloom.radius,
        finalBloom.threshold,
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());

      // Resize observer keeps the canvas crisp when the parent resizes.
      const resizeObserver = new ResizeObserver(() => {
        if (!mount) return;
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        if (w === width && h === height) return;
        width = w;
        height = h;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
        bloomPass.setSize(width, height);
      });
      resizeObserver.observe(mount);

      const clock = new THREE.Clock();
      let rafId = 0;
      const tick = () => {
        const t = clock.getElapsedTime();
        if (!reduced) {
          uniforms.uTime.value = t;
          ribbon.rotation.y = t * spinSpeed;
          ribbon.rotation.x = Math.sin(t * 0.22) * 0.05;
        }
        composer.render();
        rafId = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        glowGeo.dispose();
        glowMat.dispose();
        composer.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // Re-init only when the heavy props change. spinSpeed/palette/bloom changes
    // recompile/reinit the scene — fine, this isn't a frequently-rerendering
    // component.
  }, [
    aspectRatio,
    bloom?.radius,
    bloom?.strength,
    bloom?.threshold,
    ignoreReducedMotion,
    palette?.deep,
    palette?.forest,
    palette?.lime,
    palette?.peak,
    spinSpeed,
  ]);

  return (
    <div
      ref={mountRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{aspectRatio: String(aspectRatio)}}
      aria-hidden="true"
    />
  );
}
