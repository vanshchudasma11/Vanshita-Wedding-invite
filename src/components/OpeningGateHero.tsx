import React, { useRef, useState, useEffect } from 'react';
import { weddingData } from '../config/weddingData';

interface OpeningGateHeroProps {
  onOpen: () => void;
  onReady: () => void;
}

export const OpeningGateHero: React.FC<OpeningGateHeroProps> = ({ onOpen, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [posterHidden, setPosterHidden] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setPosterHidden(true);
      onReady();
    };

    if (video.readyState >= 2) {
      setPosterHidden(true);
      onReady();
    } else {
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleLoadedData);
    }

    // Safety fallback: if video is slow to load, dismiss preloader anyway after 2s
    const fallback = setTimeout(() => {
      onReady();
    }, 2000);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleLoadedData);
      clearTimeout(fallback);
    };
  }, [onReady]);

  const handleBegin = () => {
    if (isOpen) return;
    setIsOpen(true);
    onOpen();

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch(() => {
            // If autoplay policy or codec issue, skip straight to names and unlock
            handleSkip();
          });
      }
    }

    // After 2.5s into opening animation, deal in the couple names
    setTimeout(() => {
      setShowNames(true);
    }, 2600);

    // After 5.5s (or when video finishes), unlock scroll and show hint
    setTimeout(() => {
      handleComplete();
    }, 5500);
  };

  const handleVideoEnded = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setShowNames(true);
    setShowScrollHint(true);
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
  };

  const handleSkip = () => {
    setIsOpen(true);
    setShowNames(true);
    setShowScrollHint(true);
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration || 6;
    }
  };

  const scrollToInvite = () => {
    const target = document.getElementById('invitation');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="hero">
      <video
        ref={videoRef}
        className="hero__video"
        id="hero-video"
        src={weddingData.heroVideo}
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
      />

      <img
        className={`hero__poster ${posterHidden && isVideoPlaying ? 'is-hidden' : ''}`}
        id="hero-poster"
        src={weddingData.heroPoster}
        alt="Royal Palace Gate Entrance"
      />

      {/* Opening screen with Wax Seal & Tap to begin */}
      <div
        className={`hero__cover ${isOpen ? 'is-open' : ''}`}
        id="hero-cover"
        onClick={handleBegin}
        role="button"
        tabIndex={0}
        aria-label="Tap to open wedding invitation"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleBegin();
        }}
      >
        <div className="hero__tap">
          <span className="hero__tap-text">Tap to Begin</span>
          <img
            className="hero__tap-logo"
            src={weddingData.monogramImage}
            alt="Royal Wax Seal Stamp"
            width="120"
            height="120"
          />
        </div>
      </div>

      {/* Skip button for accessibility and immediate access */}
      {isOpen && !showScrollHint && (
        <button
          className="hero__skip"
          id="hero-skip"
          type="button"
          onClick={handleSkip}
          aria-label="Skip opening animation"
        >
          Skip &rsaquo;
        </button>
      )}

      {/* Couple's Names Reveal */}
      <div className={`hero__names ${showNames ? 'is-in' : ''}`} id="hero-names">
        <h2 className="hero__name hero__name-line" style={{ transitionDelay: '0s' }}>
          {weddingData.brideName}
        </h2>
        <span className="hero__weds hero__name-line" style={{ transitionDelay: '0.4s' }}>
          Weds
        </span>
        <h2 className="hero__name hero__name-line" style={{ transitionDelay: '0.8s' }}>
          {weddingData.groomName}
        </h2>
      </div>

      {/* Scroll Down Hint */}
      <div
        className={`hero__scroll ${showScrollHint ? 'is-in' : ''}`}
        id="hero-scroll"
        onClick={scrollToInvite}
        role="button"
        tabIndex={0}
        aria-label="Scroll down to invitation"
      >
        <div className="hero__scroll-inner">
          <span className="hero__scroll-text">Scroll Down</span>
          <span className="hero__scroll-arrow">&#8595;</span>
        </div>
      </div>
    </section>
  );
};
