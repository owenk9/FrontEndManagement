import { useState, useEffect, Fragment, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Loader2, History } from 'lucide-react';
import AddEquipment from './AddEquipment.jsx';
import EditEquipment from './EditEquipment.jsx';
import DeleteEquipment from './DeleteEquipment.jsx';
import AddEquipmentItem from './AddEquipmentItem.jsx';
import EditEquipmentItem from './EditEquipmentItem.jsx';
import DeleteEquipmentItem from './DeleteEquipmentItem.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '../../Auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

export default function EquipmentList() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const navigate = useNavigate();
    const [equipmentData, setEquipmentData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        name: '',
        description: '',
        quantity: '',
        categoryId: '',
        image: null,
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [selectedEquipmentForItem, setSelectedEquipmentForItem] = useState(null);
    const [newEquipmentItemData, setNewEquipmentItemData] = useState({
        serialNumber: '',
        status: 'Active',
        purchaseDate: '',
        locationId: '',
        returnDate: '',
        equipmentId: '',
    });
    const [selectedEquipmentItem, setSelectedEquipmentItem] = useState(null);
    const [equipmentItemToDelete, setEquipmentItemToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(7);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedEquipmentId, setExpandedEquipmentId] = useState(null);
    const [equipmentItems, setEquipmentItems] = useState({});
    const [itemsLoading, setItemsLoading] = useState({});
    const [renderKey, setRenderKey] = useState(0);
    const [filterLocationId, setFilterLocationId] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const fetchEquipmentData = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            let url = `${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`;
            if (searchQuery) url += `&name=${encodeURIComponent(searchQuery)}`;
            if (filterLocationId) url += `&locationId=${filterLocationId}`;
            if (filterCategoryId) url += `&categoryId=${filterCategoryId}`;

            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText || t('fetchError')}`);
            }
            const data = await response.json();
            const equipmentList = data.content || [];
            setEquipmentData(equipmentList);
            setTotalPages(data.page?.totalPages || 1);
        } catch (err) {
            console.error('Fetch equipment data error:', err);
            setError(err.message);
            setEquipmentData([]);
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
    }, [fetchWithAuth, pageSize, searchQuery, filterLocationId, filterCategoryId, t]);

    const fetchEquipmentItems = async (equipmentId) => {
        if (!equipmentId || isNaN(equipmentId)) {
            console.error('Invalid equipmentId:', equipmentId);
            return;
        }
        try {
            setItemsLoading((prev) => ({ ...prev, [equipmentId]: true }));
            let url = `${BASE_URL}/item/get?equipmentId=${equipmentId}`;
            if (filterLocationId) url += `&locationId=${filterLocationId}`;
            if (filterCategoryId) url += `&categoryId=${filterCategoryId}`;

            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setEquipmentItems((prev) => ({ ...prev, [equipmentId]: data || [] }));
        } catch (err) {
            console.error('Failed to fetch equipment items:', err);
            toast.error(t('fetchError'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setItemsLoading((prev) => ({ ...prev, [equipmentId]: false }));
        }
    };

    const toggleDropdown = (equipmentId) => {
        if (!equipmentId || isNaN(equipmentId)) {
            console.error('Invalid equipmentId for toggle:', equipmentId);
            return;
        }
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
            let allCategories = [];
            let page = 0;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await fetchWithAuth(`${BASE_URL}/category/get?page=${page}&size=${pageSize}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(t('fetchError'));
                const data = await response.json();
                allCategories = [...allCategories, ...(data.content || [])];
                setCategories(allCategories);
                if (data.page?.totalPages && page + 1 < data.page.totalPages) {
                    page++;
                } else {
                    hasMore = false;
                }
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            toast.error(t('fetchError'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const fetchLocations = async () => {
        try {
            let allLocations = [];
            let page = 0;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await fetchWithAuth(`${BASE_URL}/location/get?page=${page}&size=${pageSize}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(t('fetchError'));
                const data = await response.json();
                allLocations = [...allLocations, ...(data.content || [])];
                setLocations(allLocations);
                if (data.page?.totalPages && page + 1 < data.page.totalPages) {
                    page++;
                } else {
                    hasMore = false;
                }
            }
        } catch (err) {
            console.error('Failed to fetch locations:', err);
            toast.error(t('fetchError'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const debouncedFetchEquipmentData = useCallback(
        debounce((page) => {
            console.log('Debounced fetch triggered for page:', page);
            fetchEquipmentData(page);
        }, 200),
        [fetchEquipmentData]
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(0);
    };

    const handleFilterChange = (type, value) => {
        switch (type) {
            case 'location':
                setFilterLocationId(value);
                break;
            case 'category':
                setFilterCategoryId(value);
                break;
            default:
                break;
        }
        setCurrentPage(0);
    };

    useEffect(() => {
        setLoading(true);
        setCurrentPage(0);
        debouncedFetchEquipmentData(0);
        return () => debouncedFetchEquipmentData.cancel();
    }, [searchQuery, filterLocationId, filterCategoryId, debouncedFetchEquipmentData]);

    useEffect(() => {
        debouncedFetchEquipmentData(currentPage);
        return () => debouncedFetchEquipmentData.cancel();
    }, [currentPage, debouncedFetchEquipmentData]);

    useEffect(() => {
        fetchLocations();
        fetchCategories();
    }, [fetchWithAuth]);

    useEffect(() => {
        setEquipmentItems({});
        equipmentData.forEach((equipment) => fetchEquipmentItems(equipment.id));
    }, [equipmentData, filterLocationId, filterCategoryId]);

    const handleAddEquipment = async () => {
        if (!newEquipmentData.name) {
            toast.error('Add fail. Please fill equipment name', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        if (!newEquipmentData.categoryId) {
            toast.error('Add fail. Please select a category', {
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
            const formData = new FormData();
            const equipmentData = {
                name: newEquipmentData.name,
                status: newEquipmentData.status,
                description: newEquipmentData.description,
                quantity: parseInt(newEquipmentData.quantity) || 0,
                categoryId: parseInt(newEquipmentData.categoryId) || 0,
                locationId: parseInt(newEquipmentData.locationId) || 0,
            };
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], { type: 'application/json' });
            formData.append('equipment', equipmentBlob);
            if (newEquipmentData.image) formData.append('image', newEquipmentData.image);

            const response = await fetchWithAuth(`${BASE_URL}/equipment/add`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = JSON.parse(errorText);
                if (response.status === 409 && errorMessage.message.includes('already exists')) {
                    throw new Error(`Add fail. Equipment with name ${newEquipmentData.name} already exists`);
                }
                throw new Error(`Add fail. ${t('addError')}`);
            }

            toast.success(t('equipmentAddedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

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
            await fetchEquipmentData(currentPage);
        } catch (err) {
            console.error('Failed to add equipment:', err);
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

    const handleAddEquipmentItem = async () => {
        if (!newEquipmentItemData.serialNumber) {
            toast.error('Add fail. Please fill serial number', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        if (!newEquipmentItemData.locationId) {
            toast.error('Add fail. Please select a location', {
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
            const itemData = {
                serialNumber: newEquipmentItemData.serialNumber,
                status: newEquipmentItemData.status,
                locationId: parseInt(newEquipmentItemData.locationId) || 0,
                purchaseDate: formatDateForAPI(newEquipmentItemData.purchaseDate),
                equipmentId: parseInt(newEquipmentItemData.equipmentId),
            };

            const response = await fetchWithAuth(`${BASE_URL}/item/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = JSON.parse(errorText);
                if (response.status === 409 && errorMessage.message.includes('already exists')) {
                    throw new Error(`Add fail. Serial number ${newEquipmentItemData.serialNumber} already exists`);
                }
                throw new Error(`Add fail. ${t('addItemError')}`);
            }

            toast.success(t('equipmentItemAddedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setNewEquipmentItemData({
                serialNumber: '',
                status: 'Active',
                locationId: '',
                returnDate: '',
                equipmentId: '',
            });
            setIsAddItemModalOpen(false);
            setSelectedEquipmentForItem(null);
            await fetchEquipmentItems(newEquipmentItemData.equipmentId);
            await fetchEquipmentData(currentPage);
            if (expandedEquipmentId === newEquipmentItemData.equipmentId) {
                await fetchEquipmentItems(newEquipmentItemData.equipmentId);
            }
        } catch (err) {
            console.error('Failed to add equipment item:', err);
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

    const handleEditEquipment = async () => {
        if (!selectedEquipment.categoryId) {
            toast.error('Update fail. Please select a category', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        if (!selectedEquipment.name) {
            toast.error(t('equipmentNameRequired'), {
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
            const formData = new FormData();
            const equipmentData = {
                name: selectedEquipment.name,
                status: selectedEquipment.status || 'Active',
                description: selectedEquipment.description || '',
                quantity: parseInt(selectedEquipment.quantity) || 1,
                categoryId: parseInt(selectedEquipment.categoryId) || 1,
                locationId: parseInt(selectedEquipment.locationId) || 1,
            };
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], { type: 'application/json' });
            formData.append('equipment', equipmentBlob);
            if (selectedEquipment.image instanceof File) formData.append('image', selectedEquipment.image);

            const response = await fetchWithAuth(`${BASE_URL}/equipment/update/${selectedEquipment.id}`, {
                method: 'PATCH',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = JSON.parse(errorText);
                if (response.status === 409 && errorMessage.message.includes('already exists')) {
                    throw new Error(`Update fail. Equipment with name ${newEquipmentData.name} already exists`);
                }
                throw new Error(`Update fail. ${t('updateError')}`);
            }

            toast.success(t('equipmentUpdatedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setIsEditModalOpen(false);
            setSelectedEquipment(null);
            await fetchEquipmentData(currentPage);

            if (expandedEquipmentId === selectedEquipment.id) {
                await fetchEquipmentItems(selectedEquipment.id);
            }
        } catch (err) {
            console.error('Failed to update equipment:', err);
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

    const handleEditEquipmentItem = async () => {
        if (!selectedEquipmentItem.locationId) {
            toast.error('Update fail. Please select a location', {
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
            const itemData = {
                serialNumber: selectedEquipmentItem.serialNumber,
                status: selectedEquipmentItem.status || 'ACTIVE',
                purchaseDate: formatDateForAPI(selectedEquipmentItem.purchaseDate),
                locationId: parseInt(selectedEquipmentItem.locationId) || 0,
                equipmentId: parseInt(selectedEquipmentItem.equipmentId),
            };

            setEquipmentItems((prev) => {
                const newItems = { ...prev };
                if (newItems[selectedEquipmentItem.equipmentId]) {
                    newItems[selectedEquipmentItem.equipmentId] = newItems[selectedEquipmentItem.equipmentId].map((item) =>
                        item.id === selectedEquipmentItem.id ? { ...item, ...itemData } : item
                    );
                }
                return newItems;
            });
            setRenderKey((prev) => prev + 1);

            const response = await fetchWithAuth(`${BASE_URL}/item/update/${selectedEquipmentItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = JSON.parse(errorText);
                if (response.status === 409 && errorMessage.message.includes('already exists')) {
                    throw new Error(`Update fail. Serial number ${newEquipmentItemData.serialNumber} already exists`);
                }
                throw new Error(`Update fail. ${t('updateItemError')}`);
            }

            toast.success(t('equipmentItemUpdatedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setIsEditItemModalOpen(false);
            setSelectedEquipmentItem(null);
            await fetchEquipmentItems(selectedEquipmentItem.equipmentId);
        } catch (err) {
            console.error('Failed to update equipment item:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            await fetchEquipmentItems(selectedEquipmentItem.equipmentId);
        }
    };

    const handleDeleteEquipment = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/equipment/delete/${equipmentToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(`Delete fail. ${t('deleteError')}`);
            toast.success(t('equipmentDeletedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsDeleteModalOpen(false);
            setEquipmentToDelete(null);
            await fetchEquipmentData(currentPage);
        } catch (err) {
            console.error(err);
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

    const handleDeleteEquipmentItem = async () => {
        try {
            setEquipmentItems((prev) => {
                const newItems = { ...prev };
                if (newItems[equipmentItemToDelete.equipmentId]) {
                    newItems[equipmentItemToDelete.equipmentId] = newItems[equipmentItemToDelete.equipmentId].filter(
                        (item) => item.id !== equipmentItemToDelete.id
                    );
                }
                return newItems;
            });
            setRenderKey((prev) => prev + 1);

            const response = await fetchWithAuth(`${BASE_URL}/item/delete/${equipmentItemToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`Delete fail. ${t('deleteItemError')}`);

            toast.success(t('equipmentItemDeletedSuccessfully'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            await fetchEquipmentData(currentPage);
            setIsDeleteItemModalOpen(false);
            setEquipmentItemToDelete(null);
        } catch (err) {
            console.error('Failed to delete equipment item:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            await fetchEquipmentItems(equipmentItemToDelete.equipmentId);
        }
    };

    function getStatusColor(status) {
        switch (status) {
            case 'BROKEN':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'MAINTENANCE':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            // case 'BORROWED':
            //     return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'ACTIVE':
                return t('statusActive');
            case 'BROKEN':
                return t('statusBroken');
            case 'MAINTENANCE':
                return t('statusMaintenance');
            default:
                return status;
        }
    };

    const getStatusDistribution = (equipmentId) => {
        const items = equipmentItems[equipmentId] || [];
        const statusCount = {
            ACTIVE: 0,
            BROKEN: 0,
            MAINTENANCE: 0,
            BORROWED: 0,
        };
        items.forEach((item) => {
            switch (item.status) {
                case 'ACTIVE':
                    statusCount.ACTIVE++;
                    break;
                case 'BROKEN':
                    statusCount.BROKEN++;
                    break;
                case 'MAINTENANCE':
                    statusCount.MAINTENANCE++;
                    break;
                case 'BORROWED':
                    statusCount.BORROWED++;
                    break;
            }
        });
        return `${statusCount.ACTIVE}/${statusCount.BROKEN}/${statusCount.MAINTENANCE}`;
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
                        currentPage === i ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
        } catch (error) {
            console.error('Date formatting error:', error, 'Original date:', date);
            return '-';
        }
    };
    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        if (dateString.length === 10) {
            return dateString + 'T00:00:00';
        }
        return dateString;
    };
    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (equipment) => {
        const selectedCategory = categories.find((cat) => cat.categoryName === equipment.categoryName);
        const selectedLocation = locations.find((loc) => loc.locationName === equipment.locationName);

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
    const handleOpenAddItemModal = (equipment) => {
        setSelectedEquipmentForItem(equipment);
        setNewEquipmentItemData({
            serialNumber: '',
            status: 'ACTIVE',
            locationId: '',
            returnDate: '',
            equipmentId: equipment.id,
        });
        setIsAddItemModalOpen(true);
    };
    const handleOpenEditItemModal = (item) => {
        const selectedLocation = locations.find((loc) => loc.locationName === item.locationName);
        setSelectedEquipmentItem({
            ...item,
            locationId: selectedLocation ? selectedLocation.id : item.locationId || '',
            returnDate: item.returnDate || '',
            equipmentId: item.equipmentId,
        });
        setIsEditItemModalOpen(true);
    };
    const handleOpenDeleteItemModal = (item) => {
        setEquipmentItemToDelete(item);
        setIsDeleteItemModalOpen(true);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipment((prev) => ({ ...prev, [name]: value }));
    };
    const handleItemInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentItemData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditItemInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipmentItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleImageChange = (e) => {
        setNewEquipmentData((prev) => ({ ...prev, image: e.target.files[0] }));
    };
    const handleEditImageChange = (e) => {
        setSelectedEquipment((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleOpenMaintenanceHistory = (item) => {
        if (!item || !item.id) {
            console.error('Invalid equipment item:', item);
            toast.error(t('error') + ': Invalid equipment item', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        navigate(`/maintenance-history/${item.id}`, { state: { serialNumber: item.serialNumber } });
    };

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => fetchEquipmentData(0)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {t('retry')}
                </button>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto" key={renderKey}>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('equipments')}</h1>
            </div>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <SearchBar onSearch={handleSearch} />
                    <select
                        value={filterLocationId}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="border border-gray-300 rounded-md p-2 h-10"
                    >
                        <option value="">{t('allLocations')}</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.locationName}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterCategoryId}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="border border-gray-300 rounded-md p-2 h-10"
                    >
                        <option value="">{t('allCategories')}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {loading && equipmentData.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-600">
                                <Loader2 size={24} className="animate-spin inline-block mr-2" />
                                {t('loading')}...
                            </td>
                        </tr>
                    ) : equipmentData.length > 0 ? (
                        equipmentData.map((equipment) => (
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
                                        {equipmentItems[equipment.id] ? equipmentItems[equipment.id].length : '0'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="flex items-center text-center space-x-1">
                                            <span className={`inline-block px-1 text-xs font-medium ${getStatusColor('ACTIVE')}`}>
                                                {equipmentItems[equipment.id] ? getStatusDistribution(equipment.id).split('/')[0] : '0'}
                                            </span>
                                            <span className="text-gray-500">/</span>
                                            <span className={`inline-block px-1 text-xs font-medium ${getStatusColor('BROKEN')}`}>
                                                {equipmentItems[equipment.id] ? getStatusDistribution(equipment.id).split('/')[1] : '0'}
                                            </span>
                                            <span className="text-gray-500">/</span>
                                            <span className={`inline-block px-1 text-xs font-medium ${getStatusColor('MAINTENANCE')}`}>
                                                {equipmentItems[equipment.id] ? getStatusDistribution(equipment.id).split('/')[2] : '0'}
                                            </span>
                                            {/*<span className="text-gray-500">/</span>*/}
                                            {/*<span className={`inline-block px-1 text-xs font-medium ${getStatusColor('BORROWED')}`}>*/}
                                            {/*    {equipmentItems[equipment.id] ? getStatusDistribution(equipment.id).split('/')[3] : '0'}*/}
                                            {/*</span>*/}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{equipment.categoryName}</td>
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
                                            <button
                                                className="p-2 text-green-700 rounded-md hover:bg-green-100 transition duration-200"
                                                onClick={() => handleOpenAddItemModal(equipment)}
                                            >
                                                <Plus size={16} />
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
                                                                            {t('serialNumber')}: {item.serialNumber || '-'}
                                                                        </span>
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                className="p-1 text-blue-700 rounded-md hover:bg-blue-100 transition duration-200"
                                                                                onClick={() => handleOpenEditItemModal(item)}
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                className="p-1 text-red-700 rounded-md hover:bg-red-100 transition duration-200"
                                                                                onClick={() => handleOpenDeleteItemModal(item)}
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                            <button
                                                                                className="p-1 text-purple-700 rounded-md hover:bg-purple-100 transition duration-200"
                                                                                onClick={() => handleOpenMaintenanceHistory(item)}
                                                                            >
                                                                                <History size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <span
                                                                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full border w-fit ${getStatusColor(item.status)}`}
                                                                    >
                                                                        {getTranslatedStatus(item.status) || '-'}
                                                                    </span>
                                                                    <div className="text-sm text-gray-600">
                                                                        <span className="font-medium">{t('purchaseDate')}:</span> {formatDate(item.purchaseDate) || '-'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        <span className="font-medium">{t('location')}:</span> {item.locationName || '-'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-600 text-center py-4">{t('noItems')}</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-600">
                                {t('noEquipmentFound')}
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
            <AddEquipmentItem
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onSave={handleAddEquipmentItem}
                newEquipmentItem={newEquipmentItemData}
                onInputChange={handleItemInputChange}
                locations={locations}
                equipmentName={selectedEquipmentForItem?.name || ''}
            />
            <EditEquipmentItem
                isOpen={isEditItemModalOpen}
                onClose={() => setIsEditItemModalOpen(false)}
                onSave={handleEditEquipmentItem}
                equipmentItem={selectedEquipmentItem || {}}
                onInputChange={handleEditItemInputChange}
                locations={locations}
            />
            <DeleteEquipmentItem
                isOpen={isDeleteItemModalOpen}
                onClose={() => setIsDeleteItemModalOpen(false)}
                onConfirm={handleDeleteEquipmentItem}
                serialNumber={equipmentItemToDelete?.serialNumber || ''}
            />
            <ToastContainer />
        </div>
    );
}