import React, { useEffect, useRef } from 'react';
import { weddingData } from '../config/weddingData';

interface PreloaderProps {
  isDone: boolean;
  onAnimationEnd?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ isDone }) => {
  const motesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motesRef.current) return;
    const container = motesRef.current;
    container.innerHTML = '';
    const count = 35;
    for (let i = 0; i < count; i++) {
      const size = 2 + Math.random() * 4;
      const span = document.createElement('span');
      span.className = 'motes__item';
      span.style.left = `${Math.random() * 100}%`;
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.animationDuration = `${5 + Math.random() * 5}s`;
      span.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(span);
    }
  }, []);

  return (
    <div className={`preloader ${isDone ? 'is-done' : ''}`} aria-hidden={isDone}>
      <div className="motes" ref={motesRef} aria-hidden="true" />
      <img
        className="preloader__logo"
        src={weddingData.monogramImage}
        alt="Royal Wax Seal"
        width="100"
        height="100"
      />
      <p className="preloader__text">&#10024; A Beautiful Celebration Awaits &#10024;</p>
      <div className="preloader__bar" />
    </div>
  );
};
