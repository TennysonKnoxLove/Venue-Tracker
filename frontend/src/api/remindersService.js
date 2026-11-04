import client from './client';

const getCategories = async () => {
  try {
    const response = await client.get('/reminders/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching reminder categories:', error);
    throw error;
  }
};

const createCategory = async (categoryData) => {
  try {
    const response = await client.post('/reminders/categories/', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating reminder category:', error);
    throw error;
  }
};

const getReminder = async (id) => {
  try {
    const response = await client.get(`/reminders/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reminder ${id}:`, error);
    throw error;
  }
};

const createReminder = async (reminderData) => {
  try {
    const response = await client.post('/reminders/', reminderData);
    return response.data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

const updateReminder = async (id, reminderData) => {
  try {
    const response = await client.put(`/reminders/${id}/`, reminderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating reminder ${id}:`, error);
    throw error;
  }
};

const completeReminder = async (id) => {
  try {
    const response = await client.post(`/reminders/${id}/complete/`);
    return response.data;
  } catch (error) {
    console.error(`Error completing reminder ${id}:`, error);
    throw error;
  }
};

const getOverdueReminders = async () => {
  try {
    const response = await client.get('/reminders/overdue/');
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    throw error;
  }
};

const getUpcomingReminders = async () => {
  try {
    const response = await client.get('/reminders/upcoming/');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    throw error;
  }
};

const remindersService = {
  getCategories,
  createCategory,
  getReminder,
  createReminder,
  updateReminder,
  completeReminder,
  getOverdueReminders,
  getUpcomingReminders,
};

export default remindersService; 