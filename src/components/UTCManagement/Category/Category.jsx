import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import AddCategoryModal from './AddCategory.jsx';
import EditCategory from './EditCategory.jsx';
import DeleteCategory from './DeleteCategory.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../Auth/AuthContext.jsx";
import debounce from 'lodash.debounce';

export default function Category() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();

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
    const [searchTerm, setSearchTerm] = useState(''); // Đổi từ const thành state để phản ánh từ khóa

    const BASE_URL = 'http://localhost:9090';

    const fetchCategoryData = useCallback(async (page = 0, search = '') => {
        try {
            setLoading(true);
            const url = search && search.trim() !== ''
                ? `${BASE_URL}/category/get?name=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/category/get?page=${page}&size=${pageSize}`;

            console.log('Fetching category data with URL:', url);
            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }

            const data = await response.json();
            setCategoryData(data.content || []);
            setTotalPages(data.page?.totalPages || 1);
        } catch (err) {
            console.error('Fetch category error:', err);
            setError(err.message);
            setCategoryData([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth, pageSize, t]);

    const debouncedFetchCategoryData = useCallback(
        debounce((page, search) => {
            console.log('Debounced fetch triggered for page:', page, 'with searchTerm:', search);
            fetchCategoryData(page, search);
        }, 200),
        [fetchCategoryData]
    );

    const handleSearch = useCallback((term) => {
        console.log('Search term updated:', term);
        setSearchTerm(term);
        setCurrentPage(0); // Reset to first page on new search
    }, []);

    useEffect(() => {
        setLoading(true);
        setCurrentPage(0);
        debouncedFetchCategoryData(0, searchTerm);
        return () => debouncedFetchCategoryData.cancel();
    }, [searchTerm, debouncedFetchCategoryData]);

    useEffect(() => {
        if (currentPage !== 0) {
            debouncedFetchCategoryData(currentPage, searchTerm);
        }
        return () => debouncedFetchCategoryData.cancel();
    }, [currentPage, debouncedFetchCategoryData]);

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddCategory = async () => {
        if (!newCategoryData.categoryName) {
            alert(t('fillRequiredFields'));
            return;
        }
        try {
            const response = await fetchWithAuth(`${BASE_URL}/category/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategoryData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('addError') + ': ' + errorText);
            }
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
            const response = await fetchWithAuth(`${BASE_URL}/category/update/${selectedCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryName: selectedCategory.categoryName,
                    description: selectedCategory.description,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('updateError') + ': ' + errorText);
            }
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
            const response = await fetchWithAuth(`${BASE_URL}/category/delete/${categoryToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
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
        if (page >= 0 && page < totalPages && page !== currentPage) {
            setLoading(true);
            setCurrentPage(page);
        }
    };

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


    if (error) return (
        <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
            <p className="text-red-600">{t('error')}: {error}</p>
        </div>
    );

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('categoryName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                            <tr>
                                <td colSpan="9" className="py-4 text-center text-gray-600">
                                    {t('loading')}...
                                </td>
                            </tr>
                        ) : categoryData.length > 0 ? (
                        categoryData.map((category) => (
                            <tr key={category.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{category.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{category.categoryName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{category.description || 'N/A'}</td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex space-x-3">
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-600">
                                {t('noCategories')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <div className="flex justify-end items-center p-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-1 rounded-md ${
                                currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0 || loading}
                        >
                            {t('previous')}
                        </button>
                        {renderPageNumbers()}
                        <button
                            className={`px-3 py-1 rounded-md ${
                                currentPage === totalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1 || loading}
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