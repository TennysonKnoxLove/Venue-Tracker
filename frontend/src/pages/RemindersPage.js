import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RemindersDashboard from '../components/reminders/RemindersDashboard';
import ReminderForm from '../components/reminders/ReminderForm';

const RemindersPage = () => {
  return (
    <Routes>
      <Route path="/" element={<RemindersDashboard />} />
      <Route path="new" element={<ReminderForm />} />
      <Route path=":id" element={<ReminderForm />} />
    </Routes>
  );
};

export default RemindersPage; 