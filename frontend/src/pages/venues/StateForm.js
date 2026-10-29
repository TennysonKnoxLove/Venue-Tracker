import { useState } from 'react';
import Button from '../../components/layout/Button';

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

export default StateForm;
