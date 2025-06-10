import { useState, useEffect, useCallback, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import 'react-loading-skeleton/dist/skeleton.css';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function BorrowTable({ searchQuery, filterParams, setCategories, setLocations, userId }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [equipments, setEquipments] = useState([]);
    const [equipmentItems, setEquipmentItems] = useState({});
    const [equipmentQuantities, setEquipmentQuantities] = useState({});
    const [expandedEquipmentId, setExpandedEquipmentId] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [selectedEquipmentItemId, setSelectedEquipmentItemId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [brokenDetails, setBrokenDetails] = useState({
        brokenDate: new Date().toISOString().slice(0, 16),
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState({});
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const BASE_URL = 'http://localhost:9090';

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            setError(t('noRefreshToken'));
            navigate('/login');
            return false;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('refreshTokenFailed'));
            }
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || localStorage.getItem('refreshToken'));
            return true;
        } catch (err) {
            console.error('Refresh token error:', err);
            setError(err.message || t('refreshTokenFailed'));
            navigate('/login');
            return false;
        }
    };

    const fetchEquipmentData = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            let accessToken = localStorage.getItem('accessToken');
            let url = `${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`;
            if (searchQuery) url += `&name=${encodeURIComponent(searchQuery)}`;
            if (filterParams.filterCategory) url += `&categoryId=${filterParams.filterCategory}`;
            if (filterParams.filterLocation) url += `&locationId=${filterParams.filterLocation}`;
            if (filterParams.filterStatus) url += `&status=${filterParams.filterStatus}`;

            console.log('Fetching URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            const errorText = await retryResponse.text();
                            throw new Error(`${t('fetchErrorAfterRefresh')}: ${errorText}`);
                        }
                        const data = await retryResponse.json();
                        const equipmentList = data.content || [];

                        const quantities = {};
                        await Promise.all(
                            equipmentList.map(async (equipment) => {
                                let itemUrl = `${BASE_URL}/item/get?equipmentId=${equipment.id}`;
                                if (filterParams.filterLocation) itemUrl += `&locationId=${filterParams.filterLocation}`;
                                try {
                                    const itemResponse = await fetch(itemUrl, {
                                        method: 'GET',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${accessToken}`,
                                        },
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

                        setEquipments(equipmentList);
                        setEquipmentQuantities(quantities);
                        setTotalPages(data.page.totalPages || 1);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`${t('fetchError')}: ${errorText}`);
                }
            } else {
                const data = await response.json();
                const equipmentList = data.content || [];

                const quantities = {};
                await Promise.all(
                    equipmentList.map(async (equipment) => {
                        let itemUrl = `${BASE_URL}/item/get?equipmentId=${equipment.id}`;
                        if (filterParams.filterLocation) itemUrl += `&locationId=${filterParams.filterLocation}`;
                        try {
                            const itemResponse = await fetch(itemUrl, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                                },
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

                setEquipments(equipmentList);
                setEquipmentQuantities(quantities);
                setTotalPages(data.page.totalPages || 1);
            }
        } catch (err) {
            console.error('Fetch equipment error:', err);
            setError(err.message);
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
    }, [searchQuery, filterParams, pageSize, t]);

    const fetchEquipmentItems = useCallback(async (equipmentId) => {
        try {
            setItemsLoading((prev) => ({ ...prev, [equipmentId]: true }));
            let accessToken = localStorage.getItem('accessToken');
            let url = `${BASE_URL}/item/get?equipmentId=${equipmentId}`;
            if (filterParams.filterLocation) url += `&locationId=${filterParams.filterLocation}`;

            console.log('Fetching equipment items URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            const errorText = await retryResponse.text();
                            throw new Error(`${t('fetchErrorAfterRefresh')}: ${errorText}`);
                        }
                        const data = await retryResponse.json();
                        setEquipmentItems((prev) => ({ ...prev, [equipmentId]: data || [] }));
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`${t('fetchError')}: ${errorText}`);
                }
            } else {
                const data = await response.json();
                setEquipmentItems((prev) => ({ ...prev, [equipmentId]: data || [] }));
            }
        } catch (err) {
            console.error('Fetch equipment items error:', err);
            setError(err.message);
            toast.error(err.message, {
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
    }, [t, filterParams.filterLocation]);

    const debouncedFetchEquipmentData = useCallback(
        debounce((page) => {
            console.log('Debounced fetch triggered for page:', page);
            fetchEquipmentData(page);
        }, 200),
        [fetchEquipmentData]
    );

    useEffect(() => {
        setLoading(true);
        setCurrentPage(0);
        debouncedFetchEquipmentData(0);
        return () => debouncedFetchEquipmentData.cancel();
    }, [searchQuery, filterParams, debouncedFetchEquipmentData]);

    useEffect(() => {
        debouncedFetchEquipmentData(currentPage);
        return () => debouncedFetchEquipmentData.cancel();
    }, [currentPage, debouncedFetchEquipmentData]);

    useEffect(() => {
        setEquipmentItems({});
        equipments.forEach((equipment) => fetchEquipmentItems(equipment.id));
        if (isModalOpen && selectedEquipment) {
            fetchEquipmentItems(selectedEquipment.id);
        }
    }, [filterParams.filterLocation, isModalOpen, selectedEquipment, fetchEquipmentItems, equipments]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                let accessToken = localStorage.getItem('accessToken');
                const [categoriesRes, locationsRes] = await Promise.all([
                    fetch(`${BASE_URL}/category/get?page=0&size=10`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                        },
                    }),
                    fetch(`${BASE_URL}/location/get?page=0&size=10`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                        },
                    }),
                ]);

                if (!categoriesRes.ok || !locationsRes.ok) {
                    if (categoriesRes.status === 401 || categoriesRes.status === 403 || locationsRes.status === 401 || locationsRes.status === 403) {
                        const refreshed = await refreshToken();
                        if (refreshed) {
                            accessToken = localStorage.getItem('accessToken');
                            const [retryCategoriesRes, retryLocationsRes] = await Promise.all([
                                fetch(`${BASE_URL}/category/get?page=0&size=10`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`,
                                    },
                                }),
                                fetch(`${BASE_URL}/location/get?page=0&size=10`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`,
                                    },
                                }),
                            ]);
                            if (!retryCategoriesRes.ok) throw new Error(`${t('fetchErrorAfterRefresh')}: Categories`);
                            if (!retryLocationsRes.ok) throw new Error(`${t('fetchErrorAfterRefresh')}: Locations`);

                            const [categoriesData, locationsData] = await Promise.all([
                                retryCategoriesRes.json(),
                                retryLocationsRes.json(),
                            ]);

                            setCategories(categoriesData.content || []);
                            setLocations(locationsData.content || []);
                        } else {
                            throw new Error(t('unauthorized'));
                        }
                    } else {
                        if (!categoriesRes.ok) throw new Error(`${t('fetchError')}: Categories`);
                        if (!locationsRes.ok) throw new Error(`${t('fetchError')}: Locations`);
                    }
                } else {
                    const [categoriesData, locationsData] = await Promise.all([
                        categoriesRes.json(),
                        locationsRes.json(),
                    ]);

                    setCategories(categoriesData.content || []);
                    setLocations(locationsData.content || []);
                }
            } catch (err) {
                console.error('Fetch initial data error:', err);
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

        fetchInitialData();
    }, [t, setCategories, setLocations]);

    const toggleDropdown = (equipmentId) => {
        if (expandedEquipmentId === equipmentId) {
            setExpandedEquipmentId(null);
        } else {
            setExpandedEquipmentId(equipmentId);
            fetchEquipmentItems(equipmentId);
        }
    };

    const openBrokenModal = (equipment) => {
        setSelectedEquipment(equipment);
        setSelectedEquipmentItemId(null);
        setBrokenDetails({
            brokenDate: new Date().toISOString().slice(0, 16),
            description: '',
        });
        fetchEquipmentItems(equipment.id);
        setIsModalOpen(true);
    };

    const handleBrokenReport = async () => {
        if (!selectedEquipmentItemId) {
            toast.error(t('selectEquipmentItem'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        setSubmitting(true);
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError(t('noToken'));
                navigate('/login');
                return;
            }

            const brokenData = {
                equipmentItemId: parseInt(selectedEquipmentItemId),
                usersId: userId,
                brokenDate: new Date(brokenDetails.brokenDate + 'Z').toISOString(),
                description: brokenDetails.description,
            };
            console.log('Sending broken data:', brokenData); // Debug
            const response = await fetch(`${BASE_URL}/broken/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(brokenData),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(`${BASE_URL}/broken/report`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify(brokenData),
                        });
                        if (!retryResponse.ok) {
                            const errorText = await retryResponse.text();
                            throw new Error(errorText || t('reportBrokenError'));
                        }
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || t('reportBrokenError'));
                }
            }

            setIsModalOpen(false);
            toast.success(t('reportBrokenSuccess', { name: selectedEquipment.name }), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            fetchEquipmentItems(selectedEquipment.id);
        } catch (err) {
            console.error('Report broken error:', err);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const isBrokenDateValid = () => {
        return new Date(brokenDetails.brokenDate) <= new Date();
    };

    function getStatusColor(status) {
        switch (status) {
            case 'BROKEN':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'MAINTENANCE':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'BORROWED':
                return 'bg-blue-100 text-blue-700 border-blue-200';
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
            case 'BORROWED':
                return t('statusBorrowed');
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
        return `${statusCount.ACTIVE}/${statusCount.BROKEN}/${statusCount.MAINTENANCE}/${statusCount.BORROWED}`;
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages && page !== currentPage) {
            setLoading(true);
            setCurrentPage(page);
            debouncedFetchEquipmentData(page);
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

    return (
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{t('equipments')}</h2>
            </div>
            {equipments.length > 0 || loading ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('image')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quantity')}</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {equipments.map((equipment) => (
                            <Fragment key={`equipment-${equipment.id}`}>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => toggleDropdown(equipment.id)}
                                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-md shadow-sm hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-in"
                                        >
                                            {equipment.name}
                                            {expandedEquipmentId === equipment.id ? (
                                                <ChevronUp size={20} className="ml-2" />
                                            ) : (
                                                <ChevronDown size={20} className="ml-2" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {equipmentQuantities[equipment.id] !== undefined ? equipmentQuantities[equipment.id] : '-'}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipment.categoryName || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{equipment.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                        <button
                                            onClick={() => openBrokenModal(equipment)}
                                            className="relative text-red-600 hover:text-red-800 group"
                                        >
                                            <AlertCircle size={20} />
                                            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                                {t('reportBroken')}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                                {expandedEquipmentId === equipment.id && (
                                    <tr key={`expanded-${equipment.id}`}>
                                        <td colSpan="7" className="bg-gray-50 p-4">
                                            {itemsLoading[equipment.id] ? (
                                                <div className="flex justify-center items-center py-4">
                                                    <Loader2 size={24} className="animate-spin text-gray-600" />
                                                    <span className="ml-2 text-gray-600">{t('loading')}...</span>
                                                </div>
                                            ) : equipmentItems[equipment.id]?.length > 0 ? (
                                                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                    <div className="grid gap-4 sm:grid-cols-2">
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
                                                                    {/*<div className="text-sm text-gray-600">*/}
                                                                    {/*    <span className="font-medium">{t('returnDate')}:</span> {formatReturnDate(item.returnDate)}*/}
                                                                    {/*</div>*/}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-600 text-center py-4">{t('noEquipmentItems')}</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
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
            ) : (
                <p className="text-gray-600 text-center">{t('noEquipments')}</p>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md pointer-events-auto">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('reportBrokenEquipment')}</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('equipmentItem')}</label>
                            {itemsLoading[selectedEquipment?.id] ? (
                                <p className="text-gray-600">{t('loading')}...</p>
                            ) : equipmentItems[selectedEquipment?.id]?.length > 0 ? (
                                <select
                                    value={selectedEquipmentItemId || ''}
                                    onChange={(e) => setSelectedEquipmentItemId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">{t('selectEquipmentItem')}</option>
                                    {equipmentItems[selectedEquipment?.id]
                                        .filter((item) => item.status === 'ACTIVE')
                                        .map((item) => (
                                            <option key={`option-${item.id}`} value={item.id}>
                                                {item.serialNumber} ({getTranslatedStatus(item.status)}, {item.locationName || 'No Location'})
                                            </option>
                                        ))}
                                </select>
                            ) : (
                                <p className="text-gray-600">{t('noEquipmentItems')}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('brokenDate')}</label>
                            <input
                                type="datetime-local"
                                value={brokenDetails.brokenDate}
                                onChange={(e) => setBrokenDetails({ ...brokenDetails, brokenDate: e.target.value })}
                                max={new Date().toISOString().slice(0, 16)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                            {!isBrokenDateValid() && (
                                <p className="text-red-600 text-sm mt-1">{t('invalidBrokenDate')}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                            <textarea
                                value={brokenDetails.description}
                                onChange={(e) => setBrokenDetails({ ...brokenDetails, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="4"
                                placeholder={t('')}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleBrokenReport}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                disabled={submitting || !selectedEquipmentItemId || !isBrokenDateValid()}
                            >
                                {submitting ? (
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle size={20} className="mr-2" />
                                )}
                                {t('submitReport')}
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                disabled={submitting}
                            >
                                <XCircle size={20} className="mr-2" />
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}