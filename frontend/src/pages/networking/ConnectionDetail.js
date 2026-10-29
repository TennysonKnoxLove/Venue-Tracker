import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { networkService } from '../../api';
import moment from 'moment';

const ConnectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingContactDate, setEditingContactDate] = useState(false);
  const [linkFormData, setLinkFormData] = useState({
    platform: '',
    url: '',
    username: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const platformOptions = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'website', label: 'Website' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const connectionData = await networkService.getConnection(id);
        setConnection(connectionData);
        
        // Get social links
        const linksData = await networkService.getInteractions(id);
        if (linksData) {
          setSocialLinks(linksData);
        }
      } catch (error) {
        console.error('Error fetching connection details:', error);
        alert('Failed to load connection details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await networkService.deleteConnection(id);
      setShowDeleteConfirm(false);
      navigate('/network/connections');
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Failed to delete connection');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const showLinkModal = () => {
    setLinkModalVisible(true);
    setLinkFormData({
      platform: '',
      url: '',
      username: ''
    });
  };

  const closeLinkModal = () => {
    setLinkModalVisible(false);
  };

  const handleLinkFormChange = (e) => {
    const { name, value } = e.target;
    setLinkFormData({
      ...linkFormData,
      [name]: value
    });
  };

  const handleLinkFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!linkFormData.platform || !linkFormData.url) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      await networkService.createInteraction(id, linkFormData);
      
      // Refresh social links
      const linksData = await networkService.getInteractions(id);
      setSocialLinks(linksData);
      
      closeLinkModal();
    } catch (error) {
      console.error('Error adding social link:', error);
      alert('Failed to add social link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLastContactClick = () => {
    setEditingContactDate(true);
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    try {
      await networkService.updateConnection(id, {
        last_contact_date: newDate,
        name: connection.name
      });
      // Update local state
      setConnection({
        ...connection,
        last_contact_date: newDate
      });
    } catch (error) {
      console.error('Error updating last contact date:', error);
      alert('Failed to update last contact date');
    } finally {
      setEditingContactDate(false);
    }
  };

  const handleDateBlur = () => {
    setEditingContactDate(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setEditingContactDate(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
        <div className="text-center p-12">
          <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
            <div>Loading connection details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
        <div className="text-xl font-bold mb-4">Connection not found</div>
        <Link to="/network/connections" className="btn-win98">
          Back to Connections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-200 border-2 border-gray-400 shadow-md w-96 overflow-hidden">
            <div className="bg-blue-900 text-white p-1 font-bold flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-1">🛑</span>
                <span>Windows 98</span>
              </div>
              <button 
                onClick={cancelDelete}
                className="text-white focus:outline-none w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex items-start">
              <div className="mr-4 text-red-500 text-3xl">❔</div>
              <div>
                Are you sure you want to delete this connection?<br/>
                <span className="text-sm">This action cannot be undone.</span>
              </div>
            </div>
            <div className="bg-gray-300 px-6 py-3 flex justify-end space-x-2 border-t-2 border-gray-400">
              <button 
                onClick={confirmDelete}
                className="btn-win98 px-6"
                style={{ boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #ffffff, inset -2px -2px 0 #7e7e7e, inset 2px 2px 0 #dddddd" }}
              >
                Yes
              </button>
              <button 
                onClick={cancelDelete}
                className="btn-win98 px-6"
                style={{ boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #ffffff, inset -2px -2px 0 #7e7e7e, inset 2px 2px 0 #dddddd" }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-900 text-white p-1 font-bold">
          {connection.name}
        </div>
        <div className="flex space-x-2">
          <Link to={`/network/connections/${id}/edit`} className="btn-win98">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn-win98">
            Delete
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-500">
          <button
            className={`tab-win98 ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-win98 ${activeTab === 'interactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('interactions')}
          >
            Social Links
          </button>
        </div>
        
        <div className="p-4 bg-white border-2 border-t-0 border-gray-400">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-4">
                  <div className="font-bold mb-1">Contact Information</div>
                  <div className="border-2 border-gray-400 p-2 bg-gray-100">
                    <div className="mb-2">
                      <span className="font-bold">Name:</span> {connection.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-bold">Email:</span> {connection.email || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <span className="font-bold">Phone:</span> {connection.phone || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <span className="font-bold">Status:</span> {connection.relationship_status || 'Contact'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-bold mb-1">Meeting Context</div>
                  <div className="border-2 border-gray-400 p-2 bg-gray-100 min-h-[80px]">
                    {connection.meeting_context || 'No meeting context recorded'}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <div className="font-bold mb-1">Skills</div>
                  <div className="border-2 border-gray-400 p-2 bg-gray-100 min-h-[50px]">
                    {connection.skills && Array.isArray(connection.skills) && connection.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {connection.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 border border-blue-400 text-blue-800 px-2 py-1 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'No skills recorded'
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-bold mb-1">Contact History</div>
                  <div className="border-2 border-gray-400 p-2 bg-gray-100">
                    <div className="mb-2">
                      <span className="font-bold">Last Contact:</span>{' '}
                      <span 
                        className="cursor-pointer hover:bg-gray-200 px-1"
                        onClick={handleLastContactClick}
                      >
                        {editingContactDate ? (
                          <input
                            type="date"
                            defaultValue={connection.last_contact_date || ''}
                            onChange={handleDateChange}
                            onBlur={handleDateBlur}
                            onKeyDown={handleKeyPress}
                            className="border border-gray-400 p-1"
                            autoFocus
                          />
                        ) : (
                          connection.last_contact_date ? 
                            moment(connection.last_contact_date).format('MMM D, YYYY') : 
                            'Never'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-bold mb-1">Notes</div>
                  <div className="border-2 border-gray-400 p-2 bg-gray-100 min-h-[100px]">
                    {connection.notes || 'No notes recorded'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Social Links</div>
                <button onClick={showLinkModal} className="btn-win98">
                  + Add Link
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <div className="file-icon mx-auto"></div>
                  </div>
                  <div>No social links recorded yet</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-400 bg-white">
                    <thead>
                      <tr className="bg-gray-200 border-b-2 border-gray-400">
                        <th className="p-2 text-left border-r-2 border-gray-400">Platform</th>
                        <th className="p-2 text-left border-r-2 border-gray-400">Username</th>
                        <th className="p-2 text-left">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialLinks.map((link) => (
                        <tr key={link.id} className="border-b border-gray-400 hover:bg-gray-100">
                          <td className="p-2 border-r-2 border-gray-400">{link.platform}</td>
                          <td className="p-2 border-r-2 border-gray-400">{link.username || 'N/A'}</td>
                          <td className="p-2">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              {link.url}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {linkModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="window-win98 p-0 z-10 max-w-md w-full">
            <div className="window-title-win98 flex items-center justify-between">
              <div className="text-white font-bold px-2">Add Social Link</div>
              <button onClick={closeLinkModal} className="text-white px-2 font-bold">
                X
              </button>
            </div>
            <div className="p-4 bg-gray-200">
              <form onSubmit={handleLinkFormSubmit}>
                <div className="mb-3">
                  <label className="block mb-1">Platform*</label>
                  <select
                    name="platform"
                    value={linkFormData.platform}
                    onChange={handleLinkFormChange}
                    className="border-2 border-gray-400 bg-white p-1 w-full"
                    required
                  >
                    <option value="">Select platform</option>
                    {platformOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1">URL*</label>
                  <input
                    type="url"
                    name="url"
                    value={linkFormData.url}
                    onChange={handleLinkFormChange}
                    className="border-2 border-gray-400 bg-white p-1 w-full"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1">Username (optional)</label>
                  <input
                    type="text"
                    name="username"
                    value={linkFormData.username}
                    onChange={handleLinkFormChange}
                    className="border-2 border-gray-400 bg-white p-1 w-full"
                  />
                </div>
                
                <div className="flex justify-end mt-4">
                  <button 
                    type="button" 
                    onClick={closeLinkModal} 
                    className="btn-win98 mr-2"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-win98"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionDetail; 