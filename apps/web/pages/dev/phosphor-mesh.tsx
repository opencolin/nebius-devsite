// Demo page for the PhosphorMesh hero visual.
//
// Visit at: http://localhost:3000/dev/phosphor-mesh
//
// Three live instances to verify the prop API:
//   1. Defaults (B1a Soft Haze) — the locked-in look
//   2. Heavier bloom (B1b-style)
//   3. Custom palette override (cyan-shifted, for visual prop-pass-through proof)

import Head from 'next/head';

import {PhosphorMesh} from '@/components/hero/PhosphorMesh';

export default function PhosphorMeshDemo() {
  return (
    <>
      <Head>
        <title>PhosphorMesh demo · Nebius Builders</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          background: '#0c1825',
          color: '#c9d1d9',
          fontFamily: 'ui-sans-serif, -apple-system, system-ui, sans-serif',
          padding: '32px',
        }}
      >
        <header style={{maxWidth: 1400, margin: '0 auto 24px'}}>
          <h1 style={{margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '0.02em'}}>
            PhosphorMesh · live demo
          </h1>
          <p style={{margin: '6px 0 0', color: '#6e7681', fontSize: 13}}>
            Dropped in from{' '}
            <code style={{color: '#c0f53d'}}>@/components/hero/PhosphorMesh</code>. Three configs to prove props pass through.
          </p>
        </header>

        <section style={{maxWidth: 1400, margin: '0 auto 32px'}}>
          <h2 style={demoLabel}>1. Defaults — B1a Soft Haze</h2>
          <PhosphorMesh />
        </section>

        <section
          style={{
            maxWidth: 1400,
            margin: '0 auto 32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div>
            <h2 style={demoLabel}>2. Heavier bloom override</h2>
            <PhosphorMesh
              aspectRatio={16 / 10}
              bloom={{strength: 1.4, radius: 1.2, threshold: 0.12}}
            />
          </div>
          <div>
            <h2 style={demoLabel}>3. Custom palette (proof of pass-through)</h2>
            <PhosphorMesh
              aspectRatio={16 / 10}
              palette={{
                deep: '#0a1a33',
                forest: '#1f4a8a',
                lime: '#22d3ee',
                peak: '#a5f3fc',
              }}
            />
          </div>
        </section>

        <footer style={{maxWidth: 1400, margin: '32px auto 0', color: '#6e7681', fontSize: 12, lineHeight: 1.6}}>
          <p style={{margin: 0}}>
            Component source:{' '}
            <code>apps/web/src/components/hero/PhosphorMesh.tsx</code>
          </p>
          <p style={{margin: '4px 0 0'}}>
            three.js is dynamic-imported inside <code>useEffect</code> — SSR-safe, no
            hydration mismatch, and the ~600KB chunk only loads on pages that use
            the component.
          </p>
        </footer>
      </main>
    </>
  );
}

const demoLabel: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 12,
  fontWeight: 500,
  color: '#6e7681',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};
