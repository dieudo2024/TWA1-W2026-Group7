function BrowseSearchForm({
  query,
  location,
  guests,
  onQueryChange,
  onLocationChange,
  onGuestsChange,
  onClear,
}) {
  return (
    <form className="browse-card browse-search">
      <div className="browse-card-header">
        <h2>Search</h2>
        <p>Start with a location, dates, and a quick keyword.</p>
      </div>
      <div className="browse-form">
        <label className="browse-field">
          <span>Keyword</span>
          <input
            className="browse-input"
            type="text"
            placeholder="Lake house, cabin, skyline..."
            value={query}
            onChange={onQueryChange}
          />
        </label>
        <label className="browse-field">
          <span>Location</span>
          <input
            className="browse-input"
            type="text"
            placeholder="Montreal, QC"
            value={location}
            onChange={onLocationChange}
          />
        </label>
        <label className="browse-field">
          <span>Guests</span>
          <input
            className="browse-input"
            type="number"
            min="1"
            max="16"
            value={guests}
            onChange={onGuestsChange}
          />
        </label>
        <button type="button" className="browse-submit" onClick={onClear}>
          Clear filters
        </button>
      </div>
    </form>
  )
}

export default BrowseSearchForm
