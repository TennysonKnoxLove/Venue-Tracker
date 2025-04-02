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

const updateCategory = async (id, categoryData) => {
  try {
    const response = await client.put(`/reminders/categories/${id}/`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating reminder category ${id}:`, error);
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    await client.delete(`/reminders/categories/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting reminder category ${id}:`, error);
    throw error;
  }
};

const getReminders = async (filters = {}) => {
  try {
    const response = await client.get('/reminders/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
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

const deleteReminder = async (id) => {
  try {
    await client.delete(`/reminders/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting reminder ${id}:`, error);
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

const getTodayReminders = async () => {
  try {
    const response = await client.get('/reminders/today/');
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s reminders:', error);
    throw error;
  }
};

const getNotifications = async (read = null) => {
  try {
    const params = {};
    if (read !== null) {
      params.read = read;
    }
    const response = await client.get('/notifications/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

const markNotificationRead = async (id) => {
  try {
    const response = await client.post(`/notifications/${id}/mark_read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};

const markAllNotificationsRead = async () => {
  try {
    const response = await client.post('/notifications/mark_all_read/');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  getOverdueReminders,
  getUpcomingReminders,
  getTodayReminders,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
}; 