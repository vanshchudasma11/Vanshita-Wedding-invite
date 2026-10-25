import React from 'react';
import { weddingData, Ceremony } from '../config/weddingData';

export const EventSection: React.FC = () => {
  return (
    <section className="section events" id="events-section">
      <h2 className="section__title reveal-item is-visible">Wedding Events</h2>

      <div className="events__list">
        {weddingData.ceremonies.map((ceremony: Ceremony) => (
          <article className="event reveal-item is-visible" key={ceremony.id} id={ceremony.id}>
            <header>
              <h3 className="event__name">{ceremony.name}</h3>
              {ceremony.quote && <p className="event__quote">{ceremony.quote}</p>}
              <p className="event__date">{ceremony.displayDate}</p>
              <p className="event__time">{ceremony.time}</p>
            </header>

            <div className="event__image-wrap">
              <img
                className="event__image"
                src={ceremony.image}
                alt={ceremony.name}
                loading="lazy"
              />
            </div>

            <footer className="event__venue">
              <p className="event__venue-label">VENUE</p>
              <p className="event__venue-name">{ceremony.venueName}</p>
              <p className="event__street">{ceremony.venueAddress}</p>
              {ceremony.mapUrl && (
                <a
                  className="map-link"
                  href={ceremony.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  View on Maps
                </a>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};
