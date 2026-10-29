import React, { useState, useEffect } from 'react';
import { networkService } from '../../api';
import { Link } from 'react-router-dom';

const ConnectionList = () => {
  const [connections, setConnections] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');
  const [editingContactDate, setEditingContactDate] = useState(null);

  const relationshipOptions = [
    { value: 'contact', label: 'Contact' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'collaborator', label: 'Collaborator' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  // Move fetchData outside useEffect to make it accessible throughout the component
  const fetchData = async () => {
    try {
      setLoading(true);
      const connectionsData = await networkService.getConnections();
      setConnections(connectionsData);
      
      // Extract unique skills from connections
      const allSkills = new Set();
      connectionsData.forEach(connection => {
        if (connection.skills && Array.isArray(connection.skills)) {
          connection.skills.forEach(skill => allSkills.add(skill));
        }
      });
      setSkills(Array.from(allSkills).sort());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (search) {
        filters.search = search;
        // Only use the search parameter for backend filtering
        const data = await networkService.getConnections(filters);
        
        // Perform client-side filtering for skills and relationship
        let filteredData = data;
        
        // Filter by skill if selected
        if (skillFilter) {
          filteredData = filteredData.filter(connection => 
            connection.skills && 
            Array.isArray(connection.skills) && 
            connection.skills.includes(skillFilter)
          );
        }
        
        // Filter by relationship if selected
        if (relationshipFilter) {
          filteredData = filteredData.filter(connection => 
            connection.relationship_status === relationshipFilter
          );
        }
        
        setConnections(filteredData);
      } else {
        // If no search term, fetch all and filter client-side
        const data = await networkService.getConnections();
        
        // Perform client-side filtering
        let filteredData = data;
        
        // Filter by skill if selected
        if (skillFilter) {
          filteredData = filteredData.filter(connection => 
            connection.skills && 
            Array.isArray(connection.skills) && 
            connection.skills.includes(skillFilter)
          );
        }
        
        // Filter by relationship if selected
        if (relationshipFilter) {
          filteredData = filteredData.filter(connection => 
            connection.relationship_status === relationshipFilter
          );
        }
        
        setConnections(filteredData);
      }
    } catch (error) {
      console.error('Error searching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setSearch('');
    setSkillFilter('');
    setRelationshipFilter('');
    
    try {
      setLoading(true);
      const data = await networkService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLastContactClick = (connectionId) => {
    setEditingContactDate(connectionId);
  };

  const handleDateChange = async (connectionId, e) => {
    const newDate = e.target.value;
    try {
      // Find the connection to get its name
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      await networkService.updateConnection(connectionId, {
        last_contact_date: newDate,
        name: connection.name // Include the required name field
      });
      // Refresh the connections list
      fetchData();
    } catch (error) {
      console.error('Error updating last contact date:', error);
      alert('Failed to update last contact date');
    } finally {
      setEditingContactDate(null);
    }
  };

  const handleDateBlur = () => {
    setEditingContactDate(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setEditingContactDate(null);
    }
  };

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-900 text-white p-1 font-bold">
          Network Connections
        </div>
        <Link to="/network/connections/new" className="btn-win98">
          + Add Connection
        </Link>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search connections"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-gray-400 bg-white p-1"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="border-2 border-gray-400 bg-white p-1"
        >
          <option value="">Filter by skills</option>
          {skills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
        
        <select
          value={relationshipFilter}
          onChange={(e) => setRelationshipFilter(e.target.value)}
          className="border-2 border-gray-400 bg-white p-1"
        >
          <option value="">Filter by relationship</option>
          {relationshipOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        
        <button 
          onClick={handleSearch}
          className="btn-win98"
        >
          Search
        </button>
        
        <button 
          onClick={clearFilters}
          className="btn-win98"
        >
          Clear Filters
        </button>
      </div>
      
      {loading ? (
        <div className="text-center p-12">
          <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
            <div>Loading connections...</div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-400 bg-white">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-400">
                <th className="p-2 text-left border-r-2 border-gray-400">Name</th>
                <th className="p-2 text-left border-r-2 border-gray-400">Email</th>
                <th className="p-2 text-left border-r-2 border-gray-400">Phone</th>
                <th className="p-2 text-left border-r-2 border-gray-400">Skills</th>
                <th className="p-2 text-left border-r-2 border-gray-400">Status</th>
                <th className="p-2 text-left border-r-2 border-gray-400">Last Contact</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.length > 0 ? (
                connections.map(connection => (
                  <tr key={connection.id} className="border-b border-gray-400 hover:bg-gray-100">
                    <td className="p-2 border-r-2 border-gray-400">
                      <Link to={`/network/connections/${connection.id}`} className="text-blue-600 underline">
                        {connection.name}
                      </Link>
                    </td>
                    <td className="p-2 border-r-2 border-gray-400">{connection.email}</td>
                    <td className="p-2 border-r-2 border-gray-400">{connection.phone}</td>
                    <td className="p-2 border-r-2 border-gray-400">
                      {connection.skills ? 
                        (Array.isArray(connection.skills) ? 
                          connection.skills.join(', ') : 
                          connection.skills
                        ) : 
                        ''
                      }
                    </td>
                    <td className="p-2 border-r-2 border-gray-400">
                      {connection.relationship_status || 'Contact'}
                    </td>
                    <td 
                      className="p-2 border-r-2 border-gray-400 cursor-pointer hover:bg-gray-200" 
                      onClick={() => handleLastContactClick(connection.id)}
                    >
                      {editingContactDate === connection.id ? (
                        <input
                          type="date"
                          defaultValue={connection.last_contact_date || ''}
                          onChange={(e) => handleDateChange(connection.id, e)}
                          onBlur={handleDateBlur}
                          onKeyDown={handleKeyPress}
                          className="border border-gray-400 p-1 w-full"
                          autoFocus
                        />
                      ) : (
                        connection.last_contact_date ? 
                          new Date(connection.last_contact_date).toLocaleDateString() : 
                          'Never'
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Link to={`/network/connections/${connection.id}`} className="btn-win98 text-xs">
                          View
                        </Link>
                        <Link to={`/network/connections/${connection.id}/edit`} className="btn-win98 text-xs">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    <div className="flex flex-col items-center p-6">
                      <div className="mb-2">No data</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConnectionList; 