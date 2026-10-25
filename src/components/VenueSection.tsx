import React from 'react';
import { weddingData } from '../config/weddingData';

export const VenueSection: React.FC = () => {
  return (
    <section className="section" id="venue-section">
      <h2 className="section__title reveal-item is-visible">Wedding Venue</h2>

      <div className="venue-section">
        <div className="venue-card reveal-item is-visible">
          <p className="event__venue-label" style={{ marginBottom: '0.8rem' }}>CELEBRATION VENUE</p>
          <h3 className="venue-card__title">{weddingData.mainVenue.name}</h3>
          <p className="venue-card__address">
            {weddingData.mainVenue.road} {weddingData.mainVenue.city}
          </p>

          <div className="venue-map-wrap">
            <iframe
              title="Map to Kabir Farm, Ahmedabad"
              className="venue-map-iframe"
              src={weddingData.mainVenue.mapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <a
            className="map-link"
            href={weddingData.mainVenue.mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '13px', padding: '12px 28px' }}
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
            Get Directions to Venue
          </a>
        </div>
      </div>
    </section>
  );
};
