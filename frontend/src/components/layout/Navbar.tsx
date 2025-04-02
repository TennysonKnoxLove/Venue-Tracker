import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-primary text-white border-b-2 border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="font-bold text-xl">
            <Link to="/" className="flex items-center">
              <span className="mr-1">📁</span> Venue Tracker
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-1">
              <li>
                <Link 
                  to="/" 
                  className={`px-3 py-1 block ${isActive('/') ? 'bg-secondary' : 'hover:bg-opacity-20 hover:bg-white'}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/audio" 
                  className={`px-3 py-1 block ${isActive('/audio') ? 'bg-secondary' : 'hover:bg-opacity-20 hover:bg-white'}`}
                >
                  Audio Editor
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacts" 
                  className={`px-3 py-1 block ${isActive('/contacts') ? 'bg-secondary' : 'hover:bg-opacity-20 hover:bg-white'}`}
                >
                  Contacts
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className={`px-3 py-1 block ${isActive('/search') ? 'bg-secondary' : 'hover:bg-opacity-20 hover:bg-white'}`}
                >
                  AI Search
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center px-3 py-1 hover:bg-opacity-20 hover:bg-white"
            >
              <span className="mr-1">👤</span>
              <span className="hidden sm:inline">{user?.username || 'User'}</span>
              <span className="ml-1">▼</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-element border-2 border-border shadow-win98 z-10">
                <div className="window-title flex justify-between items-center">
                  <span className="px-2 text-sm">User Menu</span>
                  <button 
                    onClick={() => setMenuOpen(false)} 
                    className="px-2 text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-black hover:bg-primary hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-2 py-1"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 mt-1 w-48 bg-element border-2 border-border shadow-win98 z-10">
                <div className="window-title flex justify-between items-center">
                  <span className="px-2 text-sm">Menu</span>
                  <button 
                    onClick={() => setMenuOpen(false)} 
                    className="px-2 text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="py-1">
                  <Link 
                    to="/" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/audio" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Audio Editor
                  </Link>
                  <Link 
                    to="/contacts" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contacts
                  </Link>
                  <Link 
                    to="/search" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    AI Search
                  </Link>
                  <hr className="my-1 border-border" />
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-black hover:bg-primary hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-black hover:bg-primary hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 