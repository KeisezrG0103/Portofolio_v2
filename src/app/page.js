'use client';

import dynamic from 'next/dynamic';

const CosmicObservatoryApp = dynamic(() => import('../App.jsx'), {
  ssr: false,
});

export default function HomePage() {
  return <CosmicObservatoryApp />;
}
