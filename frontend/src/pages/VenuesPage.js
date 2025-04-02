import React, { useState, useEffect } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import FolderIcon from '../components/layout/FolderIcon';
import { venueService } from '../api';

// Add/Edit State Form Component
const StateForm = ({ onSubmit, onCancel, initialData = null, onDelete }) => {
  const [stateName, setStateName] = useState(initialData ? initialData.name : '');
  const [stateAbbreviation, setStateAbbreviation] = useState(initialData ? initialData.abbreviation : '');
  const [error, setError] = useState('');
  
  const isEditMode = !!initialData;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stateName) {
      setError('State name is required');
      return;
    }
    if (!stateAbbreviation) {
      setError('State abbreviation is required');
      return;
    }
    if (stateAbbreviation.length !== 2) {
      setError('State abbreviation must be 2 characters');
      return;
    }
    
    onSubmit({ name: stateName, abbreviation: stateAbbreviation.toUpperCase() });
  };
  
  return (
    <div className="bg-white p-4 rounded shadow-lg">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit State' : 'Add New State'}</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="state-name">
            State Name
          </label>
          <input
            id="state-name"
            type="text"
            className="w-full p-2 border rounded"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="state-abbrev">
            State Abbreviation (2 letters)
          </label>
          <input
            id="state-abbrev"
            type="text"
            className="w-full p-2 border rounded"
            value={stateAbbreviation}
            onChange={(e) => setStateAbbreviation(e.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>
        <div className="flex justify-between items-center">
          {isEditMode && (
            <Button 
              type="button" 
              onClick={() => onDelete(initialData)} 
              className="bg-red-100 hover:bg-red-200"
            >
              Delete State
            </Button>
          )}
          <div className="flex space-x-2 ml-auto">
            <Button type="button" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Update State' : 'Save State'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Add/Edit Venue Form Component
const VenueForm = ({ onSubmit, onCancel, stateId, initialData = null }) => {
  const [venueName, setVenueName] = useState(initialData ? initialData.name : '');
  const [venueCity, setVenueCity] = useState(initialData ? initialData.city : '');
  const [venueCapacity, setVenueCapacity] = useState(initialData ? initialData.capacity : '');
  const [venueAddress, setVenueAddress] = useState(initialData ? initialData.address : '');
  const [venueZipcode, setVenueZipcode] = useState(initialData ? initialData.zipcode : '');
  const [venuePhone, setVenuePhone] = useState(initialData ? initialData.phone : '');
  const [venueEmail, setVenueEmail] = useState(initialData ? initialData.email : '');
  const [venueWebsite, setVenueWebsite] = useState(initialData ? initialData.website?.replace(/^https?:\/\//, '') : '');
  const [venueDescription, setVenueDescription] = useState(initialData ? initialData.description : '');
  const [venueOpenTime, setVenueOpenTime] = useState(initialData ? initialData.open_time : '');
  const [venueCloseTime, setVenueCloseTime] = useState(initialData ? initialData.close_time : '');
  const [venueNotes, setVenueNotes] = useState(initialData ? initialData.notes : '');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'additional'
  const [error, setError] = useState('');
  
  const isEditMode = !!initialData;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!venueName) {
      setError('Venue name is required');
      return;
    }
    if (!venueCity) {
      setError('City is required');
      return;
    }
    
    // Handle website URL - only send if it's not empty, and add https:// if needed
    let formattedWebsite = venueWebsite.trim();
    if (formattedWebsite) {
      if (!formattedWebsite.match(/^https?:\/\//)) {
        formattedWebsite = `https://${formattedWebsite}`;
      }
    } else {
      formattedWebsite = ""; // Ensure it's an empty string, not undefined
    }
    
    onSubmit({
      name: venueName,
      city: venueCity,
      capacity: venueCapacity ? parseInt(venueCapacity, 10) : null,
      state_id: stateId,
      address: venueAddress,
      zipcode: venueZipcode,
      phone: venuePhone,
      email: venueEmail,
      website: formattedWebsite,
      description: venueDescription,
      open_time: venueOpenTime || null,
      close_time: venueCloseTime || null,
      notes: venueNotes
    });
  };
  
  return (
    <div className="bg-white p-4 rounded shadow-lg max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit Venue' : 'Add New Venue'}</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Basic Info
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'additional' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('additional')}
            type="button"
          >
            Additional Info
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-name">
                Venue Name *
              </label>
              <input
                id="venue-name"
                type="text"
                className="w-full p-2 border rounded"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-description">
                Description
              </label>
              <textarea
                id="venue-description"
                className="w-full p-2 border rounded"
                value={venueDescription}
                onChange={(e) => setVenueDescription(e.target.value)}
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-city">
                City *
              </label>
              <input
                id="venue-city"
                type="text"
                className="w-full p-2 border rounded"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-address">
                Address
              </label>
              <input
                id="venue-address"
                type="text"
                className="w-full p-2 border rounded"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-zipcode">
                Zipcode
              </label>
              <input
                id="venue-zipcode"
                type="text"
                className="w-full p-2 border rounded"
                value={venueZipcode}
                onChange={(e) => setVenueZipcode(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-capacity">
                Capacity
              </label>
              <input
                id="venue-capacity"
                type="number"
                className="w-full p-2 border rounded"
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-phone">
                Phone Number
              </label>
              <input
                id="venue-phone"
                type="tel"
                className="w-full p-2 border rounded"
                value={venuePhone}
                onChange={(e) => setVenuePhone(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-email">
                Email
              </label>
              <input
                id="venue-email"
                type="email"
                className="w-full p-2 border rounded"
                value={venueEmail}
                onChange={(e) => setVenueEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-website">
                Website
              </label>
              <input
                id="venue-website"
                type="text"
                className="w-full p-2 border rounded"
                value={venueWebsite}
                onChange={(e) => setVenueWebsite(e.target.value)}
                placeholder="example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                https:// will be added automatically if not included
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="venue-open-time">
                  Opening Time
                </label>
                <input
                  id="venue-open-time"
                  type="time"
                  className="w-full p-2 border rounded"
                  value={venueOpenTime}
                  onChange={(e) => setVenueOpenTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="venue-close-time">
                  Closing Time
                </label>
                <input
                  id="venue-close-time"
                  type="time"
                  className="w-full p-2 border rounded"
                  value={venueCloseTime}
                  onChange={(e) => setVenueCloseTime(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-notes">
                Additional Notes
              </label>
              <textarea
                id="venue-notes"
                className="w-full p-2 border rounded"
                value={venueNotes}
                onChange={(e) => setVenueNotes(e.target.value)}
                rows="3"
                placeholder="Booking contacts, venue amenities, stage info, etc."
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{isEditMode ? 'Update Venue' : 'Save Venue'}</Button>
        </div>
      </form>
    </div>
  );
};

// Venue Detail Modal Component
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

// Confirmation Modal Component
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={onConfirm} className="bg-red-100">Confirm</Button>
        </div>
      </div>
    </div>
  );
};

const VenuesPage = () => {
  const [view, setView] = useState('states'); // 'states' or 'venues'
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
  
  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await venueService.getStates();
        setStates(result || []);
      } catch (err) {
        console.error("Error fetching states:", err);
        setError("Failed to load states. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStates();
  }, []);
  
  // Fetch venues when a state is selected
  useEffect(() => {
    if (selectedState && view === 'venues') {
      const fetchVenues = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const result = await venueService.getVenues(selectedState.id);
          setVenues(result || []);
        } catch (err) {
          console.error("Error fetching venues:", err);
          setError(`Failed to load venues for ${selectedState.name}.`);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVenues();
    }
  }, [selectedState, view]);
  
  const handleStateClick = (state) => {
    setSelectedState(state);
    setView('venues');
  };
  
  const handleBackClick = () => {
    setSelectedState(null);
    setView('states');
  };
  
  const handleAddState = () => {
    setStateToEdit(null);
    setShowStateForm(true);
  };
  
  const handleEditState = (state, e) => {
    e.stopPropagation();
    setStateToEdit(state);
    setShowStateForm(true);
  };
  
  const handleDeleteState = (state, e) => {
    if (e) {
      e.stopPropagation();
    }
    setStateToDelete(state);
  };
  
  const handleAddVenue = () => {
    setVenueToEdit(null);
    setShowVenueForm(true);
  };
  
  const handleEditVenue = (venue) => {
    setVenueToEdit(venue);
    setShowVenueForm(true);
    setShowVenueDetails(false);
  };
  
  const handleDeleteVenue = (venue) => {
    setVenueToDelete(venue);
    setShowVenueDetails(false);
  };
  
  const handleStateFormSubmit = async (stateData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (stateToEdit) {
        // Update existing state
        const updatedState = await venueService.updateState(stateToEdit.id, stateData);
        setStates(states.map(state => 
          state.id === stateToEdit.id ? updatedState : state
        ));
        setStateToEdit(null);
      } else {
        // Create new state
        const newState = await venueService.createState(stateData);
        setStates([...states, newState]);
      }
      setShowStateForm(false);
    } catch (err) {
      console.error(`Error ${stateToEdit ? 'updating' : 'creating'} state:`, err);
      setError(`Failed to ${stateToEdit ? 'update' : 'create'} state. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDeleteState = async () => {
    if (!stateToDelete) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await venueService.deleteState(stateToDelete.id);
      setStates(states.filter(state => state.id !== stateToDelete.id));
      setStateToDelete(null);
    } catch (err) {
      console.error("Error deleting state:", err);
      setError("Failed to delete state. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVenueFormSubmit = async (venueData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert state_id to state for the API
      const apiVenueData = {
        ...venueData,
        state: venueData.state_id  // Change state_id to state for the API
      };
      delete apiVenueData.state_id;

      if (venueToEdit) {
        // Update existing venue
        const updatedVenue = await venueService.updateVenue(venueToEdit.id, apiVenueData);
        setVenues(venues.map(venue => 
          venue.id === venueToEdit.id ? updatedVenue : venue
        ));
        setVenueToEdit(null);
      } else {
        // Create new venue
        const newVenue = await venueService.createVenue(apiVenueData);
        setVenues([...venues, newVenue]);
      }
      setShowVenueForm(false);
    } catch (err) {
      console.error(`Error ${venueToEdit ? 'updating' : 'creating'} venue:`, err);
      setError(`Failed to ${venueToEdit ? 'update' : 'create'} venue. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await venueService.deleteVenue(venueToDelete.id);
      setVenues(venues.filter(venue => venue.id !== venueToDelete.id));
      setVenueToDelete(null);
    } catch (err) {
      console.error("Error deleting venue:", err);
      setError("Failed to delete venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setShowVenueDetails(true);
  };
  
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
          <div>
            {states.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {states.map(state => (
                  <div key={state.id} className="relative">
                    <FolderIcon 
                      name={state.name} 
                      onClick={() => handleStateClick(state)}
                      onNameClick={(e) => handleEditState(state, e)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No states found. Click "Add State" to create your first state folder.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {venues.length > 0 ? (
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
                    {venues.map((venue, index) => (
                      <tr 
                        key={venue.id} 
                        className="cursor-pointer bg-gray-200 hover:bg-gray-300"
                        onClick={() => handleVenueClick(venue)}
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
            ) : (
              <div className="text-center py-8">
                <p>No venues found in {selectedState?.name}. Click "Add Venue" to create your first venue.</p>
              </div>
            )}
          </div>
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