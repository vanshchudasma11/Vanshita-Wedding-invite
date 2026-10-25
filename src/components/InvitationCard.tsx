import React from 'react';
import { weddingData } from '../config/weddingData';

export const InvitationCard: React.FC = () => {
  return (
    <section className="section" id="invitation">
      <div className="card invite__card reveal-item is-visible">
        <div className="invite__onkar" aria-hidden="true">
          {weddingData.shloka.symbol}
        </div>

        <p className="invite__shabad" lang="hi">
          {weddingData.shloka.text.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < weddingData.shloka.text.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>

        <h2 className="invite__heading">We Cordially Invite You</h2>

        <p className="invite__lead">
          Together with our beloved families,<br />
          we request the honour of your gracious presence<br />
          to celebrate the wedding of
        </p>

        <div className="invite__couple-frame">
          <img
            src={weddingData.couplePhoto}
            alt={`${weddingData.brideName} and ${weddingData.groomName}`}
            loading="lazy"
          />
        </div>

        <div>
          <h1 className="invite__name">{weddingData.brideName}</h1>
          <div className="invite__with">&amp;</div>
          <h1 className="invite__name">{weddingData.groomName}</h1>
        </div>
      </div>
    </section>
  );
};
