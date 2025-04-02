import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { networkingService } from '../../api';
import moment from 'moment';
import { format } from 'date-fns';
import { win98Alert } from '../../utils/modalService';

const OpportunityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    opportunity_type: 'job', // Default type
    location: '',
    remote: false,
    compensation: '',
    application_url: '',
    deadline: '',
    contact_person: '',
    notes: '',
    status: 'active', // Default status
  });

  // Define opportunity types and status options
  const opportunityTypes = [
    { value: 'job', label: 'Job Posting' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer_received', label: 'Offer Received' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'closed', label: 'Closed' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If editing, fetch opportunity details
        if (isEditMode) {
          const opportunityData = await networkingService.getOpportunity(id);
          setFormData({
            title: opportunityData.title || '',
            organization: opportunityData.organization || '',
            description: opportunityData.description || '',
            opportunity_type: opportunityData.opportunity_type || 'job',
            location: opportunityData.location || '',
            remote: opportunityData.remote || false,
            compensation: opportunityData.compensation || '',
            application_url: opportunityData.application_url || '',
            deadline: opportunityData.deadline ? moment(opportunityData.deadline).format('YYYY-MM-DD') : '',
            contact_person: opportunityData.contact_person || '',
            notes: opportunityData.notes || '',
            status: opportunityData.status || 'active',
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        win98Alert('Failed to load form data', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    const requiredFields = {
      title: 'Title',
      organization: 'Organization',
      location: 'Location'
    };
    
    // Check for empty required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);
    
    if (missingFields.length > 0) {
      await win98Alert(
        `Please complete the following required fields: ${missingFields.join(', ')}`,
        'Missing Information',
        'warning'
      );
      setSubmitting(false);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare opportunity data for submission
      const opportunityData = {
        ...formData,
        // Convert empty string to null for optional fields
        deadline: formData.deadline || null,
        contact_person: formData.contact_person || null,
      };
      
      if (isEditMode) {
        await networkingService.updateOpportunity(id, opportunityData);
        await win98Alert('Opportunity updated successfully', 'Update Successful', 'info');
      } else {
        await networkingService.createOpportunity(opportunityData);
        await win98Alert('Opportunity created successfully', 'Creation Successful', 'info');
      }
      
      navigate('/networking/opportunities');
    } catch (error) {
      console.error('Error saving opportunity:', error);
      
      // Handle API validation errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Construct detailed error message
        let errorMessage = 'Failed to save opportunity. ';
        if (typeof errorData === 'object') {
          const errorDetails = Object.entries(errorData)
            .map(([field, errors]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n• ');
          
          if (errorDetails) {
            errorMessage += '\n\nDetails:\n• ' + errorDetails;
          }
        } else if (typeof errorData === 'string') {
          errorMessage += errorData;
        }
        
        await win98Alert(errorMessage, 'Error', 'error');
      } else {
        await win98Alert('Failed to save opportunity. Please check your connection and try again.', 'Error', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="window-win98">
      <div className="window-title-win98">
        <div className="text-black font-bold px-2">
          {isEditMode ? 'Edit Opportunity' : 'New Opportunity'}
        </div>
      </div>
      <div className="p-4 bg-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">
                Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Position or opportunity title"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Organization*
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Company or organization name"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Opportunity Type*
              </label>
              <select
                name="opportunity_type"
                value={formData.opportunity_type}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
              >
                {opportunityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">
                Status*
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">
                Location*
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
                placeholder="City, State or remote"
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-7">
              <input
                type="checkbox"
                id="remote"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
                className="border-2 border-gray-400 p-2"
              />
              <label htmlFor="remote">
                Remote opportunity
              </label>
            </div>
            
            <div>
              <label className="block mb-1">
                Compensation
              </label>
              <input
                type="text"
                name="compensation"
                value={formData.compensation}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
                placeholder="e.g. $50k-$70k, $25/hour, etc."
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Application URL
              </label>
              <input
                type="url"
                name="application_url"
                value={formData.application_url}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Name of contact person"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 p-2 h-32"
              placeholder="Job description, requirements, benefits, etc."
            ></textarea>
          </div>
          
          <div>
            <label className="block mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 p-2 h-20"
              placeholder="Your private notes about this opportunity"
            ></textarea>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="btn-win98"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Opportunity' : 'Create Opportunity')}
            </button>
            
            <button
              type="button"
              className="btn-win98"
              onClick={() => navigate('/networking')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm; 