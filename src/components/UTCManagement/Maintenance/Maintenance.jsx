import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddMaintenance from './AddMaintenance.jsx';
import EditMaintenance from './EditMaintenance.jsx';
import DeleteMaintenance from './DeleteMaintenance.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '../../Auth/AuthContext.jsx';
import debounce from 'lodash.debounce';

export default function Maintenance() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();

    const [maintenanceData, setMaintenanceData] = useState([]);
    const [equipmentItems, setEquipmentItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newMaintenanceData, setNewMaintenanceData] = useState({
        equipmentItemId: '',
        maintenanceDate: '',
        description: '',
        status: 'SCHEDULED',
        cost: '',
        technician: '',
    });
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const formatCurrency = (value) => {
        if (value == null) return 'N/A';
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        });
        return formatter.format(value).replace('₫', 'đ');
    };

    const fetchMaintenanceData = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            let url = `${BASE_URL}/maintenance/get?page=${page}&size=${pageSize}`;
            if (searchQuery && searchQuery.trim() !== '') {
                url = `${BASE_URL}/maintenance/search?page=${page}&size=${pageSize}&name=${encodeURIComponent(searchQuery)}`;
            }

            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }

            const data = await response.json();
            const maintenanceList = data.content || [];

            const itemResponse = await fetchWithAuth(`${BASE_URL}/item/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!itemResponse.ok) {
                const errorText = await itemResponse.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }

            const itemsData = await itemResponse.json();
            const itemsContent = itemsData.content || itemsData;
            const itemsMap = Array.isArray(itemsContent) ? itemsContent.reduce((map, item) => {
                map[item.id] = item;
                return map;
            }, {}) : {};

            const enrichedMaintenance = maintenanceList.map(maintenance => ({
                ...maintenance,
                equipmentName: itemsMap[maintenance.equipmentItemId]?.equipmentName || 'N/A',
                serialNumber: itemsMap[maintenance.equipmentItemId]?.serialNumber || 'N/A',
                itemStatus: itemsMap[maintenance.equipmentItemId]?.status || 'N/A',
            }));

            setMaintenanceData(enrichedMaintenance);
            setTotalPages(data.page.totalPages || 1);
        } catch (err) {
            console.error('Fetch maintenance data error:', err);
            setError(err.message);
            setMaintenanceData([]);
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

    const fetchEquipmentItems = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/item/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }
            const data = await response.json();
            setEquipmentItems(data.content || data || []);
        } catch (err) {
            console.error('Failed to fetch equipment items:', err);
            setError(err.message);
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

    const debouncedFetchMaintenanceData = useCallback(
        debounce((page) => {
            console.log('Debounced fetch triggered for page:', page);
            fetchMaintenanceData(page);
        }, 200),
        [fetchMaintenanceData]
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(0);
    };

    useEffect(() => {
        setLoading(true);
        setCurrentPage(0);
        debouncedFetchMaintenanceData(0);
        return () => debouncedFetchMaintenanceData.cancel();
    }, [searchQuery, debouncedFetchMaintenanceData]);

    useEffect(() => {

            debouncedFetchMaintenanceData(currentPage);

        return () => debouncedFetchMaintenanceData.cancel();
    }, [currentPage, debouncedFetchMaintenanceData]);

    useEffect(() => {
        fetchEquipmentItems();
    }, [fetchWithAuth]);

    const handleAddMaintenance = async () => {
        // if (!newMaintenanceData.equipmentItemId) {
        //     toast.error('Add fail. Please select a equipment item', {
        //         position: "top-right",
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //     });
        //     return;
        // }
        const selectedEquipmentItem = equipmentItems.find(item => item.id === parseInt(newMaintenanceData.equipmentItemId));
        if (!selectedEquipmentItem || !selectedEquipmentItem.equipmentName) {
            toast.error('Add fail. Please select a equipment name and equipment item', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        if (!newMaintenanceData.maintenanceDate  || !selectedMaintenance.technician) {
            toast.error(t('fillRequiredMaintenanceFields'), {
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
            const response = await fetchWithAuth(`${BASE_URL}/maintenance/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentItemId: parseInt(newMaintenanceData.equipmentItemId),
                    maintenanceDate: newMaintenanceData.maintenanceDate,
                    description: newMaintenanceData.description,
                    status: newMaintenanceData.status,
                    cost: parseFloat(newMaintenanceData.cost),
                    technician: newMaintenanceData.technician,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('addError') + ': ' + errorText);
            }
            toast.success(t('maintenanceAddedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setNewMaintenanceData({
                equipmentItemId: '',
                maintenanceDate: '',
                description: '',
                status: 'SCHEDULED',
                cost: '',
                technician: '',
            });
            setIsAddModalOpen(false);
            await fetchMaintenanceData(currentPage);
        } catch (err) {
            console.error('Failed to add maintenance:', err);
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

    const handleEditMaintenance = async () => {
        if (!selectedMaintenance.equipmentItemId || !selectedMaintenance.maintenanceDate || !selectedMaintenance.cost || !selectedMaintenance.technician) {
            toast.error(t('fillRequiredMaintenanceFields'), {
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
            const response = await fetchWithAuth(`${BASE_URL}/maintenance/update/${selectedMaintenance.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentItemId: parseInt(selectedMaintenance.equipmentItemId),
                    maintenanceDate: selectedMaintenance.maintenanceDate,
                    description: selectedMaintenance.description || '',
                    status: selectedMaintenance.status,
                    cost: parseFloat(selectedMaintenance.cost),
                    technician: selectedMaintenance.technician,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('updateError') + ': ' + errorText);
            }
            toast.success(t('maintenanceUpdatedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });


            setSelectedMaintenance(null);
            setIsEditModalOpen(false);

            await fetchMaintenanceData(currentPage);
        } catch (err) {
            console.error('Failed to update maintenance:', err);
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

    const handleDeleteMaintenance = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/maintenance/delete/${maintenanceToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
            toast.success(t('maintenanceDeletedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsDeleteModalOpen(false);
            setMaintenanceToDelete(null);
            await fetchMaintenanceData(currentPage);
        } catch (err) {
            console.error('Failed to delete maintenance:', err);
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

    function getStatusColor(status) {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return t('statusScheduled');
            case 'IN_PROGRESS':
                return t('statusInProgress');
            case 'COMPLETED':
                return t('statusCompleted');
            case 'FAILED':
                return t('statusFailed');
            default:
                return status;
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
    const handleOpenEditModal = (maintenance) => {
        const equipmentItem = equipmentItems.find(item => item.id === maintenance.equipmentItemId);
        setSelectedMaintenance({
            ...maintenance,
            equipmentItemId: maintenance.equipmentItemId,
            equipmentName: equipmentItem?.equipmentName || 'N/A',
            serialNumber: equipmentItem?.serialNumber || 'N/A',
        });
        setIsEditModalOpen(true);
    };
    const handleOpenDeleteModal = (maintenance) => {
        setMaintenanceToDelete(maintenance);
        setIsDeleteModalOpen(true);
    };
    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewMaintenanceData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedMaintenance((prev) => ({ ...prev, [name]: value }));
    };

    if (error) return (
        <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
            <p className="text-red-600">{t('error')}: {error}</p>
            <button
                onClick={() => fetchMaintenanceData(0)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                {t('retry')}
            </button>
            <ToastContainer />
        </div>
    );

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('maintenance')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addMaintenance')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('equipmentName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('serialNumber')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('maintenanceDate')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cost')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('technician')}</th>
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
                    ) : maintenanceData.length > 0 ? (
                        maintenanceData.map((maintenance) => (
                            <tr key={maintenance.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{maintenance.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{maintenance.equipmentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{maintenance.serialNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {maintenance.maintenanceDate
                                        ? format(new Date(maintenance.maintenanceDate), 'dd/MM/yyyy HH:mm')
                                        : t('noDate')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{maintenance.description || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                                            maintenance.status
                                        )}`}
                                    >
                                        {getTranslatedStatus(maintenance.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(maintenance.cost)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{maintenance.technician || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleOpenEditModal(maintenance)}
                                            className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(maintenance)}
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
                            <td colSpan="9" className="py-4 text-center text-gray-600">
                                {t('noMaintenanceData')}
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

            <AddMaintenance
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddMaintenance}
                newMaintenance={newMaintenanceData}
                onInputChange={handleAddInputChange}
                equipmentItems={equipmentItems}
                maintenanceData={maintenanceData}
            />
            <EditMaintenance
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditMaintenance}
                maintenance={selectedMaintenance || {}}
                onInputChange={handleEditInputChange}
                equipmentItems={equipmentItems}
            />
            <DeleteMaintenance
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMaintenance}
                equipmentItemName={maintenanceToDelete?.serialNumber || ''}
            />
            <ToastContainer />
        </div>
    );
}