import Button from '../../components/layout/Button';

const VenueDetailModal = ({ venue, state, onClose, onEdit, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{venue.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-gray-700">Location</h4>
            <p className="mb-1">{venue.city}, {state.abbreviation}</p>
            {venue.address && <p className="mb-1">{venue.address}</p>}
            {venue.zipcode && <p className="mb-1">{venue.zipcode}</p>}

            {venue.capacity && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-700">Capacity</h4>
                <p>{venue.capacity} people</p>
              </div>
            )}
          </div>

          <div>
            {(venue.phone || venue.email || venue.website) && (
              <>
                <h4 className="font-bold text-gray-700">Contact</h4>
                {venue.phone && <p className="mb-1">Phone: {venue.phone}</p>}
                {venue.email && <p className="mb-1">Email: {venue.email}</p>}
                {venue.website && (
                  <p className="mb-1">
                    Website: <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{venue.website.replace(/^https?:\/\//, '')}</a>
                  </p>
                )}
              </>
            )}

            {(venue.open_time || venue.close_time) && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-700">Hours</h4>
                {venue.open_time && venue.close_time ? (
                  <p>{venue.open_time} - {venue.close_time}</p>
                ) : (
                  <p>
                    {venue.open_time ? `Opens: ${venue.open_time}` : ''}
                    {venue.close_time ? `Closes: ${venue.close_time}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {venue.description && (
          <div className="mt-4">
            <h4 className="font-bold text-gray-700">Description</h4>
            <p className="mt-1">{venue.description}</p>
          </div>
        )}

        {venue.notes && (
          <div className="mt-4">
            <h4 className="font-bold text-gray-700">Notes</h4>
            <p className="mt-1">{venue.notes}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {new Date(venue.created_at).toLocaleDateString()}</p>
          {venue.updated_at && venue.updated_at !== venue.created_at && (
            <p>Last updated: {new Date(venue.updated_at).toLocaleDateString()}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button onClick={onEdit} className="bg-gray-200 hover:bg-gray-300">Edit Venue</Button>
          <Button onClick={onDelete} className="bg-red-100 hover:bg-red-200">Delete Venue</Button>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailModal;
