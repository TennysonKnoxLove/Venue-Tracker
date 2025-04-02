import client from './client';

const getIndustries = async () => {
  try {
    const response = await client.get('/network/contacts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching industries:', error);
    throw error;
  }
};

const getConnections = async (filters = {}) => {
  try {
    const response = await client.get('/network/contacts/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }
};

const getConnection = async (id) => {
  try {
    const response = await client.get(`/network/contacts/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching connection ${id}:`, error);
    throw error;
  }
};

const createConnection = async (connectionData) => {
  try {
    const response = await client.post('/network/contacts/', connectionData);
    return response.data;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw error;
  }
};

const updateConnection = async (id, connectionData) => {
  try {
    const response = await client.put(`/network/contacts/${id}/`, connectionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating connection ${id}:`, error);
    throw error;
  }
};

const deleteConnection = async (id) => {
  try {
    await client.delete(`/network/contacts/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting connection ${id}:`, error);
    throw error;
  }
};

const getInteractions = async (connectionId = null) => {
  try {
    const url = connectionId 
      ? `/network/contacts/${connectionId}/social_links/` 
      : '/network/contacts/';
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
};

const createInteraction = async (connectionId, interactionData) => {
  try {
    const response = await client.post(`/network/contacts/${connectionId}/social-links/`, interactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }
};

const getConnectionsDueForFollowup = async () => {
  try {
    const response = await client.get('/network/contacts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching connections due for followup:', error);
    throw error;
  }
};

export default {
  getIndustries,
  getConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  getInteractions,
  createInteraction,
  getConnectionsDueForFollowup
}; 