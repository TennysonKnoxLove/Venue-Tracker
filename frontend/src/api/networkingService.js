import client from './client';

// EVENTS
const getEvents = async (filters = {}) => {
  try {
    const response = await client.get('/networking/events/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching networking events:', error);
    throw error;
  }
};

const getEventTypes = async () => {
  try {
    const response = await client.get('/networking/event-types/');
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    throw error;
  }
};

const getEvent = async (id) => {
  try {
    const response = await client.get(`/networking/events/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching networking event ${id}:`, error);
    throw error;
  }
};

const createEvent = async (eventData) => {
  try {
    const response = await client.post('/networking/events/', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating networking event:', error);
    throw error;
  }
};

const updateEvent = async (id, eventData) => {
  try {
    const response = await client.put(`/networking/events/${id}/`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating networking event ${id}:`, error);
    throw error;
  }
};

const deleteEvent = async (id) => {
  try {
    await client.delete(`/networking/events/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting networking event ${id}:`, error);
    throw error;
  }
};

const getUpcomingEvents = async () => {
  try {
    const response = await client.get('/networking/events/upcoming/');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

const getPastEvents = async () => {
  try {
    const response = await client.get('/networking/events/past/');
    return response.data;
  } catch (error) {
    console.error('Error fetching past events:', error);
    throw error;
  }
};

const addAttendee = async (eventId, contactId, notes = '') => {
  try {
    const data = { contact: contactId, notes };
    const response = await client.post(`/networking/events/${eventId}/add_attendee/`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding attendee to event:', error);
    throw error;
  }
};

const removeAttendee = async (eventId, contactId) => {
  try {
    const data = { contact: contactId };
    await client.post(`/networking/events/${eventId}/remove_attendee/`, data);
    return true;
  } catch (error) {
    console.error('Error removing attendee from event:', error);
    throw error;
  }
};

// OPPORTUNITIES
const getOpportunities = async (filters = {}) => {
  try {
    const response = await client.get('/networking/opportunities/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching networking opportunities:', error);
    throw error;
  }
};

const searchOpportunities = async (state, city, radius) => {
  try {
    const data = { state, city, radius };
    const response = await client.post('/networking/opportunities-search/', data);
    return response.data;
  } catch (error) {
    console.error('Error searching for networking opportunities:', error);
    throw error;
  }
};

const getOpportunity = async (id) => {
  try {
    const response = await client.get(`/networking/opportunities/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching networking opportunity ${id}:`, error);
    throw error;
  }
};

const createOpportunity = async (opportunityData) => {
  try {
    const response = await client.post('/networking/opportunities/', opportunityData);
    return response.data;
  } catch (error) {
    console.error('Error creating networking opportunity:', error);
    throw error;
  }
};

const updateOpportunity = async (id, opportunityData) => {
  try {
    const response = await client.put(`/networking/opportunities/${id}/`, opportunityData);
    return response.data;
  } catch (error) {
    console.error(`Error updating networking opportunity ${id}:`, error);
    throw error;
  }
};

const deleteOpportunity = async (id) => {
  try {
    await client.delete(`/networking/opportunities/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting networking opportunity ${id}:`, error);
    throw error;
  }
};

const updateOpportunityStatus = async (id, status) => {
  try {
    console.log('Updating opportunity status to:', status);
    // Check if the status is valid based on backend error message
    const validStatuses = ['active', 'interviewing', 'offer_received', 'accepted', 'declined', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Use the update_status endpoint specifically designed for status updates
    const response = await client.post(`/networking/opportunities/${id}/update_status/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for opportunity ${id}:`, error);
    throw error;
  }
};

const getActiveOpportunities = async () => {
  try {
    const response = await client.get('/networking/opportunities/active/');
    return response.data;
  } catch (error) {
    console.error('Error fetching active opportunities:', error);
    throw error;
  }
};

const getClosedOpportunities = async () => {
  try {
    const response = await client.get('/networking/opportunities/closed/');
    return response.data;
  } catch (error) {
    console.error('Error fetching closed opportunities:', error);
    throw error;
  }
};

// MILESTONES
const getMilestones = async (opportunityId = null) => {
  try {
    const params = {};
    if (opportunityId) {
      params.opportunity = opportunityId;
    }
    const response = await client.get('/networking/milestones/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
};

const addMilestone = async (opportunityId, milestoneData) => {
  try {
    const data = {
      ...milestoneData,
      opportunity: opportunityId
    };
    const response = await client.post(`/networking/opportunities/${opportunityId}/add_milestone/`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
};

const toggleMilestoneCompletion = async (id) => {
  try {
    const response = await client.post(`/networking/milestones/${id}/toggle_completed/`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling milestone ${id} completion:`, error);
    throw error;
  }
};

const updateMilestone = async (id, milestoneData) => {
  try {
    const response = await client.put(`/networking/milestones/${id}/`, milestoneData);
    return response.data;
  } catch (error) {
    console.error(`Error updating milestone ${id}:`, error);
    throw error;
  }
};

const deleteMilestone = async (id) => {
  try {
    await client.delete(`/networking/milestones/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting milestone ${id}:`, error);
    throw error;
  }
};

export default {
  // Events
  getEvents,
  getEventTypes,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getPastEvents,
  addAttendee,
  removeAttendee,
  
  // Opportunities
  getOpportunities,
  searchOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
  getActiveOpportunities,
  getClosedOpportunities,
  
  // Milestones
  getMilestones,
  addMilestone,
  toggleMilestoneCompletion,
  updateMilestone,
  deleteMilestone
}; 