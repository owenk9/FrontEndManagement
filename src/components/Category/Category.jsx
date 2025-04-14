import { useState, useEffect } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import AddCategoryModal from './AddCategory.jsx';
import EditCategory from './EditCategory.jsx';
import DeleteCategory from './DeleteCategory.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Category() {
    const { t } = useTranslation();

    const [categoryData, setCategoryData] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({
        categoryName: '',
        description: '',
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const fetchCategoryData = async (page = 0, search = '') => {
        try {
            const url = search
                ? `${BASE_URL}/category/get?name=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/category/get?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setCategoryData(data.content || []);
            setTotalPages(data.totalPages || 1);
            // setCurrentPage(data.number || page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý tìm kiếm thời gian thực
    const handleSearch = (term) => {
        fetchCategoryData(currentPage, term);
        // setCurrentPage(0); // Reset về trang đầu khi tìm kiếm
    };

    useEffect(() => {
        setLoading(true);
        fetchCategoryData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddCategory = async () => {
        if (!newCategoryData.categoryName) {
            alert(t('fillRequiredFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/category/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategoryData),
            });
            if (!response.ok) throw new Error(t('addError'));
            setNewCategoryData({ categoryName: '', description: '' });
            setIsAddModalOpen(false);
            fetchCategoryData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOpenEditModal = (category) => {
        setSelectedCategory({ ...category });
        setIsEditModalOpen(true);
    };

    const handleEditCategory = async () => {
        if (!selectedCategory.categoryName) {
            alert(t('fillRequiredFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/category/update/${selectedCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryName: selectedCategory.categoryName,
                    description: selectedCategory.description,
                }),
            });
            if (!response.ok) throw new Error(t('updateError'));
            setIsEditModalOpen(false);
            setSelectedCategory(null);
            fetchCategoryData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOpenDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCategory = async () => {
        try {
            const response = await fetch(`${BASE_URL}/category/delete/${categoryToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('deleteError'));
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategoryData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategoryData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCategory((prev) => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setLoading(true);
            setCurrentPage(page);
        }
    };

    // Tạo danh sách số trang
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === i
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }

        return pageNumbers;
    };

    if (loading) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p>{t('loading')}</p></div>;
    if (error) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p className="text-red-600">{t('error')}: {error}</p></div>;

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('category')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
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
                            <td className="py-4 px-6 text-gray-800">{category.categoryName}</td>
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
                {/* Phân trang nằm trong bảng, căn phải */}
                <div className="flex justify-end items-center p-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-1 rounded-md ${
                                currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            {t('previous')}
                        </button>
                        {renderPageNumbers()}
                        <button
                            className={`px-3 py-1 rounded-md ${
                                currentPage === totalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            {t('next')}
                        </button>
                    </div>
                </div>
            </div>

            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddCategory}
                newCategory={newCategoryData}
                onInputChange={handleInputChange}
            />
            <EditCategory
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditCategory}
                category={selectedCategory || {}}
                onInputChange={handleEditInputChange}
            />
            <DeleteCategory
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                categoryName={categoryToDelete?.categoryName || ''}
            />
        </div>
    );
}