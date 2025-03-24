import { useState } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import AddCategoryModal from './AddCategory.jsx';
import EditCategory from './EditCategory.jsx'; // Import modal chỉnh sửa
import DeleteCategory from './DeleteCategory.jsx'; // Import modal xóa
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Category() {
    const { t } = useTranslation();

    const [categoryData, setCategoryData] = useState([
        { id: 1, name: 'Presentation Equipment', description: 'Projectors, screens' },
        { id: 2, name: 'Computers', description: 'PCs, laptops' },
        { id: 3, name: 'Audio Equipment', description: 'Speakers, microphones' },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({
        id: '',
        name: '',
        description: '',
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddCategory = () => {
        if (!newCategoryData.id || !newCategoryData.name) {
            alert(t('fillRequiredFields'));
            return;
        }
        setCategoryData([...categoryData, { ...newCategoryData, id: parseInt(newCategoryData.id) }]);
        setNewCategoryData({ id: '', name: '', description: '' });
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (category) => {
        setSelectedCategory({ ...category });
        setIsEditModalOpen(true);
    };

    const handleEditCategory = () => {
        if (!selectedCategory.name) {
            alert(t('fillRequiredFields'));
            return;
        }
        const updatedCategories = categoryData.map((item) =>
            item.id === selectedCategory.id ? selectedCategory : item
        );
        setCategoryData(updatedCategories);
        setIsEditModalOpen(false);
        setSelectedCategory(null);
    };

    const handleOpenDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCategory = () => {
        setCategoryData(categoryData.filter((item) => item.id !== categoryToDelete.id));
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategoryData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCategory((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('category')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addCategory')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('categoryName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('description')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categoryData.map((category) => (
                        <tr key={category.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{category.id}</td>
                            <td className="py-4 px-6 text-gray-800">{category.name}</td>
                            <td className="py-4 px-6 text-gray-800">{category.description}</td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenEditModal(category)}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenDeleteModal(category)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm danh mục */}
            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddCategory}
                newCategory={newCategoryData}
                onInputChange={handleInputChange}
            />

            {/* Modal chỉnh sửa danh mục */}
            <EditCategory
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditCategory}
                category={selectedCategory || {}}
                onInputChange={handleEditInputChange}
            />

            {/* Modal xóa danh mục */}
            <DeleteCategory
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                categoryName={categoryToDelete?.name || ''}
            />
        </div>
    );
}