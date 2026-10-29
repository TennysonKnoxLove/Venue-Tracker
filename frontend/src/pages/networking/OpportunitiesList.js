import React, { useState, useEffect } from 'react';
import { networkingService } from '../../api';
import { Link } from 'react-router-dom';
import moment from 'moment';

const OpportunitiesList = () => {
  const [loading, setLoading] = useState(true);
  const [activeOpportunities, setActiveOpportunities] = useState([]);
  const [closedOpportunities, setClosedOpportunities] = useState([]);
  const [opportunityTypeFilter, setOpportunityTypeFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Define opportunity types and status options
  const opportunityTypes = [
    { value: 'job', label: 'Job Posting', color: 'bg-blue-500' },
    { value: 'gig', label: 'Gig', color: 'bg-green-500' },
    { value: 'collaboration', label: 'Collaboration', color: 'bg-purple-500' },
    { value: 'mentorship', label: 'Mentorship', color: 'bg-cyan-500' },
    { value: 'funding', label: 'Funding Opportunity', color: 'bg-yellow-500' },
    { value: 'contest', label: 'Contest', color: 'bg-orange-500' },
    { value: 'residency', label: 'Residency', color: 'bg-pink-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
  ];

  const statusLabels = {
    active: 'Active',
    interviewing: 'Interviewing',
    offer_received: 'Offer Received',
    accepted: 'Accepted',
    declined: 'Declined',
    closed: 'Closed'
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const [activeData, closedData] = await Promise.all([
        networkingService.getActiveOpportunities(),
        networkingService.getClosedOpportunities()
      ]);
      
      setActiveOpportunities(activeData);
      setClosedOpportunities(closedData);
    } catch (error) {
      console.error('Error fetching networking opportunities:', error);
      alert('Failed to load networking opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (opportunityId, status) => {
    try {
      await networkingService.updateOpportunityStatus(opportunityId, status);
      
      // Find the opportunity to update
      const opportunity = [...activeOpportunities, ...closedOpportunities]
        .find(opp => opp.id === opportunityId);
      
      if (!opportunity) return;
      
      // Update the opportunity status
      const updatedOpportunity = { ...opportunity, status };
      
      // Remove from the current list and add to the appropriate list
      const isActiveStatus = ['active', 'interviewing', 'offer_received'].includes(status);
      
      if (isActiveStatus) {
        setActiveOpportunities(
          activeOpportunities.some(o => o.id === opportunityId)
            ? activeOpportunities.map(o => o.id === opportunityId ? updatedOpportunity : o)
            : [...activeOpportunities, updatedOpportunity]
        );
        setClosedOpportunities(closedOpportunities.filter(o => o.id !== opportunityId));
      } else {
        setClosedOpportunities(
          closedOpportunities.some(o => o.id === opportunityId)
            ? closedOpportunities.map(o => o.id === opportunityId ? updatedOpportunity : o)
            : [...closedOpportunities, updatedOpportunity]
        );
        setActiveOpportunities(activeOpportunities.filter(o => o.id !== opportunityId));
      }
      
      alert(`Status updated to ${statusLabels[status]}`);
    } catch (error) {
      console.error('Error updating opportunity status:', error);
      alert('Failed to update status: ' + (error.response?.data?.error || error.message));
    }
  };

  const getOpportunityTypeDisplay = (type) => {
    const opportunityType = opportunityTypes.find(t => t.value === type) || opportunityTypes[7]; // default to "other"
    
    return (
      <span className={`${opportunityType.color} text-white text-xs px-1 rounded`}>
        {opportunityType.label}
      </span>
    );
  };

  const getStatusDisplay = (status) => {
    const statusColors = {
      active: 'bg-blue-500',
      interviewing: 'bg-purple-500',
      offer_received: 'bg-yellow-500',
      accepted: 'bg-green-500',
      declined: 'bg-red-500',
      closed: 'bg-gray-500'
    };
    
    return (
      <span className={`${statusColors[status] || 'bg-gray-400'} text-white text-xs px-1 rounded`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const filterOpportunities = (opportunities) => {
    return opportunities.filter(item => {
      const matchesType = !opportunityTypeFilter || item.opportunity_type === opportunityTypeFilter;
      const matchesSearch = !searchText || 
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  };

  const renderOpportunityStatusBar = (status) => {
    const statuses = ['active', 'interviewing', 'offer_received', 
      status === 'accepted' ? 'accepted' : 
      status === 'declined' ? 'declined' : 
      status === 'closed' ? 'closed' : 'closed'];
      
    const currentIndex = statuses.indexOf(status);
    
    return (
      <div className="w-full flex bg-gray-200 border border-gray-500 h-5 mt-2">
        {statuses.map((stepStatus, index) => {
          const isActive = index <= currentIndex;
          const isLast = index === statuses.length - 1;
          let bgColor = 'bg-gray-300'; // default for inactive
          
          if (isActive) {
            if (status === 'declined' || status === 'closed') {
              bgColor = 'bg-red-500'; // all active segments are red for declined/closed
            } else {
              bgColor = 'bg-green-500'; // all active segments are green for other statuses
            }
          }
          
          return (
            <div 
              key={index} 
              className={`h-full ${bgColor} ${!isLast ? 'border-r border-gray-500' : ''}`}
              style={{ width: `${100 / statuses.length}%` }}
            ></div>
          );
        })}
      </div>
    );
  };

  const handleFilterChange = (e) => {
    setOpportunityTypeFilter(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const renderOpportunityList = (opportunities) => {
    const filteredOpportunities = filterOpportunities(opportunities);
    
    if (filteredOpportunities.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="file-icon mx-auto"></div>
          </div>
          <div>No opportunities found</div>
        </div>
      );
    }
    
    return (
      <div className="list-view">
        {filteredOpportunities.map(item => (
          <div key={item.id} className="p-3 border-b border-gray-400 hover:bg-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Link to={`/networking/opportunities/${item.id}`} className="text-blue-800 underline font-bold">
                    {item.title}
                  </Link>
                  <span className="ml-2">{getOpportunityTypeDisplay(item.opportunity_type)}</span>
                  <span className="ml-2">{getStatusDisplay(item.status)}</span>
                </div>
                <div className="font-bold mt-1">{item.organization}</div>
              </div>
            </div>
            
            <div className="pl-2 my-2">
              {item.deadline && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">⏰</span>
                  Deadline: {moment(item.deadline).format('MMM D, YYYY')}
                </div>
              )}
              
              {item.location && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">📍</span>
                  {item.location}
                </div>
              )}
              
              {item.compensation !== null && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">💰</span>
                  {typeof item.compensation === 'number' 
                    ? (item.compensation > 0 ? `$${item.compensation}` : 'Unpaid') 
                    : item.compensation || 'Not specified'}
                </div>
              )}
              
              {renderOpportunityStatusBar(item.status)}
              
              {item.description && (
                <div className="my-2 text-gray-700 line-clamp-2">
                  {item.description}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/networking/opportunities/${item.id}`} className="btn-win98 text-sm">
                View Details
              </Link>
              
              <div className="relative inline-block">
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                  className="border-2 border-gray-400 bg-white p-1 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer_received">Offer Received</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-900 text-white p-1 font-bold">
          Career Opportunities
        </div>
        <Link to="/networking/opportunities/new" className="btn-win98">
          + Add Opportunity
        </Link>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search opportunities"
          value={searchText}
          onChange={handleSearch}
          className="border-2 border-gray-400 bg-white p-1 flex-grow"
        />
        
        <select
          value={opportunityTypeFilter}
          onChange={handleFilterChange}
          className="border-2 border-gray-400 bg-white p-1"
        >
          <option value="">All types</option>
          {opportunityTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <button 
          onClick={() => {
            setOpportunityTypeFilter('');
            setSearchText('');
          }}
          className="btn-win98"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-400">
          <button
            className={`tab-win98 mr-1 ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Opportunities ({activeOpportunities.length})
          </button>
          <button
            className={`tab-win98 ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed Opportunities
          </button>
        </div>
        
        <div className="mt-2 p-2 bg-white border-2 border-gray-400 inset">
          {activeTab === 'active' && renderOpportunityList(activeOpportunities)}
          {activeTab === 'closed' && renderOpportunityList(closedOpportunities)}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesList; 