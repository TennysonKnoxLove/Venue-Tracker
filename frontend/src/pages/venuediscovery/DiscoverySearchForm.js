import Window from '../../components/layout/Window';
import Button from '../../components/layout/Button';
import Input from '../../components/layout/Input';

const DiscoverySearchForm = ({
  searchParams,
  discoveryMode,
  isSearching,
  onChange,
  onSubmit,
}) => (
  <Window title="Search Parameters" className="mb-4">
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="State"
          id="state"
          name="state"
          value={searchParams.state}
          onChange={onChange}
          placeholder="e.g. California"
          required
        />

        {discoveryMode === 'venues' ? (
          <>
            <Input
              label="City"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={onChange}
              placeholder="e.g. Los Angeles"
              required
            />

            <Input
              type="number"
              label="Radius (miles)"
              id="radius"
              name="radius"
              value={searchParams.radius}
              onChange={onChange}
              min="1"
              max="100"
            />
          </>
        ) : (
          <div className="md:col-span-2">
            <label className="block mb-1">Search Terms</label>
            <textarea
              id="searchTerms"
              name="searchTerms"
              value={searchParams.searchTerms}
              onChange={onChange}
              placeholder="e.g. music events, artist opportunities, music industry networking"
              className="w-full border-2 border-gray-400 bg-white p-1"
              rows="3"
              required
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : `Discover ${discoveryMode === 'venues' ? 'Venues' : 'Opportunities'}`}
        </Button>
      </div>
    </form>
  </Window>
);

export default DiscoverySearchForm;
