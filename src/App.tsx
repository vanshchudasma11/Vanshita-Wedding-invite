import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FamilyLogin } from './pages/FamilyLogin';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { Preloader } from './components/Preloader';
import { OpeningGateHero } from './components/OpeningGateHero';
import { MusicControl } from './components/MusicControl';
import { InvitationCard } from './components/InvitationCard';
import { ScratchCard } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { EventSection } from './components/EventSection';
import { VenueSection } from './components/VenueSection';
import { RsvpSection } from './components/RsvpSection';
import { PostcardThankYou } from './components/PostcardThankYou';
import { FamilyRsvpFloatingButton } from './components/FamilyRsvpFloatingButton';

/* ─── Public Wedding Invitation ──────────────────────────── */
const WeddingInvitation: React.FC = () => {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Lock scroll while preloader and unopened cover is shown
  useEffect(() => {
    document.documentElement.classList.add('is-locked');
    document.body.classList.add('is-locked');
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Intersection observer for delicate scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [hasOpened]);

  return (
    <div className="app-container">
      {/* 0. Family RSVP Floating Button */}
      <FamilyRsvpFloatingButton />

      {/* 1. Preloader */}
      <Preloader isDone={isPreloaderDone} />

      {/* 2. Opening Hero with Wax Seal and Gate Animation */}
      <OpeningGateHero
        onOpen={() => setHasOpened(true)}
        onReady={() => setIsPreloaderDone(true)}
      />

      {/* 3. Floating Music Control */}
      <MusicControl shouldPlay={hasOpened} visible={hasOpened} />

      {/* 4. Invitation Card */}
      <InvitationCard />

      {/* 5. Scratch Date Reveal */}
      <ScratchCard />

      {/* 6. Live Countdown */}
      <Countdown />

      {/* 7. Wedding Ceremonies */}
      <EventSection />

      {/* 8. Celebration Venue */}
      <VenueSection />

      {/* 9. RSVP Boarding Pass */}
      <RsvpSection />

      {/* 10. Thank You Postcard */}
      <PostcardThankYou />
    </div>
  );
};

/* ─── Root App with Router ───────────────────────────────── */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public wedding invitation */}
          <Route path="/" element={<WeddingInvitation />} />

          {/* Family-only login (no link from public site) */}
          <Route path="/family-login" element={<FamilyLogin />} />

          {/* Protected family RSVP dashboard */}
          <Route
            path="/family-rsvp"
            element={
              <ProtectedRoute>
                <FamilyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: back to invitation */}
          <Route path="*" element={<WeddingInvitation />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
