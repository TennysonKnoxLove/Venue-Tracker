import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Venue Tracker</h1>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer className="mt-6 text-center text-sm">
        <p>© 2023 Venue Tracker</p>
      </footer>
    </div>
  );
};

export default MainLayout; 