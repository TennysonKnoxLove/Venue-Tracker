import { useState } from 'react';
import Window from '../../components/layout/Window';
import Button from '../../components/layout/Button';
import StateForm from './StateForm';
import VenueForm from './VenueForm';
import VenueDetailModal from './VenueDetailModal';
import ConfirmationModal from './ConfirmationModal';
import StateList from './StateList';
import VenueTable from './VenueTable';
import { useVenueEffects } from './Effects';
import { getStateActions } from './States';
import { getVenueActions } from './VenueActions';

const VenuesPage = () => {
  const [view, setView] = useState('states');
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStateForm, setShowStateForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  const [stateToEdit, setStateToEdit] = useState(null);
  const [stateToDelete, setStateToDelete] = useState(null);
  const [venueToEdit, setVenueToEdit] = useState(null);
  const [venueToDelete, setVenueToDelete] = useState(null);

  useVenueEffects({
    view,
    selectedState,
    setStates,
    setVenues,
    setLoading,
    setError,
  });

  const {
    handleStateClick,
    handleBackClick,
    handleAddState,
    handleEditState,
    handleDeleteState,
    handleStateFormSubmit,
    confirmDeleteState,
  } = getStateActions({
    states,
    setStates,
    stateToEdit,
    setStateToEdit,
    stateToDelete,
    setStateToDelete,
    setSelectedState,
    setView,
    setShowStateForm,
    setLoading,
    setError,
  });

  const {
    handleAddVenue,
    handleEditVenue,
    handleDeleteVenue,
    handleVenueClick,
    handleVenueFormSubmit,
    confirmDeleteVenue,
  } = getVenueActions({
    venues,
    setVenues,
    venueToEdit,
    setVenueToEdit,
    venueToDelete,
    setVenueToDelete,
    setSelectedVenue,
    setShowVenueForm,
    setShowVenueDetails,
    setLoading,
    setError,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {view === 'states' ? 'States' : `Venues in ${selectedState?.name}`}
        </h2>
        <div>
          {view === 'venues' && (
            <Button onClick={handleBackClick} className="mr-2">Back to States</Button>
          )}
          <Button onClick={view === 'states' ? handleAddState : handleAddVenue}>
            Add {view === 'states' ? 'State' : 'Venue'}
          </Button>
        </div>
      </div>

      {showStateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <StateForm
              onSubmit={handleStateFormSubmit}
              onCancel={() => {
                setShowStateForm(false);
                setStateToEdit(null);
              }}
              initialData={stateToEdit}
              onDelete={handleDeleteState}
            />
          </div>
        </div>
      )}

      {stateToDelete && (
        <ConfirmationModal
          message={`Are you sure you want to delete the "${stateToDelete.name}" folder? This will delete all venues in this state.`}
          onConfirm={confirmDeleteState}
          onCancel={() => setStateToDelete(null)}
        />
      )}

      {showVenueForm && selectedState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <VenueForm
              onSubmit={handleVenueFormSubmit}
              onCancel={() => {
                setShowVenueForm(false);
                setVenueToEdit(null);
              }}
              stateId={selectedState.id}
              initialData={venueToEdit}
            />
          </div>
        </div>
      )}

      {venueToDelete && (
        <ConfirmationModal
          message={`Are you sure you want to delete "${venueToDelete.name}"?`}
          onConfirm={confirmDeleteVenue}
          onCancel={() => setVenueToDelete(null)}
        />
      )}

      <Window title={view === 'states' ? 'State Explorer' : 'Venue Explorer'}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p>Loading... Please wait.</p>
          </div>
        ) : view === 'states' ? (
          <StateList
            states={states}
            onStateClick={handleStateClick}
            onEditState={handleEditState}
          />
        ) : (
          <VenueTable
            venues={venues}
            selectedState={selectedState}
            onVenueClick={handleVenueClick}
          />
        )}
      </Window>

      {showVenueDetails && selectedVenue && (
        <VenueDetailModal
          venue={selectedVenue}
          state={selectedState}
          onClose={() => setShowVenueDetails(false)}
          onEdit={() => handleEditVenue(selectedVenue)}
          onDelete={() => handleDeleteVenue(selectedVenue)}
        />
      )}
    </div>
  );
};

export default VenuesPage;
