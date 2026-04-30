function BrowseResultCard({ title, location, price, tag, imageUrl }) {
  const mediaStyle = imageUrl
    ? { backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <article className="browse-result-card">
      <div className="browse-result-media" style={mediaStyle} aria-hidden="true" />
      <div className="browse-result-body">
        <p className="browse-result-tag">{tag}</p>
        <h3>{title}</h3>
        <p>{location}</p>
        <p>{price}</p>
      </div>
    </article>
  )
}

export default BrowseResultCard
