import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConnectionList from '../components/network/ConnectionList';
import ConnectionDetail from '../components/network/ConnectionDetail';
import ConnectionForm from '../components/network/ConnectionForm';

const NetworkPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ConnectionList />} />
      <Route path="connections" element={<ConnectionList />} />
      <Route path="connections/:id" element={<ConnectionDetail />} />
      <Route path="connections/new" element={<ConnectionForm />} />
      <Route path="connections/:id/edit" element={<ConnectionForm />} />
    </Routes>
  );
};

export default NetworkPage; 