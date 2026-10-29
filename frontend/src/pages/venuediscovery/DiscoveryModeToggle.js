import Window from '../../components/layout/Window';

const modeButtonClass = (active) => (
  active
    ? 'bg-[#c0c0c0] border-[#808080] border-r-[#ffffff] border-b-[#ffffff] font-bold'
    : 'bg-[#c0c0c0] border-[#ffffff] border-r-[#808080] border-b-[#808080]'
);

const DiscoveryModeToggle = ({ discoveryMode, onToggle }) => (
  <Window title="Discovery Mode" className="mb-4">
    <div className="flex justify-center mb-4">
      <div className="inline-flex border-0 space-x-2">
        <button
          onClick={() => discoveryMode === 'opportunities' && onToggle()}
          className={`px-4 py-2 text-sm border-2 ${modeButtonClass(discoveryMode === 'venues')}`}
        >
          Venues
        </button>
        <button
          onClick={() => discoveryMode === 'venues' && onToggle()}
          className={`px-4 py-2 text-sm border-2 ${modeButtonClass(discoveryMode === 'opportunities')}`}
        >
          Networking Opportunities
        </button>
      </div>
    </div>
  </Window>
);

export default DiscoveryModeToggle;
