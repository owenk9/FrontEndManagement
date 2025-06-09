import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddUser from './AddUser.jsx';
import EditUser from './EditUser.jsx';
import DeleteUser from './DeleteUser.jsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx';
import debounce from "lodash.debounce";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function User() {
    console.log("rerender");
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
    const [searchQuery, setSearchQuery] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const fetchUserDataDirect = useCallback(async (page = 0, query = searchQuery) => {
        try {
            setLoading(true);
            let url;
            if (query && query.trim() !== '') {
                url = `${BASE_URL}/user/search?page=${page}&size=${pageSize}&name=${encodeURIComponent(query)}`;
            } else {
                url = `${BASE_URL}/user/get?page=${page}&size=${pageSize}`;
            }

            console.log('Fetching user data with URL:', url);
            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }

            const data = await response.json();
            setUserData(data.content || []);
            setTotalPages(data.page.totalPages || 1);
        } catch (err) {
            console.error('Fetch user error:', err);
            setError(err.message);
            setUserData([]);
            setTotalPages(1);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth, pageSize, searchQuery, t]);

    const debouncedSearch = useCallback(
        debounce((query) => {
            setCurrentPage(0);
            fetchUserDataDirect(0, query);
        }, 300),
        [fetchUserDataDirect]
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };

    useEffect(() => {
        fetchUserDataDirect(0); // Load lần đầu
    }, []); // Chỉ chạy khi mount

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages && page !== currentPage) {
            setLoading(true);
            setCurrentPage(page);
            fetchUserDataDirect(page);
        }
    };

    const handleAddUser = async () => {
        if (!newUserData.firstName || !newUserData.lastName || !newUserData.role || !newUserData.email || !newUserData.department || !newUserData.password) {
            toast.error('Add fail. Please fill first name, last name, role, email, department and password', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
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

            toast.success(t('userAddedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setNewUserData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                department: '',
                role: 'USER',
            });
            setIsAddModalOpen(false);
            fetchUserDataDirect(currentPage);
        } catch (err) {
            console.error('Add user error:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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

            toast.success(t('userUpdatedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setIsEditModalOpen(false);
            setSelectedUser(null);
            fetchUserDataDirect(currentPage);
        } catch (err) {
            console.error('Update user error:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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

            toast.success(t('userDeletedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUserDataDirect(currentPage);
        } catch (err) {
            console.error('Delete user error:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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

    if (error) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <ToastContainer />
            </div>
        );
    }

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
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-600">
                                {t('loading')}...
                            </td>
                        </tr>
                    ) : userData.length > 0 ? (
                        userData.map((user) => (
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-600">
                                {t('noUsers')}
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
            <ToastContainer />
        </div>
    );
}