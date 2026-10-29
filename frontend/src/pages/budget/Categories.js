import { budgetService } from '../../api';
import { win98Alert, win98Prompt } from '../../utils/Win98Modals';
import { getRandomColor } from './Utils';


export function getCategoryActions({
  categories,
  setCategories,
  formData,
  setFormData,
}) {
  const handleCreateCategory = async () => {
    try {
      const categoryName = await win98Prompt('Enter new category name:', '', 'New Category');
      if (!categoryName) return;

      const category = await budgetService.createCategory({
        name: categoryName,
        color: getRandomColor(),
      });

      setCategories([...categories, category]);

      setFormData({
        ...formData,
        category: category.id,
      });
    } catch (err) {
      console.error('Error creating category:', err);
      await win98Alert('Failed to create category', 'Error', 'error');
    }
  };

  return { handleCreateCategory };
}
