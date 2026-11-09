'use client';

import React from 'react';
import { Scene } from './scene/Scene.jsx';
import { Hero } from './ui/Hero.jsx';
import { Brand } from './ui/Brand.jsx';
import { Counter } from './ui/Counter.jsx';
import { NavBar } from './ui/NavBar.jsx';
import { Legend } from './ui/Legend.jsx';
import { Panel } from './ui/Panel.jsx';
import { FreeModeButton } from './ui/FreeModeButton.jsx';
import { SoundButton } from './ui/SoundButton.jsx';
import { Hint } from './ui/Hint.jsx';
import { LoadingScreen } from './ui/LoadingScreen.jsx';
import { useAmbient } from './hooks/useAmbient.js';
import { useKeys } from './hooks/useKeys.js';
import { useFreeLook } from './hooks/useFreeLook.js';
import './styles/observatory.css';

export function App() {
  useAmbient();
  useKeys();
  useFreeLook();

  return (
    <main id="cosmic-root" aria-label="Observatorium Kosmis Portofolio Nicholas Ivan">
      <LoadingScreen />

      <div id="canvas-wrap">
        <Scene />
      </div>

      <Brand />
      <Counter />
      <Hero />
      <Legend />
      <Panel />
      <NavBar />
      <SoundButton />
      <FreeModeButton />
      <Hint />
    </main>
  );
}

export default App;
