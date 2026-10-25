import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

/* ────────────────────────────────────────────────
   Types
──────────────────────────────────────────────── */
interface RsvpRow {
  serial_no: number | null;
  id: string;
  guest_name: string;
  phone: string;
  will_attend: boolean;
  guest_count: number;
  message: string | null;
  created_at: string;
}

type SortField = 'created_at' | 'guest_name';
type SortDir = 'asc' | 'desc';
type AttendFilter = 'all' | 'attending' | 'not_attending';

/* ────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */
function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function toCSV(rows: RsvpRow[]): string {
  const header = ['Serial No', 'Guest Name', 'Phone', 'Attending', 'Guests', 'Message', 'Submitted At'];
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.serial_no ?? '',
        r.guest_name,
        r.phone,
        r.will_attend ? 'Yes' : 'No',
        r.guest_count,
        r.message ?? '',
        formatDateTime(r.created_at),
      ]
        .map(escape)
        .join(',')
    ),
  ];
  return lines.join('\n');
}

function downloadCSV(rows: RsvpRow[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvp-responses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ────────────────────────────────────────────────
   Dashboard Component
──────────────────────────────────────────────── */
export const FamilyDashboard: React.FC = () => {
  const { user, signOut, familyStatus } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Controls
  const [search, setSearch] = useState('');
  const [attendFilter, setAttendFilter] = useState<AttendFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ── Fetch ─────────────────────────────────── */
  const fetchRsvps = useCallback(async () => {
    if (familyStatus !== 'authorized' || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const { data, error, count } = await supabase
        .from('rsvp_responses')
        .select('*', { count: 'exact' })
        .order(sortField, { ascending: sortDir === 'asc' });

      // Development-only safe console logging (no passwords or keys)
      if (import.meta.env.DEV) {
        console.info('[Dashboard Query Log]', {
          userEmail: user.email,
          returnedRowCount: data ? data.length : 0,
          totalExactCount: count,
          error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
        });
      }

      if (error) {
        console.error('[Dashboard Query Error]', error);
        setFetchError(`${error.message} (Code: ${error.code || 'unknown'})`);
        setLoading(false);
        return;
      }

      const mappedRows: RsvpRow[] = (data || []).map((r: Record<string, unknown>, idx: number) => {
        const rawSerial = r.serial_no != null && !isNaN(Number(r.serial_no)) ? Number(r.serial_no) : idx + 1;
        return {
          serial_no: rawSerial,
          id: String(r.id || idx),
          guest_name: String(r.guest_name || r.name || 'Anonymous Guest'),
          phone: String(r.phone || ''),
          will_attend: Boolean(r.will_attend),
          guest_count: Number(r.guest_count ?? (r.will_attend ? 1 : 0)),
          message: r.message ? String(r.message) : null,
          created_at: String(r.created_at || new Date().toISOString()),
        };
      });

      setRows(mappedRows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Dashboard Fetch Exception]', err);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDir, familyStatus, user]);

  useEffect(() => {
    if (familyStatus === 'authorized' && user) {
      fetchRsvps();
    }
  }, [fetchRsvps, familyStatus, user]);

  /* ── Derived data ───────────────────────────── */
  const filtered = rows.filter((r) => {
    const matchSearch =
      search.trim() === '' ||
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search.trim());

    const matchAttend =
      attendFilter === 'all' ||
      (attendFilter === 'attending' && r.will_attend) ||
      (attendFilter === 'not_attending' && !r.will_attend);

    return matchSearch && matchAttend;
  });

  const totalResponses = rows.length;
  const totalAttending = rows.filter((r) => r.will_attend).length;
  const totalNotAttending = rows.filter((r) => !r.will_attend).length;
  const totalGuestsExpected = rows
    .filter((r) => r.will_attend)
    .reduce((sum, r) => sum + (r.guest_count ?? 0), 0);

  /* ── Sort toggle ────────────────────────────── */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/family-login', { replace: true });
  };

  /* ── Render ─────────────────────────────────── */
  return (
    <div className="dash">
      {/* ── Header ─────────────────────────── */}
      <header className="dash-header">
        <div className="dash-header__left">
          <div className="dash-monogram" aria-hidden="true">V&amp;A</div>
          <div>
            <h1 className="dash-title">RSVP Dashboard</h1>
            <p className="dash-subtitle">Vanshita &amp; Ankit — Wedding</p>
          </div>
        </div>
        <div className="dash-header__right">
          <span className="dash-user" title={user?.email}>{user?.email}</span>
          <button
            id="dash-signout-btn"
            className="dash-signout"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="dash-main">
        {/* ── Summary Cards ──────────────────── */}
        <section className="dash-cards" aria-label="Summary">
          <div className="dash-card dash-card--primary">
            <span className="dash-card__label">Total Responses</span>
            <span className="dash-card__value">{loading ? '—' : totalResponses}</span>
          </div>
          <div className="dash-card dash-card--green">
            <span className="dash-card__label">Attending</span>
            <span className="dash-card__value">{loading ? '—' : totalAttending}</span>
          </div>
          <div className="dash-card dash-card--red">
            <span className="dash-card__label">Not Attending</span>
            <span className="dash-card__value">{loading ? '—' : totalNotAttending}</span>
          </div>
          <div className="dash-card dash-card--gold">
            <span className="dash-card__label">Guests Expected</span>
            <span className="dash-card__value">{loading ? '—' : totalGuestsExpected}</span>
            <span className="dash-card__note">from attending RSVPs</span>
          </div>
        </section>

        {/* ── Controls ───────────────────────── */}
        <section className="dash-controls" aria-label="Filters and actions">
          <input
            id="dash-search"
            className="dash-search"
            type="search"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search guests"
          />

          <div className="dash-filter-group" role="group" aria-label="Attendance filter">
            {(['all', 'attending', 'not_attending'] as AttendFilter[]).map((f) => (
              <button
                key={f}
                id={`dash-filter-${f}`}
                className={`dash-filter-btn ${attendFilter === f ? 'is-active' : ''}`}
                onClick={() => setAttendFilter(f)}
                type="button"
              >
                {f === 'all' ? 'All' : f === 'attending' ? '✓ Attending' : '✗ Not Attending'}
              </button>
            ))}
          </div>

          <div className="dash-actions">
            <button
              id="dash-refresh-btn"
              className="dash-action-btn"
              onClick={fetchRsvps}
              type="button"
              disabled={loading}
              aria-label="Refresh RSVP list"
            >
              {loading ? 'Loading…' : '↻ Refresh'}
            </button>
            <button
              id="dash-csv-btn"
              className="dash-action-btn dash-action-btn--export"
              onClick={() => downloadCSV(filtered)}
              type="button"
              disabled={loading || filtered.length === 0}
              aria-label="Export filtered results as CSV"
            >
              ↓ Export CSV
            </button>
          </div>
        </section>

        {/* ── Error ──────────────────────────── */}
        {fetchError && (
          <div className="dash-error" role="alert" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#dc2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong>Could not load RSVP records:</strong> {fetchError}
              </div>
              <button
                type="button"
                onClick={fetchRsvps}
                style={{ padding: '0.4rem 0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Table ──────────────────────────── */}
        <section className="dash-table-wrap" aria-label="RSVP responses table">
          {!loading && !fetchError && filtered.length === 0 ? (
            <div className="dash-empty">
              <p style={{ margin: 0 }}>
                {search || attendFilter !== 'all'
                  ? 'No responses match your filters.'
                  : 'No RSVP responses yet.'}
              </p>
              {import.meta.env.DEV && !search && attendFilter === 'all' && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666', background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', maxWidth: '600px', marginInline: 'auto', textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Zero rows returned from Supabase.</p>
                  <p style={{ margin: '0.25rem 0 0' }}>
                    If records exist in <code>public.rsvp_responses</code>, Supabase Row-Level Security (RLS) is hiding them from <code>{user?.email}</code> because an active SELECT policy is missing.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <table className="dash-table" aria-rowcount={filtered.length}>
              <thead>
                <tr>
                  <th className="dash-th dash-th--num" scope="col">#</th>
                  <th
                    className={`dash-th dash-th--sortable ${sortField === 'guest_name' ? 'is-sorted' : ''}`}
                    scope="col"
                    onClick={() => toggleSort('guest_name')}
                    aria-sort={
                      sortField === 'guest_name'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    Guest Name
                    {sortField === 'guest_name' && (
                      <span aria-hidden="true">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="dash-th" scope="col">Phone</th>
                  <th className="dash-th" scope="col">Status</th>
                  <th className="dash-th dash-th--num" scope="col">Guests</th>
                  <th className="dash-th dash-th--msg" scope="col">Message</th>
                  <th
                    className={`dash-th dash-th--sortable ${sortField === 'created_at' ? 'is-sorted' : ''}`}
                    scope="col"
                    onClick={() => toggleSort('created_at')}
                    aria-sort={
                      sortField === 'created_at'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    Submitted
                    {sortField === 'created_at' && (
                      <span aria-hidden="true">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="dash-row dash-row--skeleton">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j}><span className="dash-skel" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={`dash-row ${r.will_attend ? 'dash-row--yes' : 'dash-row--no'}`}
                      >
                        <td className="dash-td dash-td--num">{idx + 1}</td>
                        <td className="dash-td dash-td--name">{r.guest_name}</td>
                        <td className="dash-td dash-td--phone">{r.phone}</td>
                        <td className="dash-td">
                          <span
                            className={`dash-badge ${r.will_attend ? 'dash-badge--yes' : 'dash-badge--no'}`}
                          >
                            {r.will_attend ? '✓ Attending' : '✗ Declined'}
                          </span>
                        </td>
                        <td className="dash-td dash-td--num">
                          {r.will_attend ? r.guest_count : '—'}
                        </td>
                        <td className="dash-td dash-td--msg">
                          {r.message ? (
                            <span title={r.message}>{r.message}</span>
                          ) : (
                            <span className="dash-empty-cell">—</span>
                          )}
                        </td>
                        <td className="dash-td dash-td--date">
                          {formatDateTime(r.created_at)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          )}
        </section>

        {!loading && filtered.length > 0 && (
          <p className="dash-count">
            Showing {filtered.length} of {totalResponses} response{totalResponses !== 1 ? 's' : ''}
          </p>
        )}
      </main>
    </div>
  );
};
