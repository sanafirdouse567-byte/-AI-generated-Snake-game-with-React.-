import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: "NEURAL_LINK_01.WAV",
    // Public domain / CC-BY dummy electronic tracks
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  },
  {
    id: 2,
    title: "SYNAPTIC_OVERRIDE.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "MAIN_FRAME_BREACH.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export const MusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(TRACKS[currentTrack].url);
    audioRef.current.volume = volume;
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    
    const handleEnded = () => {
      nextTrack();
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);

    if (isPlaying && hasInitialized) {
      audioRef.current.play().catch(e => console.error("Audio playback intercepted:", e));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrack]); // Re-run when track changes completely

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.error("Playback failed", e);
            setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, hasInitialized]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!hasInitialized) setHasInitialized(true);
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!hasInitialized) setHasInitialized(true);
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!hasInitialized) setHasInitialized(true);
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 neon-border-magenta p-4 bg-black/80 font-mono text-[#f0f]">
      <div className="flex justify-between items-end mb-2 border-b border-[#f0f]/30 pb-2">
        <div>
          <div className="text-xs tracking-widest text-[#0ff] mb-1 opacity-70">AUDITORY UPLINK // V.2.4.1</div>
          <div className="text-xl glitch-text crt-flicker" data-text={TRACKS[currentTrack].title}>
            {TRACKS[currentTrack].title}
          </div>
        </div>
        <div className="text-xs text-[#0ff]">
           VOL:[{Math.round(volume * 100).toString().padStart(3, '0')}%]
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-[#f0f]/20 mb-4 overflow-hidden relative cursor-crosshair">
        <div 
          className="h-full bg-[#0ff] transition-all duration-200"
          style={{ width: `${progress || 0}%` }}
        />
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:4px_100%] pointer-events-none" />
      </div>

      <div className="flex justify-between items-center px-4">
        <button 
          onClick={prevTrack}
          className="text-[#0ff] hover:text-[#f0f] focus:outline-none transition-colors border border-transparent hover:border-[#f0f] p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          [ &lt;&lt; ]
        </button>
        
        <button 
          onClick={togglePlay}
          className={`text-xl p-3 min-w-[120px] min-h-[44px] flex items-center justify-center transition-all ${isPlaying ? 'text-[#f0f] neon-border-magenta bg-black' : 'text-[#0ff] neon-border bg-[#0ff]/10 hover:bg-[#0ff] hover:text-black'}`}
        >
          {isPlaying ? '[ || ]' : '[ > ] PAUSED'}
        </button>

        <button 
          onClick={nextTrack}
          className="text-[#0ff] hover:text-[#f0f] focus:outline-none transition-colors border border-transparent hover:border-[#f0f] p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          [ &gt;&gt; ]
        </button>
      </div>
    </div>
  );
};
