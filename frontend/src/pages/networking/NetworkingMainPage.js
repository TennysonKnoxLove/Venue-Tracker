import { useSearchParams } from 'react-router-dom';
import EventsDashboard from './EventsDashboard';
import OpportunitiesList from './OpportunitiesList';

const NetworkingMainPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'opportunities' ? 'opportunities' : 'events';

  const selectTab = (tab) => {
    setSearchParams(tab === 'opportunities' ? { tab: 'opportunities' } : {}, { replace: true });
  };

  return (
    <div className="window-win98 p-0">
      <div className="window-title-win98 flex items-center justify-between">
        <div className="text-black font-bold px-2">Networking</div>
      </div>
      <div className="p-2 bg-gray-200">
        <div className="flex border-b border-gray-500">
          <button
            className={`tab-win98 ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => selectTab('events')}
          >
            Industry Events
          </button>
          <button
            className={`tab-win98 ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => selectTab('opportunities')}
          >
            Career Opportunities
          </button>
        </div>

        <div className="p-2">
          {activeTab === 'events' && <EventsDashboard />}
          {activeTab === 'opportunities' && <OpportunitiesList />}
        </div>
      </div>
    </div>
  );
};

export default NetworkingMainPage;
