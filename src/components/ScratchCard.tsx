import React, { useRef, useEffect, useState, useCallback } from 'react';
import { weddingData } from '../config/weddingData';

export const ScratchCard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [, setIsDone] = useState(false);

  const isRevealedRef = useRef(false);
  const showShimmerRef = useRef(false);

  // Sparks ambient particle effect
  useEffect(() => {
    const sparksContainer = sparksRef.current;
    if (!sparksContainer) return;
    sparksContainer.innerHTML = '';
    const count = 30;
    for (let i = 0; i < count; i++) {
      const size = 2 + Math.random() * 4;
      const span = document.createElement('span');
      span.className = 'sparks__item';
      span.style.left = `${Math.random() * 100}%`;
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.background = i % 2 === 0 ? '#c9a24a' : '#fdf2a9';
      span.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      span.style.animationDuration = `${15 + Math.random() * 20}s`;
      span.style.animationDelay = `-${Math.random() * 20}s`;
      sparksContainer.appendChild(span);
    }
  }, []);

  // Fire confetti
  const fireConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#d4af37', '#fdf2a9', '#ffffff', '#e8c978'];
    const count = 600;
    const parts: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      spin: number;
      tilt: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * box.width,
        y: -Math.random() * box.height,
        vx: -4 + Math.random() * 8,
        vy: 3 + Math.random() * 6,
        size: 2 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.6 + Math.random() * 0.4,
        spin: -10 + Math.random() * 20,
        tilt: Math.random() * 360,
      });
    }

    const fadeFrom = box.height * 0.25;
    let time = 0;
    let animId: number;

    const frame = () => {
      time += 0.016;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      parts.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;

        p.x += p.vx + Math.sin(time * 5 + p.y * 0.01) * 0.5;
        p.y += p.vy;
        p.tilt += p.spin;
        if (p.y > fadeFrom) p.alpha -= 0.02;

        if (p.y < -p.size * 2) return;

        const a = (p.tilt * Math.PI) / 180;
        const cos = Math.cos(a) * dpr;
        const sin = Math.sin(a) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.5);
        ctx.lineTo(p.size * 0.8, -p.size);
        ctx.lineTo(p.size, p.size * 0.8);
        ctx.lineTo(-p.size * 0.5, p.size);
        ctx.closePath();
        ctx.fill();
      });

      if (alive) {
        animId = requestAnimationFrame(frame);
      } else {
        canvas.width = 0;
        canvas.height = 0;
      }
    };

    frame();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Initialize scratch foil canvas
  useEffect(() => {
    // If already permanently revealed, do not redraw the gold heart
    if (isRevealedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const size = canvas.offsetWidth || 380;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const paintFoil = () => {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gold = ctx.createLinearGradient(0, 0, size, size);
      gold.addColorStop(0, '#d4af37');
      gold.addColorStop(0.3, '#e6c27a');
      gold.addColorStop(0.5, '#c9a227');
      gold.addColorStop(0.7, '#fdf2a9');
      gold.addColorStop(1, '#aa771c');
      ctx.fillStyle = gold;
      ctx.fillRect(0, 0, size, size);

      // Add delicate metallic grain
      for (let i = 0; i < size * size * 0.04; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
      }
    };

    paintFoil();

    let drawing = false;
    let last: { x: number; y: number } | null = null;
    let checkScheduled = false;

    const rub = (x: number, y: number) => {
      const radius = size * 0.12;
      const fade = ctx.createRadialGradient(x, y, 0, x, y, radius);
      fade.addColorStop(0, 'rgba(0,0,0,1)');
      fade.addColorStop(0.4, 'rgba(0,0,0,0.8)');
      fade.addColorStop(0.8, 'rgba(0,0,0,0.2)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const triggerReveal = () => {
      if (isRevealedRef.current) return;
      isRevealedRef.current = true;
      drawing = false;
      last = null;
      setIsDone(true);
      setIsRevealed(true);
      fireConfetti();

      // Permanently blank canvas after CSS fade completes to ensure it never refills
      setTimeout(() => {
        if (canvasRef.current) {
          const c = canvasRef.current;
          const context = c.getContext('2d');
          if (context) {
            context.clearRect(0, 0, c.width, c.height);
          }
        }
      }, 1200);
    };

    const checkProgress = () => {
      if (isRevealedRef.current) return;
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const startX = Math.floor(w * 0.12);
      const endX = Math.floor(w * 0.88);
      const startY = Math.floor(h * 0.08);
      const endY = Math.floor(h * 0.86);

      let total = 0;
      let cleared = 0;
      const step = Math.max(4, Math.floor(w / 40));

      for (let y = startY; y < endY; y += step) {
        const ny = y / h;
        for (let x = startX; x < endX; x += step) {
          const nx = x / w;

          // Heart envelope check so only points inside the heart shape are counted
          let inHeart = false;
          if (ny < 0.38) {
            const distLeft = Math.hypot(nx - 0.31, ny - 0.25);
            const distRight = Math.hypot(nx - 0.69, ny - 0.25);
            if (distLeft <= 0.22 || distRight <= 0.22) {
              inHeart = true;
            }
          } else {
            const progress = (ny - 0.38) / (0.88 - 0.38);
            const halfWidth = 0.38 * (1 - Math.min(1, Math.max(0, progress)));
            if (Math.abs(nx - 0.5) <= halfWidth) {
              inHeart = true;
            }
          }

          if (inHeart) {
            total++;
            const alphaIndex = (y * w + x) * 4 + 3;
            if (data[alphaIndex] < 128) {
              cleared++;
            }
          }
        }
      }

      if (total === 0) return;
      const percent = (cleared / total) * 100;

      if (percent >= 15 && !showShimmerRef.current) {
        showShimmerRef.current = true;
        setShowShimmer(true);
      }

      // Threshold reached (45-55% requirement): permanently complete the reveal
      if (percent >= 45) {
        triggerReveal();
      }
    };

    const scheduleProgressCheck = () => {
      if (checkScheduled || isRevealedRef.current) return;
      checkScheduled = true;
      requestAnimationFrame(() => {
        checkScheduled = false;
        checkProgress();
      });
    };

    const doScratch = (clientX: number, clientY: number) => {
      if (isRevealedRef.current) return;
      const box = canvas.getBoundingClientRect();
      const x = ((clientX - box.left) / box.width) * size;
      const y = ((clientY - box.top) / box.height) * size;
      const from = last || { x, y };

      const span = Math.hypot(x - from.x, y - from.y);
      const steps = Math.max(1, Math.ceil(span / (size * 0.02)));

      for (let i = 0; i <= steps; i++) {
        const px = from.x + (x - from.x) * (i / steps);
        const py = from.y + (y - from.y) * (i / steps);
        rub(px, py);
      }

      last = { x, y };
      scheduleProgressCheck();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isRevealedRef.current) return;
      drawing = true;
      last = null;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback if pointer capture is not supported
      }
      doScratch(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isRevealedRef.current) return;
      if (drawing) {
        doScratch(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      drawing = false;
      last = null;
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback
      }
      scheduleProgressCheck();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isRevealedRef.current) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [fireConfetti]);

  return (
    <section className="section scratch" id="scratch-section">
      <div className="sparks" ref={sparksRef} aria-hidden="true" />

      {/* SVG Clip Path for Heart */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.889 C 0.256 0.692, 0.05 0.475, 0.05 0.282 C 0.05 0.136, 0.156 0.05, 0.29 0.05 C 0.378 0.05, 0.454 0.10, 0.5 0.172 C 0.546 0.10, 0.622 0.05, 0.71 0.05 C 0.844 0.05, 0.95 0.136, 0.95 0.282 C 0.95 0.475, 0.744 0.692, 0.5 0.889 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="scratch__head reveal-item is-visible">
        <h4 className="scratch__eyebrow">A Special Surprise</h4>
        <h2 className="scratch__title">Scratch the heart to reveal our wedding date</h2>
      </div>

      <div className="scratch__stage reveal-item is-visible">
        <div className="scratch__card">
          {/* Card Heart Background */}
          <svg
            className="scratch__heart-bg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 50 88.9 C 25.6 69.2, 5 47.5, 5 28.2 C 5 13.6, 15.6 5, 29 5 C 37.8 5, 45.4 10, 50 17.2 C 54.6 10, 62.2 5, 71 5 C 84.4 5, 95 13.6, 95 28.2 C 95 47.5, 74.4 69.2, 50 88.9 Z"
              fill="#ffffff"
            />
          </svg>

          {/* Hidden Date Revealed on Scratch */}
          <div className={`scratch__date ${isRevealed ? 'is-in' : ''}`}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, display: 'block', color: '#6e1f2f' }}>
              {weddingData.weddingDateDisplay.day}
            </span>
            <span style={{ letterSpacing: '3px', fontWeight: 600 }}>
              {weddingData.weddingDateDisplay.month}
            </span>
            <br />
            <span>{weddingData.weddingDateDisplay.year}</span>
            <br />
            <small style={{ fontSize: '0.85rem', letterSpacing: '3px', opacity: 0.85 }}>
              {weddingData.weddingDateDisplay.weekday}
            </small>
          </div>

          {/* Golden Scratch Foil Canvas */}
          <div className="scratch__foil-wrap">
            <canvas
              ref={canvasRef}
              className={`scratch__foil ${isRevealed ? 'is-cleared' : ''}`}
              style={{ touchAction: 'none' }}
            />
            {showShimmer && <div className="scratch__shimmer" />}
          </div>

          {/* Heart Outline Line */}
          <svg
            className="scratch__heart-line"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 50 88.9 C 25.6 69.2, 5 47.5, 5 28.2 C 5 13.6, 15.6 5, 29 5 C 37.8 5, 45.4 10, 50 17.2 C 54.6 10, 62.2 5, 71 5 C 84.4 5, 95 13.6, 95 28.2 C 95 47.5, 74.4 69.2, 50 88.9 Z"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Confetti Canvas */}
          <canvas ref={confettiCanvasRef} className="scratch__confetti" aria-hidden="true" />
        </div>

        {/* Scratch Hand Gesture Hint */}
        <div className={`scratch__hint ${isRevealed ? 'is-done' : ''}`}>
          <h3 className="scratch__hint-text">Scratch to reveal! &#10024;</h3>
          <svg
            className="scratch__hand"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
            <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
            <path d="M14 10.5v-1.5a1.5 1.5 0 0 1 3 0v2.5" />
            <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
          </svg>
        </div>
      </div>
    </section>
  );
};
