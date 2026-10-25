import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, RsvpPayload } from '../lib/supabase';

export const RsvpSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    attendingStatus: 'Joyfully yes' as 'Joyfully yes' | 'Regretfully no',
    guests: 1,
    message: '',
  });

  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGuestChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      guests: Math.max(1, Math.min(10, prev.guests + delta)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: { fullName?: string; phoneNumber?: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please add your name to the boarding pass.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please add a phone number we can reach you on.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Verify Supabase environment configuration
    if (!isSupabaseConfigured) {
      setSubmitError(
        'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const willAttend = formData.attendingStatus === 'Joyfully yes';
      const payload: RsvpPayload = {
        guest_name: formData.fullName.trim(),
        phone: formData.phoneNumber.trim(),
        will_attend: willAttend,
        guest_count: willAttend ? formData.guests : 0,
        message: formData.message.trim() || null,
      };

      const { error } = await supabase.from('rsvp_responses').insert([payload]);

      if (error) {
        throw error;
      }

      // Success: Show confirmation only after the database confirms the insert
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('RSVP submission error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to submit RSVP. Please check your connection and try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      attendingStatus: 'Joyfully yes',
      guests: 1,
      message: '',
    });
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <section className="section rsvp" id="rsvp-section">
      <h2 className="section__title reveal-item is-visible">Kindly Respond</h2>
      <p className="rsvp__lead reveal-item is-visible">
        Your seat on our journey is waiting &mdash; fill in your boarding pass.
      </p>

      <div
        className={`pass reveal-item is-visible ${isSubmitted ? 'is-issued' : ''} ${
          formData.attendingStatus === 'Regretfully no' ? 'is-regret' : ''
        }`}
      >
        {/* Airline Top Banner */}
        <div className="pass__band">
          <span className="pass__airline">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
            The Wedding Express
          </span>
          <span>Boarding Pass</span>
        </div>

        {/* Origin / Destination Route */}
        <div className="pass__route">
          <div className="pass__city">
            <span className="pass__code">AMD</span>
            <span className="pass__place">Ahmedabad</span>
            <span className="pass__when">24 Jan 2027</span>
          </div>
          <div className="pass__path" aria-hidden="true">
            <span className="pass__dash" />
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
            <span className="pass__dash" />
          </div>
          <div className="pass__city pass__city--to">
            <span className="pass__code">KBR</span>
            <span className="pass__place">Kabir Farm</span>
            <span className="pass__when">26 Jan 2027</span>
          </div>
        </div>

        {/* Boarding Pass Form */}
        {!isSubmitted ? (
          <form className="pass__form" onSubmit={handleSubmit} noValidate>
            <div className="pass__body">
              <div className="pass__field">
                <label className="pass__label" htmlFor="rsvp-name">
                  YOUR NAME *
                </label>
                <input
                  className={`pass__input ${errors.fullName ? 'is-bad' : ''}`}
                  id="rsvp-name"
                  type="text"
                  placeholder="Full name"
                  value={formData.fullName}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
              </div>

              <div className="pass__field">
                <label className="pass__label" htmlFor="rsvp-phone">
                  PHONE NUMBER *
                </label>
                <input
                  className={`pass__input ${errors.phoneNumber ? 'is-bad' : ''}`}
                  id="rsvp-phone"
                  type="tel"
                  placeholder="+91 ..."
                  value={formData.phoneNumber}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value });
                    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                  }}
                />
                {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}
              </div>

              <fieldset className="pass__field">
                <legend className="pass__label">WILL YOU ATTEND?</legend>
                <div className="choices">
                  <label className="choice">
                    <input
                      type="radio"
                      name="attendingStatus"
                      value="Joyfully yes"
                      checked={formData.attendingStatus === 'Joyfully yes'}
                      disabled={isSubmitting}
                      onChange={() => setFormData({ ...formData, attendingStatus: 'Joyfully yes' })}
                    />
                    <span className="choice__card">
                      <span className="choice__name">Joyfully yes</span>
                    </span>
                  </label>
                  <label className="choice choice--regret">
                    <input
                      type="radio"
                      name="attendingStatus"
                      value="Regretfully no"
                      checked={formData.attendingStatus === 'Regretfully no'}
                      disabled={isSubmitting}
                      onChange={() => setFormData({ ...formData, attendingStatus: 'Regretfully no' })}
                    />
                    <span className="choice__card">
                      <span className="choice__name">Regretfully no</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {formData.attendingStatus === 'Joyfully yes' && (
                <div className="pass__field">
                  <p className="pass__label">NUMBER OF GUESTS</p>
                  <div className="counter">
                    <button
                      type="button"
                      onClick={() => handleGuestChange(-1)}
                      disabled={isSubmitting}
                      aria-label="One guest fewer"
                    >
                      &minus;
                    </button>
                    <output aria-label="Number of guests">{formData.guests}</output>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(1)}
                      disabled={isSubmitting}
                      aria-label="One guest more"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="pass__field">
                <label className="pass__label" htmlFor="rsvp-message">
                  A MESSAGE FOR THE COUPLE
                </label>
                <textarea
                  className="pass__input"
                  id="rsvp-message"
                  rows={2}
                  placeholder="Your blessings & wishes..."
                  value={formData.message}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {submitError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(217, 83, 79, 0.1)',
                    border: '1px solid rgba(217, 83, 79, 0.4)',
                    color: '#d9534f',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                  }}
                  role="alert"
                >
                  {submitError}
                </div>
              )}
            </div>

            {/* Perforated Tear Line */}
            <div className="pass__tear" aria-hidden="true" />

            <div className="pass__stub">
              <span className="pass__barcode" aria-hidden="true" />
              <button className="pass__send" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Issuing Pass...' : 'Send RSVP'}
              </button>
            </div>
          </form>
        ) : (
          /* Issued Confirmation Ticket - Only shown after database confirms insert */
          <div className="pass__issued" tabIndex={-1}>
            <span className="pass__stamp">
              {formData.attendingStatus === 'Joyfully yes' ? 'Confirmed' : 'Warmly Noted'}
            </span>
            <p className="pass__label">PASSENGER</p>
            <p className="pass__guest">{formData.fullName}</p>

            {formData.attendingStatus === 'Joyfully yes' && (
              <div className="pass__summary">
                <div>
                  <p className="pass__label">SEATS RESERVED</p>
                  <p className="pass__value">
                    {formData.guests} Guest{formData.guests > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            <p className="pass__note">
              {formData.attendingStatus === 'Joyfully yes'
                ? 'Thank you for celebrating with us! Your RSVP has been confirmed in our guest list. We cannot wait to welcome you to our wedding festivities.'
                : 'Thank you for letting us know. You will be dearly missed, and your warm blessings remain in our hearts.'}
            </p>

            <button className="rsvp__again" type="button" onClick={handleReset}>
              Send another response
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
