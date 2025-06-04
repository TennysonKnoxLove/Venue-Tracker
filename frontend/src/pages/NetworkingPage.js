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

  // Define opportunity types for display
  const opportunityTypes = {
    'job': 'Job Posting',
    'internship': 'Internship',
    'contract': 'Contract',
    'collaboration': 'Collaboration',
    'other': 'Other',
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