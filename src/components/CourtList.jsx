import { useMemo, useState } from 'react'
import { useCourts } from '../context/CourtsContext.jsx'
import CourtCard from './CourtCard.jsx'

export default function CourtList() {
  const { courts, loading, error } = useCourts()
  const [setting, setSetting] = useState('All')
  const [surface, setSurface] = useState('All')

  const settings = useMemo(() => ['All', ...new Set(courts.map((c) => c.setting))], [courts])
  const surfaces = useMemo(() => ['All', ...new Set(courts.map((c) => c.surface))], [courts])

  const filtered = courts.filter(
    (c) => (setting === 'All' || c.setting === setting) && (surface === 'All' || c.surface === surface),
  )

  return (
    <section>
      <div className="page-intro">
        <h1>Find a court near you</h1>
        <p>Pick a court, choose a day and time, and book instantly.</p>
      </div>

      {error && <p className="banner banner--error">Couldn't load courts: {error}</p>}

      {loading ? (
        <p className="empty-state">Loading courts…</p>
      ) : (
        <>
          <div className="filters">
            <label>
              Setting
              <select value={setting} onChange={(e) => setSetting(e.target.value)}>
                {settings.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Surface
              <select value={surface} onChange={(e) => setSurface(e.target.value)}>
                {surfaces.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">No courts match those filters.</p>
          ) : (
            <div className="court-grid">
              {filtered.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
