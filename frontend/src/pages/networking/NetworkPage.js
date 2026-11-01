import { Routes, Route } from 'react-router-dom';
import ConnectionList from './ConnectionList';
import ConnectionDetail from './ConnectionDetail';
import ConnectionForm from './ConnectionForm';

const NetworkPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ConnectionList />} />
      <Route path="connections" element={<ConnectionList />} />
      <Route path="connections/new" element={<ConnectionForm />} />
      <Route path="connections/:id" element={<ConnectionDetail />} />
      <Route path="connections/:id/edit" element={<ConnectionForm />} />
    </Routes>
  );
};

export default NetworkPage;
