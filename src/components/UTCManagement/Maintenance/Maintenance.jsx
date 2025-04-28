import { useState, useEffect } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddMaintenance from './AddMaintenance.jsx';
import EditMaintenance from './EditMaintenance.jsx';
import DeleteMaintenance from './DeleteMaintenance.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function Maintenance() {
    const { t } = useTranslation();

    const [maintenanceData, setMaintenanceData] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newMaintenanceData, setNewMaintenanceData] = useState({
        equipmentId: '',
        maintenanceDate: '',
        description: '',
        status: 'Pending',
        cost: '',
        technician: '',
    });
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm] = useState('');

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

    const fetchMaintenanceData = async (page = 0, search = '') => {
        try {
            const url = search
                ? `${BASE_URL}/maintenance/get?name=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/maintenance/get?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setMaintenanceData(data.content || []);
            setTotalPages(data.page.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipments = async () => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setEquipments(data.content || []);
        } catch (err) {
            console.error('Failed to fetch equipments:', err);
        }
    };

    const handleSearch = (term) => {
        fetchMaintenanceData(currentPage, term);
    };

    useEffect(() => {
        setLoading(true);
        fetchMaintenanceData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchEquipments();
    }, []);

    const handleAddMaintenance = async () => {
        if (!newMaintenanceData.equipmentId || !newMaintenanceData.maintenanceDate || !newMaintenanceData.cost || !newMaintenanceData.technician) {
            alert(t('fillRequiredMaintenanceFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/maintenance/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentId: parseInt(newMaintenanceData.equipmentId),
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
            setNewMaintenanceData({
                equipmentId: '',
                maintenanceDate: '',
                description: '',
                status: 'Pending',
                cost: '',
                technician: '',
            });
            setIsAddModalOpen(false);
            fetchMaintenanceData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditMaintenance = async () => {
        if (!selectedMaintenance.equipmentId || !selectedMaintenance.maintenanceDate || !selectedMaintenance.cost || !selectedMaintenance.technician) {
            alert(t('fillRequiredMaintenanceFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/maintenance/update/${selectedMaintenance.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentId: parseInt(selectedMaintenance.equipmentId),
                    maintenanceDate: selectedMaintenance.maintenanceDate,
                    description: selectedMaintenance.description || '',
                    status: selectedMaintenance.status || 'Pending',
                    cost: parseFloat(selectedMaintenance.cost),
                    technician: selectedMaintenance.technician,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('updateError') + ': ' + errorText);
            }
            setIsEditModalOpen(false);
            setSelectedMaintenance(null);
            fetchMaintenanceData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteMaintenance = async () => {
        try {
            const response = await fetch(`${BASE_URL}/maintenance/delete/${maintenanceToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
            setIsDeleteModalOpen(false);
            setMaintenanceToDelete(null);
            fetchMaintenanceData(currentPage, searchTerm);
        } catch (err) {
            alert(err.message);
        }
    };

    function getStatusColor(status) {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Waiting for Parts':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Canceled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'Pending':
                return t('statusPending');
            case 'In Progress':
                return t('statusInProgress');
            case 'Waiting for Parts':
                return t('statusWaitingForParts');
            case 'Completed':
                return t('statusCompleted');
            case 'Canceled':
                return t('statusCanceled');
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

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };



    const handleOpenEditModal = (maintenance) => {
        const selectedEquipment = equipments.find(equip => equip.name === maintenance.equipmentName);
        setSelectedMaintenance({
            ...maintenance,
            equipmentId: selectedEquipment ? selectedEquipment.id : '',
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


    if (loading) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p>{t('loading')}</p></div>;
    if (error) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p className="text-red-600">{t('error')}: {error}</p></div>;

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
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipmentName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('maintenanceDate')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">{t('description')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-[150px]">{t('status')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-[100px]">{t('cost')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">{t('technician')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {maintenanceData.map((maintenance) => (
                        <tr key={maintenance.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{maintenance.id}</td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.equipmentName}</td>
                            <td className="py-4 px-6 text-gray-800">
                                {maintenance.maintenanceDate
                                    ? format(new Date(maintenance.maintenanceDate), 'dd/MM/yyyy HH:mm')
                                    : t('noDate')}
                            </td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.description || 'N/A'}</td>
                            <td className="py-4 px-6">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                                            maintenance.status
                                        )}`}
                                    >
                                        {getTranslatedStatus(maintenance.status)}
                                    </span>
                            </td>
                            <td className="py-4 px-6 text-gray-800">{formatCurrency(maintenance.cost)}</td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.technician || 'N/A'}</td>
                            <td className="py-4 px-6 text-center">
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

            <AddMaintenance
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddMaintenance}
                newMaintenance={newMaintenanceData}
                onInputChange={handleAddInputChange}
                equipments={equipments}
            />
            <EditMaintenance
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditMaintenance}
                maintenance={selectedMaintenance || {}}
                onInputChange={handleEditInputChange}
                equipments={equipments}
            />
            <DeleteMaintenance
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMaintenance}
                equipmentName={maintenanceToDelete?.equipmentName || ''}
            />
        </div>
    );
}