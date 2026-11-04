import Window from '../../components/layout/Window';
import Button from '../../components/layout/Button';

const SavedMark = () => (
  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
    ✓
  </div>
);

const VenueResult = ({ venue, index, saved, onSave }) => (
  <div className="border p-4">
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-bold">{venue.name || 'N/A'}</h3>
      {saved ? <SavedMark /> : <Button onClick={() => onSave(venue, index)}>Save</Button>}
    </div>
    <p className="text-sm my-2">{venue.description || 'N/A'}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <p><strong>Address:</strong> {[venue.address, venue.city, venue.state, venue.zipcode].filter(Boolean).join(', ') || 'N/A'}</p>
      <p><strong>Phone:</strong> {venue.phone || 'N/A'}</p>
      <p><strong>Email:</strong> {venue.email || 'N/A'}</p>
      <p><strong>Website:</strong> {venue.website
        ? <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{venue.website}</a>
        : 'N/A'}</p>
      <p><strong>Capacity:</strong> {venue.capacity || 'N/A'}</p>
      <p><strong>Opens:</strong> {venue.open_time || 'N/A'}</p>
      <p><strong>Closes:</strong> {venue.close_time || 'N/A'}</p>
      <p><strong>Genres:</strong> {venue.genres || 'N/A'}</p>
    </div>
  </div>
);

const OpportunityResult = ({ opportunity, index, saved, onSave }) => (
  <div className="border p-4">
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-bold">{opportunity.title}</h3>
      {saved ? <SavedMark /> : <Button onClick={() => onSave(opportunity, index)}>Save</Button>}
    </div>
    <p className="text-sm my-2">{opportunity.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <p><strong>Organization:</strong> {opportunity.organization}</p>
      <p><strong>Location:</strong> {opportunity.location}</p>
      {opportunity.deadline && (
        <p><strong>Deadline:</strong> {opportunity.deadline}</p>
      )}
      <p><strong>Type:</strong> {opportunity.opportunity_type}</p>
      {opportunity.website && (
        <p><strong>Website:</strong> <a href={opportunity.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{opportunity.website}</a></p>
      )}
      {opportunity.compensation && (
        <p><strong>Compensation:</strong> {opportunity.compensation}</p>
      )}
    </div>
  </div>
);

const DiscoveryResults = ({
  discoveryMode,
  isSearching,
  hasSearched,
  searchResults,
  error,
  currentSearchId,
  savedItems,
  onSave,
}) => {
  const resultLabel = discoveryMode === 'venues' ? 'venues' : 'opportunities';

  return (
    <Window title="Search Results">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isSearching ? (
        <div className="text-center py-8">
          <p>Searching for {resultLabel}... Please wait.</p>
        </div>
      ) : hasSearched ? (
        searchResults.length > 0 ? (
          <div>
            <div className="mb-4">
              <p>Found {searchResults.length} {resultLabel} matching your criteria.</p>
              {currentSearchId && (
                <p className="text-sm text-gray-500">Search ID: {currentSearchId}</p>
              )}
            </div>

            <div className="space-y-4">
              {discoveryMode === 'venues'
                ? searchResults.map((venue, index) => (
                  <VenueResult
                    key={index}
                    venue={venue}
                    index={index}
                    saved={savedItems.includes(index)}
                    onSave={onSave}
                  />
                ))
                : searchResults.map((opportunity, index) => (
                  <OpportunityResult
                    key={index}
                    opportunity={opportunity}
                    index={index}
                    saved={savedItems.includes(index)}
                    onSave={onSave}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No {resultLabel} found matching your criteria. Try different search parameters.</p>
          </div>
        )
      ) : (
        <div className="text-center py-8">
          <p>Enter search parameters and click "Discover {discoveryMode === 'venues' ? 'Venues' : 'Opportunities'}" to start searching.</p>
        </div>
      )}
    </Window>
  );
};

export default DiscoveryResults;
