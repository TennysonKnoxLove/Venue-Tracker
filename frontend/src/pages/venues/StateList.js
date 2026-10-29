import FolderIcon from '../../components/layout/FolderIcon';

const StateList = ({ states, onStateClick, onEditState }) => {
  if (states.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No states found. Click "Add State" to create your first state folder.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {states.map((state) => (
        <div key={state.id} className="relative">
          <FolderIcon
            name={state.name}
            onClick={() => onStateClick(state)}
            onNameClick={(e) => onEditState(state, e)}
          />
        </div>
      ))}
    </div>
  );
};

export default StateList;
