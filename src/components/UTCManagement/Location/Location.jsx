import { useState, useEffect, Fragment } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AddLocation from './AddLocation.jsx';
import EditLocation from './EditLocation.jsx';
import DeleteLocation from './DeleteLocation.jsx';
import { useTranslation } from 'react-i18next';

export default function Location() {
    const { t } = useTranslation();

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const BASE_URL = 'http://localhost:9090';

    const fetchLocationData = async (page = 0, search = '') => {
        try {
            setLoading(true);
            const url = search
                ? `${BASE_URL}/location/get?name=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/location/get?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            const locationList = data.content || [];

            // Fetch equipment counts for each location
            const counts = {};
            await Promise.all(
                locationList.map(async (location) => {
                    try {
                        const itemResponse = await fetch(`${BASE_URL}/item/get?locationId=${location.id}`, {
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
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipmentItems = async (locationId) => {
        try {
            setItemsLoading((prev) => ({ ...prev, [locationId]: true }));
            const response = await fetch(`${BASE_URL}/item/get?locationId=${locationId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
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
        } finally {
            setItemsLoading((prev) => ({ ...prev, [locationId]: false }));
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
        fetchLocationData(0, term);
    };

    useEffect(() => {
        setLoading(true);
        fetchLocationData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleOpenAddLocationModal = () => {
        setIsAddLocationModalOpen(true);
    };

    const handleAddLocation = async () => {
        if (!newLocationData.locationName) {
            alert(t('fillRequiredLocationFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/location/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationName: newLocationData.locationName,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('addError') + ': ' + errorText);
            }
            setNewLocationData({ locationName: '', equipments: '' });
            setIsAddLocationModalOpen(false);
            fetchLocationData(currentPage, searchTerm);
        } catch (err) {
            alert(t('err.message'));
        }
    };

    const handleOpenEditModal = (location) => {
        setSelectedLocation({ ...location });
        setIsEditModalOpen(true);
    };

    const handleEditLocation = async () => {
        if (!selectedLocation.locationName) {
            alert(t('fillRequiredLocationFields'));
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/location/update/${selectedLocation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationName: selectedLocation.locationName,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('updateError') + ': ' + errorText);
            }
            setIsEditModalOpen(false);
            setSelectedLocation(null);
            fetchLocationData(currentPage, searchTerm);
        } catch (err) {
            alert(t('err.message'));
        }
    };

    const handleOpenDeleteModal = (location) => {
        setLocationToDelete(location);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteLocation = async () => {
        try {
            const response = await fetch(`${BASE_URL}/location/delete/${locationToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(t('deleteError') + ': ' + errorText);
            }
            setIsDeleteModalOpen(false);
            setLocationToDelete(null);
            fetchLocationData(currentPage, searchTerm);
        } catch (err) {
            alert(t('err.message'));
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
        setExpandedRows((prev) => ({
            ...prev,
            [locationId]: !prev[locationId],
        }));
        if (!expandedRows[locationId] && !equipmentItems[locationId]) {
            fetchEquipmentItems(locationId);
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

    if (loading && locationData.length === 0) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <Loader2 size={24} className="animate-spin mr-2" />
                <p>{t('loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
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
                    <tbody>
                    {locationData.map((location) => (
                        <Fragment key={location.id}>
                            <tr className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{location.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{location.locationName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <button
                                        onClick={() => toggleRowExpansion(location.id)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-md shadow-sm hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-200"
                                    >
                                        {equipmentCounts[location.id] !== undefined ? equipmentCounts[location.id] : 0} {t('equipments')}
                                        {expandedRows[location.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                            {expandedRows[location.id] && (
                                <tr className="bg-gray-50">
                                    <td colSpan="4" className="py-2 px-6">
                                        {itemsLoading[location.id] ? (
                                            <div className="flex justify-center items-center py-4">
                                                <Loader2 size={24} className="animate-spin text-gray-600" />
                                                <span className="ml-2 text-gray-600">{t('loading')}...</span>
                                            </div>
                                        ) : equipmentItems[location.id]?.length > 0 ? (
                                            <table className="w-full table-fixed">
                                                <thead>
                                                <tr className="text-gray-600">
                                                    <th className="py-2 px-4 text-left w-[100px]">{t('id')}</th>
                                                    <th className="py-2 px-4 text-left">{t('equipmentName')}</th>
                                                    <th className="py-2 px-4 text-left w-[150px]">{t('status')}</th>
                                                    <th className="py-2 px-4 text-left">{t('description')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {equipmentItems[location.id].map((item) => (
                                                    <tr key={item.id} className="border-t border-gray-200">
                                                        <td className="py-2 px-4 w-[100px]">{item.id}</td>
                                                        <td className="py-2 px-4">{item.equipmentName || 'N/A'}</td>
                                                        <td className="py-2 px-4 w-[150px]">
                                                                    <span
                                                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                                                                            item.status
                                                                        )}`}
                                                                    >
                                                                        {getTranslatedStatus(item.status)}
                                                                    </span>
                                                        </td>
                                                        <td className="py-2 px-4">{item.description || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="text-gray-600 text-center py-4">{t('noEquipment')}</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                    </tbody>
                </table>
                {!loading && !error && locationData.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 text-center">{t('noLocations')}</p>
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
        </div>
    );
}