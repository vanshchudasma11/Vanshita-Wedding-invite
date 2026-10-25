import React from 'react';
import { weddingData } from '../config/weddingData';

export const PostcardThankYou: React.FC = () => {
  return (
    <footer className="footer" id="thankyou-section">
      <div className="postcard reveal-item is-visible">
        <div className="postcard__paper">
          <div className="postcard__message">
            <p className="postcard__thanks">Thank You</p>
            <p className="postcard__text">
              for being part of our journey, celebrating every sacred ritual and joyful beat.
              Your love, presence, and blessings mean the world to us.
            </p>
            <p className="postcard__sign">
              With love,
              <span>{weddingData.brideName} &amp; {weddingData.groomName}</span>
            </p>
          </div>

          <div className="postcard__address">
            <div className="postcard__marks">
              <div className="postcard__postmark" aria-hidden="true">
                <span>Ahmedabad</span>
                <strong>26 &middot; 01 &middot; 27</strong>
                <span>India</span>
              </div>
              <div className="postcard__stamp">
                <img
                  src={weddingData.monogramImage}
                  alt="Wedding Monogram"
                  loading="lazy"
                  width="110"
                  height="110"
                />
              </div>
            </div>

            <p className="postcard__to">TO</p>
            <ul className="postcard__lines">
              <li>Our dear family</li>
              <li>&amp; friends,</li>
              <li>with all our love</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="footer__credit">
        A little piece of forever, crafted with love &bull; {weddingData.brideName} &amp; {weddingData.groomName} Wedding 2027
      </p>

      <div className="footer__signature-wrap">
        <div className="footer__signature-divider" aria-hidden="true">
          <span className="footer__divider-line" />
          <svg
            className="footer__divider-heart"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="footer__divider-line" />
        </div>

        <p className="footer__signature">
          <svg
            className="footer__flourish"
            viewBox="0 0 32 12"
            width="26"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2 6 C8 2, 12 10, 18 6 S 26 2, 30 6" />
            <circle cx="16" cy="6" r="1.5" fill="currentColor" />
          </svg>
          <span>Created by Vansh Chudasma</span>
          <svg
            className="footer__flourish"
            viewBox="0 0 32 12"
            width="26"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2 6 C8 2, 12 10, 18 6 S 26 2, 30 6" />
            <circle cx="16" cy="6" r="1.5" fill="currentColor" />
          </svg>
        </p>
      </div>
    </footer>
  );
};
