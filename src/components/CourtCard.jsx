import { Link } from 'react-router-dom'

export default function CourtCard({ court }) {
  return (
    <div className="court-card">
      <div className="court-card__top">
        <h3>{court.name}</h3>
        <span className={`badge badge--${court.setting.toLowerCase()}`}>{court.setting}</span>
      </div>
      <p className="court-card__location">{court.location}</p>
      <p className="court-card__desc">{court.description}</p>
      <div className="court-card__meta">
        <span>{court.surface} surface</span>
        <span>${court.pricePerHour}/hr</span>
      </div>
      <Link className="btn btn--primary" to={`/courts/${court.id}`}>
        View availability
      </Link>
    </div>
  )
}
