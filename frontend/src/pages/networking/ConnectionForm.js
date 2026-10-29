import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { networkService } from '../../api';

const ConnectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    meeting_context: '',
    notes: '',
    relationship_status: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const relationshipOptions = [
    { value: 'contact', label: 'Contact' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'collaborator', label: 'Collaborator' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchConnection = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const connectionData = await networkService.getConnection(id);
        
        // Format the data for the form
        setFormData({
          name: connectionData.name || '',
          email: connectionData.email || '',
          phone: connectionData.phone || '',
          skills: connectionData.skills || [],
          meeting_context: connectionData.meeting_context || '',
          notes: connectionData.notes || '',
          relationship_status: connectionData.relationship_status || '',
        });
      } catch (error) {
        console.error('Error fetching connection:', error);
        alert('Failed to load connection data');
      } finally {
        setLoading(false);
      }
    };

    fetchConnection();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a name for the connection');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const apiData = {
        ...formData
      };
      
      if (isEditMode) {
        await networkService.updateConnection(id, apiData);
      } else {
        await networkService.createConnection(apiData);
      }
      
      navigate('/network/connections');
    } catch (error) {
      console.error('Error saving connection:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} connection`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
        <div className="text-center p-12">
          <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
            <div>Loading connection data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      <div className="bg-blue-900 text-white p-1 font-bold mb-4">
        {isEditMode ? 'Edit Connection' : 'Add New Connection'}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block mb-1">
                <span className="text-red-600">*</span> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
              />
            </div>
            
            <div>
              <label className="block mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
              />
            </div>
            
            <div>
              <label className="block mb-1">Relationship Status</label>
              <select
                name="relationship_status"
                value={formData.relationship_status}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
              >
                <option value="">Select status</option>
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Skills</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow border-2 border-gray-400 bg-white p-1"
                  placeholder="Enter a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-win98 ml-2"
                >
                  Add
                </button>
              </div>
              <div className="border-2 border-gray-400 bg-white p-2 min-h-[100px]">
                {formData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="bg-gray-200 border border-gray-400 px-2 py-1 flex items-center space-x-1">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No skills added yet</div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block mb-1">Meeting Context</label>
              <textarea
                name="meeting_context"
                value={formData.meeting_context}
                onChange={handleChange}
                rows="3"
                className="w-full border-2 border-gray-400 bg-white p-1"
                placeholder="How did you meet this person?"
              ></textarea>
            </div>
            
            <div>
              <label className="block mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border-2 border-gray-400 bg-white p-1"
                placeholder="Any additional notes"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-6">
          <button
            type="submit"
            className="btn-win98"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditMode ? 'Update Connection' : 'Create Connection')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/network/connections')}
            className="btn-win98"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnectionForm; 