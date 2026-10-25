import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FamilyRsvpFloatingButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/family-rsvp');
  };

  return (
    <button
      type="button"
      id="family-rsvp-floating-button"
      className="family-rsvp-floating-btn"
      onClick={handleClick}
      aria-label="Family RSVP"
      title="Family RSVP"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e8c978 0%, #c9a227 50%, #b38728 100%)',
        border: '1px solid rgba(255, 255, 255, 0.45)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(110, 31, 47, 0.15)',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, filter 0.25s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg
        width="20"
        height="16"
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block', pointerEvents: 'none' }}
      >
        <path
          d="M2 3H18M2 8H18M2 13H18"
          stroke="#6e1f2f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default FamilyRsvpFloatingButton;
