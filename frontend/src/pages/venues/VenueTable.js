const VenueTable = ({ venues, selectedState, onVenueClick }) => {
  if (venues.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No venues found in {selectedState?.name}. Click "Add Venue" to create your first venue.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-400 border-t-white border-l-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="py-2 px-3 text-left font-bold border border-gray-500 border-t-2 border-l-2 border-t-white border-l-white">Name</th>
            <th className="py-2 px-3 text-left font-bold border border-gray-500 border-t-2 border-l-2 border-t-white border-l-white">City</th>
            <th className="py-2 px-3 text-left font-bold border border-gray-500 border-t-2 border-l-2 border-t-white border-l-white">State</th>
            <th className="py-2 px-3 text-left font-bold border border-gray-500 border-t-2 border-l-2 border-t-white border-l-white">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <tr
              key={venue.id}
              className="cursor-pointer bg-gray-200 hover:bg-gray-300"
              onClick={() => onVenueClick(venue)}
            >
              <td className="py-1 px-3 border border-gray-400">{venue.name}</td>
              <td className="py-1 px-3 border border-gray-400">{venue.city}</td>
              <td className="py-1 px-3 border border-gray-400">{selectedState.abbreviation}</td>
              <td className="py-1 px-3 border border-gray-400">{venue.capacity || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VenueTable;
