import { useState, useEffect, useCallback, Fragment } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AddLocation from './AddLocation.jsx';
import EditLocation from './EditLocation.jsx';
import DeleteLocation from './DeleteLocation.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from "../../Auth/AuthContext.jsx";
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Location({ searchQuery: propSearchQuery = '', filterParams = {} }) {
    const { t } = useTranslation();
    useNavigate();
    const { fetchWithAuth } = useAuth();

    const [locationData, setLocationData] = useState([]);
    const [equipmentItems, setEquipmentItems] = useState({});
    const [equipmentCounts, setEquipmentCounts] = useState({});
    const [itemsLoading, setItemsLoading] = useState({});
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [newLocationData, setNewLocationData] = useState({
        locationName: '',
        equipments: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState(propSearchQuery);
    const [expandedLocationId, setExpandedLocationId] = useState(null);

    const BASE_URL = 'http://localhost:9090';

    const fetchLocationData = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            let url = `${BASE_URL}/location/get?page=${page}&size=${pageSize}`;
            if (searchQuery && searchQuery.trim() !== '') {
                url = `${BASE_URL}/location/get?page=${page}&size=${pageSize}&name=${encodeURIComponent(searchQuery)}`;
            }
            if (filterParams.filterLocation) url += `&locationId=${filterParams.filterLocation}`;

            console.log('Fetching URL:', url);
            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403) {
                    throw new Error(`${t('unauthorized')}: ${errorText}`);
                }
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }

            const data = await response.json();
            const locationList = data.content || [];

            const counts = {};
            await Promise.all(
                locationList.map(async (location) => {
                    try {
                        const itemResponse = await fetchWithAuth(`${BASE_URL}/item/get?locationId=${location.id}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        if (!itemResponse.ok) {
                            console.error(`Failed to fetch items for location ${location.id}`);
                            counts[location.id] = 0;
                            return;
                        }
                        const items = await itemResponse.json();
                        counts[location.id] = items.length;
                    } catch (err) {
                        console.error(`Error fetching items for location ${location.id}:`, err);
                        counts[location.id] = 0;
                    }
                })
            );

            setLocationData(locationList);
            setEquipmentCounts(counts);
            setTotalPages(data.page.totalPages || 1);
        } catch (err) {
            console.error('Fetch location error:', err);
            setError(err.message);
            setLocationData([]);
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
    }, [fetchWithAuth, searchQuery, pageSize, filterParams.filterLocation, t]);

    const fetchEquipmentItems = useCallback(async (locationId) => {
        try {
            setItemsLoading((prev) => ({ ...prev, [locationId]: true }));
            const response = await fetchWithAuth(`${BASE_URL}/item/get?locationId=${locationId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${t('fetchError')}: ${errorText}`);
            }
            const data = await response.json();
            setEquipmentItems((prev) => ({
                ...prev,
                [locationId]: data || [],
            }));
            setEquipmentCounts((prev) => ({
                ...prev,
                [locationId]: data.length,
            }));
        } catch (err) {
            console.error(`Failed to fetch equipment items for location ${locationId}:`, err);
            setError(err.message);
            toast.error(err.message || t('fetchError'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setItemsLoading((prev) => ({ ...prev, [locationId]: false }));
        }
    }, [fetchWithAuth, t]);

    const debouncedFetchLocationData = useCallback(
        debounce((page) => {
            console.log('Debounced fetch triggered for page:', page, 'with searchQuery:', searchQuery);
            fetchLocationData(page);
        }, 200),
        [fetchLocationData]
    );

    const handleSearch = (query) => {
        console.log('Search query updated:', query);
        setSearchQuery(query);
        setCurrentPage(0);
    };

    useEffect(() => {
        console.log('First useEffect triggered with searchQuery:', searchQuery, 'filterParams:', filterParams);
        setLoading(true);
        setCurrentPage(0);
        debouncedFetchLocationData(0);
        return () => debouncedFetchLocationData.cancel();
    }, [searchQuery, filterParams.filterLocation]);

    useEffect(() => {
            debouncedFetchLocationData(currentPage);
        return () => debouncedFetchLocationData.cancel();
    }, [currentPage]);

    const handleOpenAddLocationModal = () => {
        setIsAddLocationModalOpen(true);
    };

    const handleAddLocation = async () => {
        if (!newLocationData.locationName) {
            toast.error('Add fail. Please fill location name', {
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
            const response = await fetchWithAuth(`${BASE_URL}/location/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationName: newLocationData.locationName,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 409 && errorText.includes('already exists')) {
                    throw new Error(`Update fail. Location with name ${newLocationData.locationName} already exists`);
                }
                throw new Error(t('updateError') + ': ' + errorText);
            }
            toast.success(t('locationAddedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setNewLocationData({ locationName: '', equipments: '' });
            setIsAddLocationModalOpen(false);
            fetchLocationData(currentPage);
        } catch (err) {
            console.error("Failed to add location", err);
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

    const handleOpenEditModal = (location) => {
        setSelectedLocation({ ...location });
        setIsEditModalOpen(true);
    };

    const handleEditLocation = async () => {
        if (!selectedLocation.locationName) {
            toast.error(t('fillRequiredLocationFields'), {
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
            const response = await fetchWithAuth(`${BASE_URL}/location/update/${selectedLocation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationName: selectedLocation.locationName,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 500 && errorText.includes('already exists')) {
                    throw new Error(`Update fail. Location with name ${newLocationData.locationName} already exists`);
                }
                throw new Error(t('updateError') + ': ' + errorText);
            }

            toast.success(t('locationUpdatedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsEditModalOpen(false);
            setSelectedLocation(null);
            fetchLocationData(currentPage);
        } catch (err) {
            console.error(`Failed to update location:`, err);
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

    const handleOpenDeleteModal = (location) => {
        setLocationToDelete(location);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteLocation = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/location/delete/${locationToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
            toast.success(t('locationDeletedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsDeleteModalOpen(false);
            setLocationToDelete(null);
            fetchLocationData(currentPage);
        } catch (err) {
            console.error(`Failed to delete location:`, err);
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

    const handleLocationInputChange = (e) => {
        const { name, value } = e.target;
        setNewLocationData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedLocation((prev) => ({ ...prev, [name]: value }));
    };

    const toggleRowExpansion = (locationId) => {
        if (expandedLocationId === locationId) {
            setExpandedLocationId(null);
        } else {
            setExpandedLocationId(locationId);
            if (!equipmentItems[locationId]) {
                fetchEquipmentItems(locationId);
            }
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

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            return format(new Date(date), 'dd/MM/yyyy HH:mm');
        } catch {
            return '-';
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

    if (error) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => fetchLocationData(0)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {t('retry')}
                </button>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('locations')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddLocationModal}
                >
                    <Plus size={16} />
                    {t('addLocation')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr className="rounded-t-lg">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('locationName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('equipment')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading && locationData.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-600">
                                {t('loading')}...
                            </td>
                        </tr>
                    ) : locationData.length > 0 ? (
                        locationData.map((location) => (
                            <Fragment key={location.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{location.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{location.locationName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        <button
                                            onClick={() => toggleRowExpansion(location.id)}
                                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-md shadow-sm hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-200"
                                        >
                                            {equipmentCounts[location.id] !== undefined ? equipmentCounts[location.id] : 0} {t('equipments')}
                                            {expandedLocationId === location.id ? <ChevronUp size={20} /> :
                                                <ChevronDown size={20} />}
                                        </button>
                                    </td>
                                    <td className="py-4 px-6 text-center w-[150px]">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleOpenEditModal(location)}
                                                className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteModal(location)}
                                                className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedLocationId === location.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan="4" className="p-4">
                                            {itemsLoading[location.id] ? (
                                                <div className="flex justify-center items-center py-4">
                                                    <Loader2 size={24} className="animate-spin text-gray-600" />
                                                    <span className="ml-2 text-gray-600">{t('loading')}...</span>
                                                </div>
                                            ) : equipmentItems[location.id]?.length > 0 ? (
                                                <div
                                                    className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
                                                        {equipmentItems[location.id].map((item, index) => (
                                                            <div
                                                                key={`item-${item.id}`}
                                                                className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors duration-200 ${
                                                                    index < equipmentItems[location.id].length - 1 ? 'border-b border-gray-200' : ''
                                                                }`}
                                                            >
                                                                <div className="flex flex-col space-y-2">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                {t('equipmentName')}: {item.equipmentName}
                                                                            </span>
                                                                            <span
                                                                                className="text-sm font-medium pt-3 text-gray-900">
                                                                                {t('serialNumber')}: {item.serialNumber}
                                                                            </span>
                                                                        </div>
                                                                        <span
                                                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                                                                item.status
                                                                            )}`}
                                                                        >
                                                                            {getTranslatedStatus(item.status)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        <span
                                                                            className="font-medium">{t('location')}:</span> {item.locationName || '-'}
                                                                    </div>
                                                                    {item.returnDate && (
                                                                        <div className="text-sm text-gray-600">
                                                                            <span
                                                                                className="font-medium">{t('returnDate')}:</span> {formatDate(item.returnDate)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-600 text-center py-4">{t('noEquipment')}</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-600">
                                {t('noLocations')}
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

            <AddLocation
                isOpen={isAddLocationModalOpen}
                onClose={() => setIsAddLocationModalOpen(false)}
                onSave={handleAddLocation}
                newLocation={newLocationData}
                onInputChange={handleLocationInputChange}
            />

            <EditLocation
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditLocation}
                location={selectedLocation || {}}
                onInputChange={handleEditInputChange}
            />

            <DeleteLocation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteLocation}
                locationName={locationToDelete?.locationName || ''}
            />
            <ToastContainer />
        </div>
    );
}