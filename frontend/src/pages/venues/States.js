import { venueService } from '../../api';

export function getStateActions({
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
}) {
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

  const handleStateFormSubmit = async (stateData) => {
    setLoading(true);
    setError(null);

    try {
      if (stateToEdit) {
        const updatedState = await venueService.updateState(stateToEdit.id, stateData);
        setStates(states.map((state) => (
          state.id === stateToEdit.id ? updatedState : state
        )));
        setStateToEdit(null);
      } else {
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
      setStates(states.filter((state) => state.id !== stateToDelete.id));
      setStateToDelete(null);
    } catch (err) {
      console.error('Error deleting state:', err);
      setError('Failed to delete state. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleStateClick,
    handleBackClick,
    handleAddState,
    handleEditState,
    handleDeleteState,
    handleStateFormSubmit,
    confirmDeleteState,
  };
}
