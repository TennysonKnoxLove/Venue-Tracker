import { venueService } from '../../api';

export function getVenueActions({
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
}) {
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

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setShowVenueDetails(true);
  };

  const handleVenueFormSubmit = async (venueData) => {
    setLoading(true);
    setError(null);

    try {
      const apiVenueData = {
        ...venueData,
        state: venueData.state_id,
      };
      delete apiVenueData.state_id;

      if (venueToEdit) {
        const updatedVenue = await venueService.updateVenue(venueToEdit.id, apiVenueData);
        setVenues(venues.map((venue) => (
          venue.id === venueToEdit.id ? updatedVenue : venue
        )));
        setVenueToEdit(null);
      } else {
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
      setVenues(venues.filter((venue) => venue.id !== venueToDelete.id));
      setVenueToDelete(null);
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError('Failed to delete venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddVenue,
    handleEditVenue,
    handleDeleteVenue,
    handleVenueClick,
    handleVenueFormSubmit,
    confirmDeleteVenue,
  };
}
