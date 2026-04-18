/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <>
      <div className="scanlines"></div>
      <div className="noise"></div>
      
      <div className="min-h-screen w-full p-4 flex flex-col items-center justify-center relative z-10 crt-flicker space-y-8 py-8">
        
        <main className="w-full max-w-2xl flex flex-col items-center gap-6">
          <header className="w-full text-center">
            <h1 className="text-5xl md:text-6xl text-center glitch-text font-bold text-[#0ff] tracking-tighter" data-text="NEURO_SNAKE">
              NEURO_SNAKE
            </h1>
            <div className="text-[#f0f] text-sm tracking-widest border-b border-[#f0f]/30 pb-2 mt-2 inline-block">
              // SYNERGISTIC AUDITORY PLAYBACK //
            </div>
          </header>

          <div className="w-full flex items-center justify-center">
            <SnakeGame />
          </div>

          <div className="w-full">
            <MusicPlayer />
          </div>
        </main>
      </div>
    </>
  );
}
