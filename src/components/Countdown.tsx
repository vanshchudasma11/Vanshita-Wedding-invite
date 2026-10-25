import React, { useState, useEffect, useRef } from 'react';
import { weddingData } from '../config/weddingData';

/* ─── Target: 2027-01-26T10:30:00+05:30 ────────────────────────────────────
   JavaScript's Date constructor fully understands ISO 8601 timezone offsets,
   so `new Date("2027-01-26T10:30:00+05:30")` always resolves to the correct
   UTC instant (2027-01-26T05:00:00Z) regardless of the visitor's local TZ.
   No manual offset arithmetic is needed.
──────────────────────────────────────────────────────────────────────────── */

type TimeLeft = { days: string; hours: string; minutes: string; seconds: string };

function computeTimeLeft(targetMs: number): TimeLeft & { expired: boolean } {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true };

  return {
    days:    String(Math.floor(diff / 86_400_000)).padStart(2, '0'),
    hours:   String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((diff % 3_600_000)  / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((diff % 60_000)     / 1_000)).padStart(2, '0'),
    expired: false,
  };
}

export const Countdown: React.FC = () => {
  // Compute initial state synchronously — avoids a "00" flash on first render
  const targetMs = new Date(weddingData.weddingDateIso).getTime();
  const [{ days, hours, minutes, seconds, expired }, setTimeLeft] = useState(
    () => computeTimeLeft(targetMs)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (expired) return; // already past — no timer needed

    intervalRef.current = setInterval(() => {
      const next = computeTimeLeft(targetMs);
      setTimeLeft(next);
      if (next.expired && intervalRef.current) {
        clearInterval(intervalRef.current); // stop ticking once expired
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once — targetMs is a constant derived from config

  return (
    <section className="section" id="countdown-section">
      <h2 className="section__title reveal-item is-visible">The Big Day Approaches</h2>

      {expired ? (
        <p
          className="section__title reveal-item is-visible"
          style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--gold)', marginTop: 0 }}
        >
          🎉 We're Married! 🎉
        </p>
      ) : (
        <div
          className="countdown__grid reveal-item is-visible"
          role="timer"
          aria-label="Wedding Countdown — Days, Hours, Minutes, Seconds remaining"
          aria-live="off"
        >
          {(
            [
              { value: days,    label: 'Days' },
              { value: hours,   label: 'Hours' },
              { value: minutes, label: 'Minutes' },
              { value: seconds, label: 'Seconds' },
            ] as const
          ).map(({ value, label }) => (
            <div key={label} className="countdown__cell">
              <div className="countdown__box" aria-label={`${value} ${label}`}>
                <span className="countdown__value">{value}</span>
              </div>
              <span className="countdown__label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
