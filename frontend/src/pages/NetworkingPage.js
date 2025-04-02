import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { networkingService, networkService } from '../api';
import EventsDashboard from '../components/networking/EventsDashboard';
import OpportunitiesList from '../components/networking/OpportunitiesList';
import EventForm from '../components/networking/EventForm';
import OpportunityForm from '../components/networking/OpportunityForm';
import EventDetail from '../components/networking/EventDetail';
import moment from 'moment';
import { win98Alert, win98Confirm } from '../utils/modalService';

const NetworkingMainPage = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="window-win98 p-0">
      <div className="window-title-win98 flex items-center justify-between">
        <div className="text-black font-bold px-2">Networking</div>
      </div>
      <div className="p-2 bg-gray-200">
        <div className="flex border-b border-gray-500">
          <button
            className={`tab-win98 ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Industry Events
          </button>
          <button
            className={`tab-win98 ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
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

const NetworkingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<NetworkingMainPage />} />
      <Route path="events" element={<EventsDashboard />} />
      <Route path="events/new" element={<EventForm />} />
      <Route path="events/:id" element={<EventDetail />} />
      <Route path="events/:id/edit" element={<EventForm />} />
      <Route path="opportunities" element={<OpportunitiesList />} />
      <Route path="opportunities/new" element={<OpportunityForm />} />
      <Route path="opportunities/:id" element={<OpportunityDetail />} />
      <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
    </Routes>
  );
};

// Detailed opportunity component that shows all data
const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Define opportunity types and status options for display
  const opportunityTypes = {
    'job': 'Job Posting',
    'internship': 'Internship',
    'contract': 'Contract',
    'collaboration': 'Collaboration',
    'other': 'Other',
  };

  // Updated to match exactly what the backend error message says are valid values
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer_received', label: 'Offer Received' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'closed', label: 'Closed' }
  ];

  const statusLabels = {
    'active': 'Active',
    'interviewing': 'Interviewing',
    'offer_received': 'Offer Received',
    'accepted': 'Accepted',
    'declined': 'Declined',
    'closed': 'Closed'
  };

  const statusColors = {
    'active': 'bg-blue-500',
    'interviewing': 'bg-purple-500',
    'offer_received': 'bg-yellow-500',
    'accepted': 'bg-green-500',
    'declined': 'bg-red-500',
    'closed': 'bg-gray-500'
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setShowStatusMenu(false);
      
      // Confirm the status change with the exact backend status value
      const confirmed = await win98Confirm(
        `Change status to "${statusLabels[newStatus]}"?`,
        'Change Status',
        'question'
      );
      
      if (!confirmed) return;
      
      console.log(`Updating opportunity ${id} status to:`, newStatus);
      
      // Instead of using the service function, we'll use a direct API call for debugging
      await networkingService.updateOpportunity(id, { status: newStatus });
      
      // Show success message
      await win98Alert(
        `Status updated to "${statusLabels[newStatus]}"`,
        'Status Updated',
        'info'
      );
      
      // Update the local state
      setOpportunity({
        ...opportunity,
        status: newStatus
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Show detailed error message to help debugging
      let errorMessage = 'Failed to update status. ';
      
      if (error.response) {
        errorMessage += `Server responded with status ${error.response.status}. `;
        
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            errorMessage += '\n\nDetails:\n' + JSON.stringify(error.response.data, null, 2);
          } else {
            errorMessage += error.response.data;
          }
        }
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      await win98Alert(errorMessage, 'Error', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const opportunityData = await networkingService.getOpportunity(id);
        setOpportunity(opportunityData);
        
        // If there's a contact, get the contact details
        if (opportunityData.contact) {
          try {
            const contactData = await networkService.getConnection(opportunityData.contact);
            setContact(contactData);
          } catch (contactError) {
            console.error('Error fetching contact:', contactError);
          }
        }
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading opportunity details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-red-100 shadow p-4 inline-block">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-red-100 shadow p-4 inline-block">
          <div className="text-red-600">Opportunity not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="window-win98">
      <div className="window-title-win98">
        <div className="text-black font-bold px-2">
          Opportunity Details
        </div>
      </div>
      <div className="p-4 bg-gray-200">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{opportunity.title}</h2>
          <div className="relative">
            <button 
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`${statusColors[opportunity.status] || 'bg-gray-400'} text-white px-2 py-1 text-sm rounded hover:opacity-90 flex items-center`}
            >
              {statusLabels[opportunity.status] || opportunity.status}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showStatusMenu && (
              <div className="absolute right-0 mt-1 w-48 border-2 border-gray-400 bg-gray-200 shadow-lg z-10">
                <div className="window-title-win98 flex items-center justify-between p-1">
                  <div className="text-black text-xs font-bold">Change Status</div>
                  <button 
                    onClick={() => setShowStatusMenu(false)}
                    className="text-black text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="p-1">
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className={`w-full text-left p-1 mb-1 text-sm hover:bg-blue-600 hover:text-white ${opportunity.status === status.value ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-bold">Organization</h3>
              <p>{opportunity.organization}</p>
            </div>
            
            <div>
              <h3 className="font-bold">Opportunity Type</h3>
              <p>{opportunityTypes[opportunity.opportunity_type] || opportunity.opportunity_type}</p>
            </div>

            <div>
              <h3 className="font-bold">Location</h3>
              <p>{opportunity.location || 'Not specified'}</p>
              {opportunity.remote && <p className="text-green-600">Remote available</p>}
            </div>

            <div>
              <h3 className="font-bold">Compensation</h3>
              <p>{opportunity.compensation || 'Not specified'}</p>
            </div>

            {opportunity.deadline && (
              <div>
                <h3 className="font-bold">Application Deadline</h3>
                <p>{moment(opportunity.deadline).format('MMMM D, YYYY')}</p>
              </div>
            )}

            {opportunity.application_url && (
              <div>
                <h3 className="font-bold">Application Link</h3>
                <a 
                  href={opportunity.application_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Apply Here
                </a>
              </div>
            )}
          </div>

          {contact && (
            <div className="border-t border-gray-300 pt-4 mb-4">
              <h3 className="font-bold">Contact Person</h3>
              <p>{contact.name}</p>
              {contact.email && <p>Email: {contact.email}</p>}
              {contact.phone && <p>Phone: {contact.phone}</p>}
            </div>
          )}

          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-bold">Description</h3>
            <p className="whitespace-pre-line">{opportunity.description || 'No description available'}</p>
          </div>

          {opportunity.notes && (
            <div className="border-t border-gray-300 pt-4 mt-4">
              <h3 className="font-bold">Notes</h3>
              <p className="whitespace-pre-line">{opportunity.notes}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <a href={`/networking/opportunities/${id}/edit`} className="btn-win98">
            Edit Opportunity
          </a>
          <a href="/networking/opportunities" className="btn-win98">
            Back to List
          </a>
        </div>
      </div>
    </div>
  );
};

export default NetworkingPage; 