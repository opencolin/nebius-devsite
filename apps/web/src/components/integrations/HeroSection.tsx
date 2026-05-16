// HeroSection — the /integrations hero. Three layered children inside a
// `isolation: isolate` stacking context:
//
//   1. <Hero3D />     — full-bleed WebGL membrane + halo (dynamic, ssr:false)
//   2. <div .mask>    — left-to-right legibility gradient over the canvas
//   3. <div .copy>    — eyebrow + title + lede on top of the mask
//
// The dynamic import keeps the entire R3F + drei + custom-shader chunk off
// every other page AND off the server payload. On SSR we render the section
// chrome (#06060c background + mask + copy) with no canvas — the page is
// readable instantly, and the canvas fades in client-side once the chunk
// lands.

import dynamic from 'next/dynamic';
import {Component, type ReactNode} from 'react';

import page from '@/styles/page.module.scss';
import styles from './HeroSection.module.scss';

// `.then(m => m.Hero3D)` because Hero3D is a named export. `ssr: false`
// guarantees Next never tries to render or even parse the module on the
// server — required for anything that touches WebGL or `window`.
const Hero3D = dynamic(
  () => import('./Hero3D').then((m) => m.Hero3D),
  {ssr: false},
);

// Catch WebGL failures so they don't take the whole page down with them.
//
// Without this, anyone whose browser can't create a WebGL context — older
// devices, hardware acceleration disabled, corporate sandboxes, headless
// browsers, GPU driver hiccups — sees `THREE.WebGLRenderer: A WebGL context
// could not be created` propagate as an unhandled exception, React unmounts
// the entire route, and Next.js renders its generic "Application error: a
// client-side exception has occurred" fallback. The /integrations page goes
// completely blank, including the SSR'd eyebrow/title/lede that have nothing
// to do with WebGL.
//
// On error we render null instead of the canvas; the section's dark bg +
// mask + copy stay visible, so the page reads like the SSR shell forever
// rather than crashing.
class WebGLBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  componentDidCatch(err: Error) {
    // Surface so devs can diagnose without breaking users.
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[Hero3D] WebGL boundary caught:', err.message);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export interface HeroSectionProps {
  eyebrow: string;
  title: string;
  lede: string;
}

export function HeroSection({eyebrow, title, lede}: HeroSectionProps) {
  return (
    <section className={styles.root}>
      <WebGLBoundary>
        <Hero3D />
      </WebGLBoundary>
      <div className={styles.mask} aria-hidden />
      <div className={page.container}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lede}>{lede}</p>
        </div>
      </div>
    </section>
  );
}
