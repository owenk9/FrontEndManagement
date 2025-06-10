import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext.jsx';

export default function ReportsDashboard() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [brokenData, setBrokenData] = useState([]);
    const [maintenanceYear, setMaintenanceYear] = useState('');
    const [maintenanceMonth, setMaintenanceMonth] = useState('');
    const [maintenanceQuarter, setMaintenanceQuarter] = useState('');
    const [brokenYear, setBrokenYear] = useState('');
    const [brokenMonth, setBrokenMonth] = useState('');
    const [brokenQuarter, setBrokenQuarter] = useState('');
    const [maintenancePage, setMaintenancePage] = useState(0);
    const [brokenPage, setBrokenPage] = useState(0);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [brokenTotalPages, setBrokenTotalPages] = useState(1);
    const [, setMaintenanceTotalElements] = useState(0);
    const [, setBrokenTotalElements] = useState(0);
    const [pageSize] = useState(5);

    const BASE_URL = 'http://localhost:9090';

    const fetchMaintenanceReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (maintenanceYear) params.append('year', maintenanceYear);
            if (maintenanceMonth) params.append('month', maintenanceMonth);
            if (maintenanceQuarter) params.append('quarter', maintenanceQuarter);
            params.append('page', maintenancePage);
            params.append('size', pageSize);

            const response = await fetchWithAuth(`${BASE_URL}/statistics/reports/maintenance?${params.toString()}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`${t('fetchError')}: ${await response.text()}`);
            }

            const result = await response.json();
            setMaintenanceData(result.content || []);
            setMaintenanceTotalPages(result.page.totalPages || 1);
            setMaintenanceTotalElements(result.page.totalElements || 0);
        } catch (err) {
            console.error('Fetch maintenance reports error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [t, maintenanceYear, maintenanceMonth, maintenanceQuarter, maintenancePage, pageSize, fetchWithAuth]);

    const fetchBrokenReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (brokenYear) params.append('year', brokenYear);
            if (brokenMonth) params.append('month', brokenMonth);
            if (brokenQuarter) params.append('quarter', brokenQuarter);
            params.append('page', brokenPage);
            params.append('size', pageSize);

            const response = await fetchWithAuth(`${BASE_URL}/statistics/reports/broken?${params.toString()}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`${t('fetchError')}: ${await response.text()}`);
            }

            const result = await response.json();
            setBrokenData(result.content || []);
            setBrokenTotalPages(result.page.totalPages || 1);
            setBrokenTotalElements(result.page.totalElements || 0);
        } catch (err) {
            console.error('Fetch broken reports error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [t, brokenYear, brokenMonth, brokenQuarter, brokenPage, pageSize, fetchWithAuth]);

    useEffect(() => {
        fetchMaintenanceReports();
        fetchBrokenReports();
    }, [fetchMaintenanceReports, fetchBrokenReports]);

    const handleExportToExcel = async (type, year, month, quarter) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);
            if (quarter) params.append('quarter', quarter);

            const endpoint = type === 'maintenance'
                ? `${BASE_URL}/statistics/reports/maintenance/export`
                : `${BASE_URL}/statistics/reports/broken/export`;

            const response = await fetchWithAuth(`${endpoint}?${params.toString()}`, {
                method: 'GET',
                responseType: 'blob',
            });

            if (!response.ok) {
                throw new Error(`${t('fetchError')}: ${await response.text()}`);
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `${type}_Statistics_${year || 'AllYears'}${month || ''}${quarter || ''}.xlsx`;

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Export ${type} error:`, err);
            setError(err.message);
            alert(t('exportError') || 'Export failed');
        } finally {
            setLoading(false);
        }
    };

    const handleMaintenancePageChange = (page) => {
        if (page >= 0 && page < maintenanceTotalPages && page !== maintenancePage) {
            setMaintenancePage(page);
            fetchMaintenanceReports();
        }
    };

    const handleBrokenPageChange = (page) => {
        if (page >= 0 && page < brokenTotalPages && page !== brokenPage) {
            setBrokenPage(page);
            fetchBrokenReports();
        }
    };

    const renderMaintenancePageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, maintenancePage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(maintenanceTotalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handleMaintenancePageChange(i)}
                    className={`px-3 py-1 rounded-md ${
                        maintenancePage === i
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

    const renderBrokenPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, brokenPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(brokenTotalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handleBrokenPageChange(i)}
                    className={`px-3 py-1 rounded-md ${
                        brokenPage === i
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

    const getQuarters = () => {
        return Array.from({ length: 4 }, (_, i) => ({
            value: (i + 1).toString(),
            label: t('quarter') + ' ' + (i + 1),
        }));
    };

    const getYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => ({
            value: year.toString(),
            label: year.toString(),
        }));
    };

    const getMonths = () => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1).toString().padStart(2, '0'),
            label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
        }));
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

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'RESOLVED':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTranslatedStatus = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return t('statusPending');
            case 'IN_PROGRESS':
                return t('statusInProgress');
            case 'RESOLVED':
                return t('statusResolved');
            default:
                return status || '-';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-blue-600">{t('loading')}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => {
                        fetchMaintenanceReports();
                        fetchBrokenReports();
                    }}
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
                <h1 className="text-3xl font-bold text-gray-900">{t('statistics')}</h1>
            </div>
            {/* Maintenance Statistics Filter and Table */}
            <div className="mb-6">
                <div className="flex justify-between">
                    <div className="flex space-x-4 mb-4">
                        <select
                            value={maintenanceYear}
                            onChange={(e) => {
                                setMaintenanceYear(e.target.value);
                                setMaintenancePage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                        >
                            <option value="">{t('allYears')}</option>
                            {getYears().map((y) => (
                                <option key={y.value} value={y.value}>
                                    {y.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={maintenanceMonth}
                            onChange={(e) => {
                                setMaintenanceMonth(e.target.value);
                                setMaintenanceQuarter('');
                                setMaintenancePage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                        >
                            <option value="">{t('allMonths')}</option>
                            {getMonths().map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={maintenanceQuarter}
                            onChange={(e) => {
                                setMaintenanceQuarter(e.target.value);
                                setMaintenanceMonth('');
                                setMaintenancePage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                            disabled={maintenanceMonth !== ''}
                        >
                            <option value="">{t('allQuarters')}</option>
                            {getQuarters().map((q) => (
                                <option key={q.value} value={q.value}>
                                    {q.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleExportToExcel('maintenance', maintenanceYear, maintenanceMonth, maintenanceQuarter)}
                        className="my-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        {t('exportToExcel')}
                    </button>
                </div>
                <div className="bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-900 p-4 border-b">{t('maintenanceStatistics')}</h2>
                    <table className="min-w-full">
                        <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('id')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('equipmentName')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('serialNumber')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('maintenanceDate')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('description')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('technician')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('cost')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {maintenanceData.length > 0 ? (
                            maintenanceData.map((report) => (
                                <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.equipmentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.serialNumber || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(report.maintenanceDate)}</td>
                                    <td className="px-6 py-4 text-sm">{report.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.technician}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.cost}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-4 text-center text-gray-600">
                                    {t('noMaintenanceStatistics')}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <div className="p-4 flex justify-end items-center">
                        <div className="flex gap-2">
                            <button
                                className={`px-3 py-1 rounded-md ${
                                    maintenancePage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                                }`}
                                onClick={() => handleMaintenancePageChange(maintenancePage - 1)}
                                disabled={maintenancePage === 0 || loading}
                            >
                                {t('previous')}
                            </button>
                            {renderMaintenancePageNumbers()}
                            <button
                                className={`px-3 py-1 rounded-md ${
                                    maintenancePage === maintenanceTotalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                                }`}
                                onClick={() => handleMaintenancePageChange(maintenancePage + 1)}
                                disabled={maintenancePage === maintenanceTotalPages - 1 || loading}
                            >
                                {t('next')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Broken Statistics Filter and Table */}
            <div className="mt-6">
                <div className="flex justify-between">
                    <div className="flex space-x-4 mb-4">
                        <select
                            value={brokenYear}
                            onChange={(e) => {
                                setBrokenYear(e.target.value);
                                setBrokenPage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                        >
                            <option value="">{t('allYears')}</option>
                            {getYears().map((y) => (
                                <option key={y.value} value={y.value}>
                                    {y.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={brokenMonth}
                            onChange={(e) => {
                                setBrokenMonth(e.target.value);
                                setBrokenQuarter('');
                                setBrokenPage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                        >
                            <option value="">{t('allMonths')}</option>
                            {getMonths().map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={brokenQuarter}
                            onChange={(e) => {
                                setBrokenQuarter(e.target.value);
                                setBrokenMonth('');
                                setBrokenPage(0);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white"
                            disabled={brokenMonth !== ''}
                        >
                            <option value="">{t('allQuarters')}</option>
                            {getQuarters().map((q) => (
                                <option key={q.value} value={q.value}>
                                    {q.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleExportToExcel('broken', brokenYear, brokenMonth, brokenQuarter)}
                        className="my-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        {t('exportToExcel')}
                    </button>
                </div>
                <div className="bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-900 p-4 border-b">{t('brokenStatistics')}</h2>
                    <table className="min-w-full">
                        <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('id')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('equipmentName')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('serialNumber')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reportedBy')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('brokenDate')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('description')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('status')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {brokenData.length > 0 ? (
                            brokenData.map((report) => (
                                <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.equipmentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.serialNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{report.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(report.brokenDate)}</td>
                                    <td className="px-6 py-4 text-sm">{report.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                                            {getTranslatedStatus(report.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-4 text-center text-gray-600">
                                    {t('noBrokenStatistics')}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <div className="p-4 flex justify-end items-center">
                        <div className="flex gap-2">
                            <button
                                className={`px-3 py-1 rounded-md ${
                                    brokenPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                                }`}
                                onClick={() => handleBrokenPageChange(brokenPage - 1)}
                                disabled={brokenPage === 0 || loading}
                            >
                                {t('previous')}
                            </button>
                            {renderBrokenPageNumbers()}
                            <button
                                className={`px-3 py-1 rounded-md ${
                                    brokenPage === brokenTotalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'
                                }`}
                                onClick={() => handleBrokenPageChange(brokenPage + 1)}
                                disabled={brokenPage === brokenTotalPages - 1 || loading}
                            >
                                {t('next')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}