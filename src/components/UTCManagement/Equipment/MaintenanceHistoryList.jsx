import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../Nav/SearchBar.jsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx';
import { Loader2 } from 'lucide-react';
import {format} from "date-fns";

export default function MaintenanceHistoryList() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const { equipmentItemId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); // Theo backend
    const [searchTerm, setSearchTerm] = useState('');
    // const [filterTechnician, setFilterTechnician] = useState(''); // Bộ lọc theo technician
    const BASE_URL = 'http://localhost:9090';
    const serialNumber = location.state?.serialNumber || 'Unknown';

    const fetchMaintenanceHistory = async (page = 0, search = '', technician = '') => {
        try {
            setLoading(true);
            let url = `${BASE_URL}/maintenance/history?equipmentItemId=${equipmentItemId}&page=${page}&size=${pageSize}`;
            if (search) url += `&description=${encodeURIComponent(search)}`;
            if (technician) url += `&technician=${encodeURIComponent(technician)}`;

            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            console.log('Maintenance history data:', data);
            if (data && data.content && Array.isArray(data.content)) {
                setHistory(data.content);
                setTotalPages(data.page.totalPages || 1);
                setCurrentPage(data.page.number || 0);
            } else {
                setHistory([]);
                setTotalPages(1);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaintenanceHistory(currentPage, searchTerm);
    }, [currentPage, searchTerm, equipmentItemId]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        fetchMaintenanceHistory(0, term);
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages && page !== currentPage) {
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
        } catch {
            return '-';
        }
    };

    // if (loading && history.length === 0) {
    //     return (
    //         <div className="min-h-screen p-6 flex items-center justify-center">
    //             <Loader2 size={24} className="animate-spin mr-2" />
    //             <p>{t('loading')}</p>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={() => fetchMaintenanceHistory(currentPage, searchTerm)}
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
                <h1 className="text-3xl font-bold text-gray-900">
                    {t('maintenanceHistory')} - {serialNumber}
                </h1>
            </div>
            <div className="mb-6 flex items-center justify-between">
                {/*<div className="flex items-center space-x-2">*/}
                    {/*<SearchBar onSearch={handleSearch} />*/}
                    {/*<select*/}
                    {/*    value={filterTechnician}*/}
                    {/*    onChange={(e) => handleFilterChange('technician', e.target.value)}*/}
                    {/*    className="border border-gray-300 rounded-md p-2 h-10"*/}
                    {/*>*/}
                    {/*    <option value="">{t('allTechnicians')}</option>*/}
                    {/*    /!* Giả sử bạn có danh sách technician từ API hoặc state, hiện tại chỉ để placeholder *!/*/}
                    {/*    <option value="Technician A">Technician A</option>*/}
                    {/*    <option value="Technician B">Technician B</option>*/}
                    {/*</select>*/}
                {/*</div>*/}
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full table-fixed">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr className="rounded-t-lg">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('maintenanceDate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('description')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('technician')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('cost')}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                {formatDate(record.maintenanceDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                {record.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                {record.technician || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                {record.cost || '-'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {loading && history.length > 0 && (
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
        </div>
    );
}