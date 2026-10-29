import { useVenueDiscovery } from './useVenueDiscovery';
import DiscoveryAlert from './DiscoveryAlert';
import DiscoveryModeToggle from './DiscoveryModeToggle';
import DiscoverySearchForm from './DiscoverySearchForm';
import DiscoveryResults from './DiscoveryResults';

const VenueDiscoveryPage = () => {
  const {
    searchParams,
    isSearching,
    searchResults,
    hasSearched,
    error,
    currentSearchId,
    showAlert,
    alertMessage,
    savedItems,
    discoveryMode,
    handleChange,
    toggleDiscoveryMode,
    handleSubmit,
    handleSaveItem,
    closeAlert,
  } = useVenueDiscovery();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">AI Discovery</h2>

      <DiscoveryAlert
        open={showAlert}
        message={alertMessage}
        onClose={closeAlert}
      />

      <DiscoveryModeToggle
        discoveryMode={discoveryMode}
        onToggle={toggleDiscoveryMode}
      />

      <DiscoverySearchForm
        searchParams={searchParams}
        discoveryMode={discoveryMode}
        isSearching={isSearching}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <DiscoveryResults
        discoveryMode={discoveryMode}
        isSearching={isSearching}
        hasSearched={hasSearched}
        searchResults={searchResults}
        error={error}
        currentSearchId={currentSearchId}
        savedItems={savedItems}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default VenueDiscoveryPage;
