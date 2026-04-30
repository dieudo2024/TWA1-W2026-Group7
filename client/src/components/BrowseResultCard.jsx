import { Link } from 'react-router-dom'

function BrowseResultCard({ id, title, location, price, tag, imageUrl }) {
  const mediaStyle = imageUrl
    ? { backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <Link className="browse-result-card" to={`/listings/${id}`}>
      <div className="browse-result-media" style={mediaStyle} aria-hidden="true" />
      <div className="browse-result-body">
        <p className="browse-result-tag">{tag}</p>
        <h3>{title}</h3>
        <p>{location}</p>
        <p>{price}</p>
      </div>
    </Link>
  )
}

export default BrowseResultCard
