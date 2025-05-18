import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import debounce from 'lodash.debounce';
import SearchBar from '../Nav/SearchBar.jsx';

export default function BrokenReports() {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = 'http://localhost:9090';

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            setError(t('noRefreshToken'));
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
            return false;
        }
    };

    const fetchBrokenReports = useCallback(async (page = 0, search = '') => {
        try {
            setLoading(true);
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError(t('noToken'));
                return;
            }

            const url = search
                ? `${BASE_URL}/broken/get/reports?equipmentName=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/broken/get/reports?page=${page}&size=${pageSize}`;

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
                        setReports(data.content || []);
                        setTotalPages(data.totalPages || 1);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`${t('fetchError')}: ${errorText}`);
                }
            } else {
                const data = await response.json();
                setReports(data.content || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error('Fetch broken reports error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [t, pageSize]);

    const handleUpdateStatus = async (id, status) => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError(t('noToken'));
                return;
            }

            const response = await fetch(`${BASE_URL}/broken/update_status/${id}?status=${status}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(`${BASE_URL}/broken/update_status/${id}?status=${status}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            throw new Error(`${t('updateError')}: ${await retryResponse.text()}`);
                        }
                        const updatedReport = await retryResponse.json();
                        setReports(reports.map(report => report.id === id ? updatedReport : report));
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('updateError')}: ${await response.text()}`);
                }
            } else {
                const updatedReport = await response.json();
                setReports(reports.map(report => report.id === id ? updatedReport : report));
            }
        } catch (err) {
            console.error('Update status error:', err);
            alert(err.message);
        }
    };

    const debouncedFetchBrokenReports = useCallback(
        debounce((page, search) => {
            fetchBrokenReports(page, search);
        }, 200),
        [fetchBrokenReports]
    );

    useEffect(() => {
        debouncedFetchBrokenReports(currentPage, searchTerm);
        return () => debouncedFetchBrokenReports.cancel();
    }, [currentPage, searchTerm, debouncedFetchBrokenReports]);

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

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '-';
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).replace(',', '');
        } catch {
            return '-';
        }
    };

    // Hàm xác định màu sắc cho từng tùy chọn trong dropdown
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'; // Màu vàng
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-700 hover:bg-blue-200'; // Màu xanh dương
            case 'RESOLVED':
                return 'bg-green-100 text-green-700 hover:bg-green-200'; // Màu xanh lá
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200'; // Màu xám mặc định
        }
    };

    // Hàm lấy trạng thái đã dịch
    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'PENDING':
                return t('statusPending');
            case 'IN_PROGRESS':
                return t('statusInProgress');
            case 'RESOLVED':
                return t('statusResolved');
            default:
                return status;
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-600" />
                <span className="ml-2 text-gray-600">{t('loading')}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => fetchBrokenReports(0, '')}
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
                <h1 className="text-3xl font-bold text-gray-900">{t('brokenReports')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('equipmentName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('serialNumber')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportedBy')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('brokenDate')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.equipmentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.serialNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(report.brokenDate)}</td>
                                <td className="px-6 py-4 text-sm">{report.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={report.status}
                                        onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                                        className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${getStatusColorClass(report.status)} inline-block min-w-[100px] max-w-[150px]`}
                                        style={{ width: 'auto' }}
                                    >
                                        <option value="PENDING" className={getStatusColorClass('PENDING')}>
                                            {t('statusPending')}
                                        </option>
                                        <option value="IN_PROGRESS" className={getStatusColorClass('IN_PROGRESS')}>
                                            {t('statusInProgress')}
                                        </option>
                                        <option value="RESOLVED" className={getStatusColorClass('RESOLVED')}>
                                            {t('statusResolved')}
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-600">
                                {t('noBrokenReports')}
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
        </div>
    );
}