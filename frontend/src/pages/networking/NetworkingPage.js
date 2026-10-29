import { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import EventsDashboard from './EventsDashboard';
import OpportunitiesList from './OpportunitiesList';
import EventForm from './EventForm';
import OpportunityForm from './OpportunityForm';
import EventDetail from './EventDetail';
import moment from 'moment';
import NetworkingMainPage from './NetworkingMainPage';
import { useOpportunityEffects } from './Effects';
import AltPage from './AltPage';

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
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);

  const opportunityTypes = {
    'job': 'Job Posting',
    'internship': 'Internship',
    'contract': 'Contract',
    'collaboration': 'Collaboration',
    'other': 'Other',
  };

  useOpportunityEffects({
    id,
    setOpportunity,
    setContact,
    setLoading,
    setError,
  });

  if (loading || error || !opportunity) {
    return <AltPage loading={loading} error={error} opportunity={opportunity} />;
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