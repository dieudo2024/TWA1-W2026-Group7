function BrowseFilters({
  priceMin,
  priceMax,
  rating,
  selectedRoomType,
  selectedAmenities,
  roomTypes,
  amenities,
  onPriceMinChange,
  onPriceMaxChange,
  onRatingChange,
  onRoomTypeChange,
  onAmenityToggle,
}) {
  return (
    <div className="browse-card browse-filters">
      <div className="browse-card-header">
        <h2>Filters</h2>
        <p>Dial in the vibe with price, rating, and amenities.</p>
      </div>
      <div className="browse-form">
        <label className="browse-field">
          <span>Price range</span>
          <div className="browse-range">
            <input
              className="browse-input"
              type="number"
              min="20"
              max="500"
              value={priceMin}
              onChange={onPriceMinChange}
            />
            <span className="browse-range-sep">to</span>
            <input
              className="browse-input"
              type="number"
              min="20"
              max="500"
              value={priceMax}
              onChange={onPriceMaxChange}
            />
          </div>
        </label>
        <label className="browse-field">
          <span>Minimum rating</span>
          <select
            className="browse-input"
            value={rating}
            onChange={onRatingChange}
          >
            <option value="4.8">4.8+</option>
            <option value="4.5">4.5+</option>
            <option value="4.2">4.2+</option>
            <option value="4.0">4.0+</option>
          </select>
        </label>
        <label className="browse-field">
          <span>Room type</span>
          <select
            className="browse-input"
            value={selectedRoomType}
            onChange={onRoomTypeChange}
          >
            {roomTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <fieldset className="browse-field browse-amenities">
          <legend>Amenities</legend>
          {amenities.map((amenity) => (
            <label key={amenity} className="browse-checkbox">
              <input
                type="checkbox"
                checked={selectedAmenities.has(amenity)}
                onChange={() => onAmenityToggle(amenity)}
              />
              <span>{amenity}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  )
}

export default BrowseFilters
