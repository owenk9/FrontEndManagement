import { useState, useEffect } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddUser from './AddUser.jsx';
import EditUser from './EditUser.jsx';
import DeleteUser from './DeleteUser.jsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx';

export default function User() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();

    const [userData, setUserData] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: '',
        role: 'USER',
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const fetchUserData = async (page = 0, search = '') => {
        try {
            setLoading(true);
            let url = `${BASE_URL}/user/get?page=${page}&size=${pageSize}`;
            if (search) url += `&name=${encodeURIComponent(search)}`;
            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setUserData(data.content || []);
            setTotalPages(data.page.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    useEffect(() => {
        setLoading(true);
        fetchUserData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleAddUser = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/user/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('addError') + ': ' + errorText);
            }
            setNewUserData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                department: '',
                role: 'USER',
            });
            setIsAddModalOpen(false);
            fetchUserData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;
        try {
            const response = await fetchWithAuth(`${BASE_URL}/user/update/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    email: selectedUser.email,
                    password: selectedUser.password || '',
                    department: selectedUser.department,
                    role: selectedUser.role,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('updateError') + ': ' + errorText);
            }
            setIsEditModalOpen(false);
            setSelectedUser(null);
            fetchUserData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const response = await fetchWithAuth(`${BASE_URL}/user/delete/${userToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUserData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
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

    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewUserData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p>{t('loading')}</p></div>;
    if (error) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p className="text-red-600">{t('error')}: {error}</p></div>;

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('user')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addUser')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('firstName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lastName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('department')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('role')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userData.map((user) => (
                        <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.firstName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.lastName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.department || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.role || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEditModal(user)}
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(user)}
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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

            <AddUser
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddUser}
                newUser={newUserData}
                onInputChange={handleAddInputChange}
            />
            <EditUser
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditUser}
                user={selectedUser || {}}
                onInputChange={handleEditInputChange}
            />
            <DeleteUser
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                userName={`${userToDelete?.firstName} ${userToDelete?.lastName}`}
            />
        </div>
    );
}