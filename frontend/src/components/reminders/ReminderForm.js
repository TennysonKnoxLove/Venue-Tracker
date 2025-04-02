import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { remindersService } from '../../api';
import moment from 'moment';
import modalService from '../../utils/modalService';

const ReminderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    due_date: moment().format('YYYY-MM-DD'),
    due_time: moment().hour(9).minute(0).format('HH:mm'),
    priority: 'medium',
    category: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#1890ff' });
  const [errors, setErrors] = useState({});

  const isEditing = !!id;

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', color: 'bg-green-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await remindersService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching reminder categories:', error);
        modalService.alert('Failed to load reminder categories', 'Error', 'error');
      }
    };

    const fetchReminder = async () => {
      try {
        setInitialLoading(true);
        const reminderData = await remindersService.getReminder(id);
        
        // Format dates for the form
        const dueDate = moment(reminderData.due_date);
        const formattedData = {
          ...reminderData,
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: dueDate.format('HH:mm')
        };
        
        setFormData(formattedData);
      } catch (error) {
        console.error('Error fetching reminder:', error);
        modalService.alert('Failed to load reminder details', 'Error', 'error');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategories();
    
    if (isEditing) {
      fetchReminder();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCategoryChange = (e) => {
    setNewCategory({ ...newCategory, name: e.target.value });
  };

  const handleColorChange = (e) => {
    setNewCategory({ ...newCategory, color: e.target.value });
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        modalService.alert('Please enter a category name', 'Missing Information', 'info');
        return;
      }
      
      const categoryData = {
        name: newCategory.name,
        color: newCategory.color
      };
      
      const newCategoryData = await remindersService.createCategory(categoryData);
      
      // Add the new category to the list
      setCategories([...categories, newCategoryData]);
      
      // Select the new category
      setFormData({ ...formData, category: newCategoryData.id });
      
      // Reset and close the form
      setNewCategory({ name: '', color: '#1890ff' });
      setShowCategoryForm(false);
      
      modalService.alert('Category created successfully', 'Success', 'info');
    } catch (error) {
      console.error('Error creating category:', error);
      modalService.alert('Failed to create category', 'Error', 'error');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    if (!formData.due_time) newErrors.due_time = 'Due time is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      // Combine date and time for the due_date
      const dueDateTime = moment(`${formData.due_date} ${formData.due_time}`);
      
      // Submit data with separate date and time fields
      const submissionData = {
        ...formData,
        due_date: formData.due_date,
        due_time: formData.due_time
      };
      
      if (isEditing) {
        await remindersService.updateReminder(id, submissionData);
        modalService.alert('Reminder updated successfully', 'Success', 'info');
      } else {
        await remindersService.createReminder(submissionData);
        modalService.alert('Reminder created successfully', 'Success', 'info');
      }
      
      navigate('/reminders');
    } catch (error) {
      console.error('Error saving reminder:', error);
      
      // Check if it's a validation error and show more detailed message
      if (error.response && error.response.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, errors]) => {
            // Handle both array and non-array error values
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(', ')}`;
            } else {
              return `${field}: ${errors}`;
            }
          })
          .join('\n');
        
        modalService.alert(`Failed to ${isEditing ? 'update' : 'create'} reminder:\n${errorMessages}`, 'Error', 'error');
      } else {
        modalService.alert(`Failed to ${isEditing ? 'update' : 'create'} reminder`, 'Error', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading reminder data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="bg-gray-200 border-2 border-gray-800 p-4 shadow-win98">
        <h2 className="text-xl font-bold mb-4 bg-blue-win98 p-1 flex items-center">
          <span className="flex-1">{isEditing ? 'Edit Reminder' : 'Create Reminder'}</span>
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 bg-gray-200 border-outset text-black text-xs"
          >
            X
          </button>
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 bg-white p-1"
              required
            />
            {errors.title && <div className="text-red-600 mt-1">{errors.title}</div>}
          </div>
          
          <div className="flex space-x-4">
            <div className="mb-4 flex-1">
              <label className="block mb-1">
                Due Date <span className="text-red-600">*</span>
              </label>
              <input 
                type="date" 
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
                required
              />
              {errors.due_date && <div className="text-red-600 mt-1">{errors.due_date}</div>}
            </div>
            
            <div className="mb-4 flex-1">
              <label className="block mb-1">
                Due Time <span className="text-red-600">*</span>
              </label>
              <input 
                type="time" 
                name="due_time"
                value={formData.due_time}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 bg-white p-1"
                required
              />
              {errors.due_time && <div className="text-red-600 mt-1">{errors.due_time}</div>}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">
              Priority <span className="text-red-600">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={(e) => handleSelectChange(e, 'priority')}
              className="w-full border-2 border-gray-400 bg-white p-1"
              required
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.priority && <div className="text-red-600 mt-1">{errors.priority}</div>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Category</label>
            <div className="flex space-x-2">
              <select
                name="category"
                value={formData.category || ""}
                onChange={(e) => handleSelectChange(e, 'category')}
                className="flex-1 border-2 border-gray-400 bg-white p-1"
              >
                <option value="">No Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button 
                type="button"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="btn-win98 px-2"
              >
                {showCategoryForm ? 'Cancel' : 'Add New'}
              </button>
            </div>
          </div>
          
          {showCategoryForm && (
            <div className="mb-4 p-3 border border-gray-400 bg-gray-100">
              <h3 className="font-bold mb-2">Add New Category</h3>
              <div className="mb-2">
                <label className="block mb-1">Category Name</label>
                <input 
                  type="text"
                  value={newCategory.name}
                  onChange={handleCategoryChange}
                  className="w-full border-2 border-gray-400 bg-white p-1"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Color</label>
                <input 
                  type="color"
                  value={newCategory.color}
                  onChange={handleColorChange}
                  className="w-16 h-8 border-2 border-gray-400"
                />
              </div>
              <button 
                type="button"
                onClick={handleAddCategory}
                className="btn-win98 mt-2"
              >
                Add Category
              </button>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 bg-white p-1 h-24"
              placeholder="Enter description..."
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-win98 px-4"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-win98 px-4 bg-blue-win98"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Reminder' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm; 