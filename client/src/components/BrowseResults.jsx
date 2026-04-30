import BrowseResultCard from './BrowseResultCard'

function BrowseResults({ activeFilters, results, isLoading, errorMessage }) {
  return (
    <section className="browse-results" aria-live="polite">
      <div className="browse-results-header">
        <div>
          <h2>Preview results</h2>
          <p>Showing listings that match your current view.</p>
        </div>
        <div className="browse-chips" aria-label="Active filters">
          {activeFilters.slice(0, 6).map((filter) => (
            <span key={filter} className="browse-chip">{filter}</span>
          ))}
        </div>
      </div>
      {isLoading ? (
        <p className="browse-empty">Loading listings...</p>
      ) : errorMessage ? (
        <p className="browse-empty">{errorMessage}</p>
      ) : results.length === 0 ? (
        <p className="browse-empty">No listings found yet.</p>
      ) : (
        <div className="browse-cards">
          {results.map((item) => (
            <BrowseResultCard
              key={item.id}
              id={item.id}
              title={item.title}
              location={item.location}
              price={item.price}
              tag={item.tag}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BrowseResults
