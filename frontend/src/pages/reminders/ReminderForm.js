import { useReminderForm } from './useReminderForm';

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-green-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const ReminderForm = () => {
  const {
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
  } = useReminderForm();

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
