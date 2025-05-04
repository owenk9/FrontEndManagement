import { useState, useEffect, Fragment } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AddEquipment from './AddEquipment.jsx';
import EditEquipment from './EditEquipment.jsx';
import DeleteEquipment from './DeleteEquipment.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function EquipmentList() {
    const { t } = useTranslation();

    const [equipmentData, setEquipmentData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [equipmentQuantities, setEquipmentQuantities] = useState({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        name: '',
        status: 'Active',
        purchaseDate: '',
        description: '',
        quantity: '',
        categoryId: '',
        locationId: '',
        image: null,
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(4);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEquipmentId, setExpandedEquipmentId] = useState(null);
    const [equipmentItems, setEquipmentItems] = useState({});
    const [itemsLoading, setItemsLoading] = useState({});

    const BASE_URL = 'http://localhost:9090';

    const fetchEquipmentData = async (page = 0, search = '') => {
        try {
            setLoading(true);
            const url = search
                ? `${BASE_URL}/equipment/get?name=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();

            const equipmentList = data.content || [];

            // Fetch quantities for each equipment
            const quantities = {};
            await Promise.all(
                equipmentList.map(async (equipment) => {
                    try {
                        const itemResponse = await fetch(`${BASE_URL}/item/get?equipmentId=${equipment.id}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        if (!itemResponse.ok) {
                            console.error(`Failed to fetch items for equipment ${equipment.id}`);
                            quantities[equipment.id] = 0;
                            return;
                        }
                        const items = await itemResponse.json();
                        quantities[equipment.id] = items.length;
                    } catch (err) {
                        console.error(`Error fetching items for equipment ${equipment.id}:`, err);
                        quantities[equipment.id] = 0;
                    }
                })
            );

            setEquipmentData(equipmentList);
            setEquipmentQuantities(quantities);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipmentItems = async (equipmentId) => {
        try {
            setItemsLoading((prev) => ({ ...prev, [equipmentId]: true }));
            const response = await fetch(`${BASE_URL}/item/get?equipmentId=${equipmentId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setEquipmentItems((prev) => ({ ...prev, [equipmentId]: data || [] }));
        } catch (err) {
            console.error('Failed to fetch equipment items:', err);
        } finally {
            setItemsLoading((prev) => ({ ...prev, [equipmentId]: false }));
        }
    };

    const toggleDropdown = (equipmentId) => {
        if (expandedEquipmentId === equipmentId) {
            setExpandedEquipmentId(null);
        } else {
            setExpandedEquipmentId(equipmentId);
            if (!equipmentItems[equipmentId]) {
                fetchEquipmentItems(equipmentId);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${BASE_URL}/category/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setCategories(data.content || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/location/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setLocations(data.content || []);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
        fetchEquipmentData(0, term);
    };

    useEffect(() => {
        setLoading(true);
        fetchEquipmentData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchLocations();
        fetchCategories();
    }, []);

    const handleAddEquipment = async () => {
        if (!newEquipmentData.name || !newEquipmentData.purchaseDate || !newEquipmentData.quantity || !newEquipmentData.categoryId || !newEquipmentData.locationId) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        try {
            const formData = new FormData();
            const equipmentData = {
                name: newEquipmentData.name,
                status: newEquipmentData.status,
                purchaseDate: newEquipmentData.purchaseDate,
                description: newEquipmentData.description,
                quantity: parseInt(newEquipmentData.quantity),
                categoryId: parseInt(newEquipmentData.categoryId),
                locationId: parseInt(newEquipmentData.locationId),
            };
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], { type: 'application/json' });
            formData.append('equipment', equipmentBlob);
            if (newEquipmentData.image) formData.append('image', newEquipmentData.image);

            const response = await fetch(`${BASE_URL}/equipment/add`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('addError') + errorText);
            }

            setNewEquipmentData({
                name: '',
                status: 'Active',
                purchaseDate: '',
                description: '',
                quantity: '',
                categoryId: '',
                locationId: '',
                image: null,
            });
            setIsAddModalOpen(false);
            fetchEquipmentData(currentPage, searchTerm);
        } catch (err) {
            console.error('Failed to add equipment:', err);
            alert(t('err.message'));
        }
    };

    const handleEditEquipment = async () => {
        if (!selectedEquipment.name) {
            alert(t('equipmentNameRequired'));
            return;
        }
        try {
            const formData = new FormData();
            const equipmentData = {
                name: selectedEquipment.name,
                status: selectedEquipment.status || 'Active',
                purchaseDate: selectedEquipment.purchaseDate || new Date().toISOString().slice(0, 16),
                description: selectedEquipment.description || '',
                quantity: parseInt(selectedEquipment.quantity) || 1,
                categoryId: parseInt(selectedEquipment.categoryId) || 1,
                locationId: parseInt(selectedEquipment.locationId) || 1,
            };
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], { type: 'application/json' });
            formData.append('equipment', equipmentBlob);
            if (selectedEquipment.image instanceof File) formData.append('image', selectedEquipment.image);

            const response = await fetch(`${BASE_URL}/equipment/update/${selectedEquipment.id}`, {
                method: 'PATCH',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update failed with status:', response.status, 'Response:', errorText);
                throw new Error(t('updateError'));
            }

            setIsEditModalOpen(false);
            setSelectedEquipment(null);
            fetchEquipmentData(currentPage, searchTerm);

            // Refresh items if the expanded equipment is being edited
            if (expandedEquipmentId === selectedEquipment.id) {
                fetchEquipmentItems(selectedEquipment.id);
            }
        } catch (err) {
            alert(t('err.message'));
        }
    };

    const handleDeleteEquipment = async () => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/delete/${equipmentToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('deleteError'));
            setIsDeleteModalOpen(false);
            setEquipmentToDelete(null);
            fetchEquipmentData(currentPage, searchTerm);
        } catch (err) {
            console.error(err);
            alert(t('err.message'));
        }
    };

    function getStatusColor(status) {
        switch (status) {
            case 'Broken':
            case 'BROKEN':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Active':
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Maintenance':
            case 'MAINTENANCE':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Borrowed':
            case 'BORROWED':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'Active':
            case 'ACTIVE':
                return t('statusActive');
            case 'Broken':
            case 'BROKEN':
                return t('statusBroken');
            case 'Maintenance':
            case 'MAINTENANCE':
                return t('statusMaintenance');
            case 'Borrowed':
            case 'BORROWED':
                return t('statusBorrowed');
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

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            return format(new Date(date), 'dd/MM/yyyy HH:mm');
        } catch {
            return '-';
        }
    };

    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (equipment) => {
        const selectedCategory = categories.find(cat => cat.categoryName === equipment.categoryName);
        const selectedLocation = locations.find(loc => loc.locationName === equipment.locationName);

        setSelectedEquipment({
            ...equipment,
            categoryId: selectedCategory ? selectedCategory.id : '',
            locationId: selectedLocation ? selectedLocation.id : '',
            image: null,
        });
        setIsEditModalOpen(true);
    };
    const handleOpenDeleteModal = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteModalOpen(true);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipment((prev) => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (e) => {
        setNewEquipmentData((prev) => ({ ...prev, image: e.target.files[0] }));
    };
    const handleEditImageChange = (e) => {
        setSelectedEquipment((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    if (loading && equipmentData.length === 0) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin mr-2" />
                <p>{t('loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => fetchEquipmentData(0, searchTerm)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {t('retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('equipments')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} value={searchTerm} />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addEquipment')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr className="rounded-t-lg">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('equipmentName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('image')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quantity')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchaseDate')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {equipmentData.map((equipment) => (
                        <Fragment key={`equipment-${equipment.id}`}>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{equipment.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => toggleDropdown(equipment.id)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-md shadow-sm hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-200"
                                    >
                                        {equipment.name}
                                        {expandedEquipmentId === equipment.id ? (
                                            <ChevronUp size={20} className="ml-2" />
                                        ) : (
                                            <ChevronDown size={20} className="ml-2" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {equipment.imageUrl ? (
                                        <img
                                            src={equipment.imageUrl}
                                            alt={equipment.name}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                console.error(`Failed to load image: ${equipment.imageUrl}`);
                                                e.target.src = '/fallback-image.png';
                                            }}
                                        />
                                    ) : t('noImage')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {equipmentQuantities[equipment.id] !== undefined ? equipmentQuantities[equipment.id] : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{equipment.categoryName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(equipment.purchaseDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{equipment.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-3">
                                        <button
                                            className="p-2 text-blue-700 rounded-md hover:bg-blue-100 transition duration-200"
                                            onClick={() => handleOpenEditModal(equipment)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-red-700 rounded-md hover:bg-red-100 transition duration-200"
                                            onClick={() => handleOpenDeleteModal(equipment)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedEquipmentId === equipment.id && (
                                <tr>
                                    <td colSpan="8" className="bg-gray-50 p-4">
                                        {itemsLoading[equipment.id] ? (
                                            <div className="flex justify-center items-center py-4">
                                                <Loader2 size={24} className="animate-spin text-gray-600" />
                                                <span className="ml-2 text-gray-600">{t('loading')}...</span>
                                            </div>
                                        ) : equipmentItems[equipment.id]?.length > 0 ? (
                                            <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
                                                    {equipmentItems[equipment.id].map((item) => (
                                                        <div
                                                            key={`item-${item.id}`}
                                                            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                                                        >
                                                            <div className="flex flex-col space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {t('serialNumber')}: {item.serialNumber}
                                                                    </span>
                                                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                                                                        {getTranslatedStatus(item.status)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    <span className="font-medium">{t('location')}:</span> {item.locationName || '-'}
                                                                </div>
                                                                {item.returnDate && (
                                                                    <div className="text-sm text-gray-600">
                                                                        <span className="font-medium">{t('returnDate')}:</span> {formatDate(item.returnDate)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 text-center py-4">{t('noEquipments')}</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                    </tbody>
                </table>
                {loading && equipmentData.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader2 size={24} className="animate-spin text-gray-600" />
                        <span className="ml-2 text-gray-600">{t('loading')}...</span>
                    </div>
                )}
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
            <AddEquipment
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddEquipment}
                newEquipment={newEquipmentData}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                locations={locations}
                categories={categories}
            />
            <EditEquipment
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditEquipment}
                equipment={selectedEquipment || {}}
                onInputChange={handleEditInputChange}
                onImageChange={handleEditImageChange}
                locations={locations}
                categories={categories}
            />
            <DeleteEquipment
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEquipment}
                equipmentName={equipmentToDelete?.name || ''}
            />
        </div>
    );
}