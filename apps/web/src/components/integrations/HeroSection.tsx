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

import page from '@/styles/page.module.scss';
import styles from './HeroSection.module.scss';

// `.then(m => m.Hero3D)` because Hero3D is a named export. `ssr: false`
// guarantees Next never tries to render or even parse the module on the
// server — required for anything that touches WebGL or `window`.
const Hero3D = dynamic(
  () => import('./Hero3D').then((m) => m.Hero3D),
  {ssr: false},
);

export interface HeroSectionProps {
  eyebrow: string;
  title: string;
  lede: string;
}

export function HeroSection({eyebrow, title, lede}: HeroSectionProps) {
  return (
    <section className={styles.root}>
      <Hero3D />
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
