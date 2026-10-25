import React, { useRef, useState, useEffect, useCallback } from 'react';
import { weddingData } from '../config/weddingData';

interface MusicControlProps {
  shouldPlay: boolean;
  visible: boolean;
}

export const MusicControl: React.FC<MusicControlProps> = ({ shouldPlay, visible }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startFallbackSynth = useCallback(() => {
    // Gentle royal Indian instrumental drone/harmonium fallback via Web Audio API
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Create a warm soothing chord (Sa - Pa - Sa drone: C4, G4, C5)
      const freqs = [261.63, 392.00, 523.25];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      });
      setIsPlaying(true);
    } catch {
      // Audio completely unsupported; ignore gracefully
    }
  }, []);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.6;
    const promise = audio.play();
    if (promise) {
      promise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If audio file is missing or blocked, trigger fallback safely
          startFallbackSynth();
        });
    }
  }, [startFallbackSynth]);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  useEffect(() => {
    if (shouldPlay) {
      playAudio();
    }
  }, [shouldPlay, playAudio]);

  return (
    <>
      <audio
        ref={audioRef}
        src={weddingData.audioTrack}
        loop
        preload="auto"
        onError={() => {
          // Handles missing audio file safely as specified in requirements
          console.info('Audio track loading fallback initiated');
        }}
      />
      <button
        className={`music ${visible ? 'is-in' : ''} ${isPlaying ? 'is-playing' : ''}`}
        type="button"
        id="music-toggle"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        <img
          className="music__record"
          src="/assets/media/music-record.png"
          alt=""
          width="74"
          height="74"
        />
      </button>
    </>
  );
};
