import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { remindersService } from '../../api';
import modalService from '../../utils/Win98Modals';

export function useReminderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

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
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#1890ff' });
  const [errors, setErrors] = useState({});

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

        const dueDate = moment(reminderData.due_date);
        setFormData({
          ...reminderData,
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: dueDate.format('HH:mm')
        });
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
    setFormData(prev => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setNewCategory(prev => ({ ...prev, name: e.target.value }));
  };

  const handleColorChange = (e) => {
    setNewCategory(prev => ({ ...prev, color: e.target.value }));
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        modalService.alert('Please enter a category name', 'Missing Information', 'info');
        return;
      }

      const newCategoryData = await remindersService.createCategory({
        name: newCategory.name,
        color: newCategory.color
      });

      setCategories(prev => [...prev, newCategoryData]);
      setFormData(prev => ({ ...prev, category: newCategoryData.id }));
      setNewCategory({ name: '', color: '#1890ff' });
      setShowCategoryForm(false);

      modalService.alert('Category created successfully', 'Success', 'info');
    } catch (error) {
      console.error('Error creating category:', error);
      modalService.alert('Failed to create category', 'Error', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    if (!formData.due_time) newErrors.due_time = 'Due time is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

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

      if (error.response && error.response.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
              return `${field}: ${fieldErrors.join(', ')}`;
            }
            return `${field}: ${fieldErrors}`;
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

  return {
    formData,
    categories,
    loading,
    initialLoading,
    showCategoryForm,
    setShowCategoryForm,
    newCategory,
    errors,
    isEditing,
    navigate,
    handleChange,
    handleSelectChange,
    handleCategoryChange,
    handleColorChange,
    handleAddCategory,
    handleSubmit,
  };
}
