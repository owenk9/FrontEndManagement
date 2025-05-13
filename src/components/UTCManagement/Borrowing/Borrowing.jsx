import { useState, useEffect } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Borrowing() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [borrowingData, setBorrowingData] = useState([]);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectBorrowing, setRejectBorrowing] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = 'http://localhost:9090';

    // Hàm làm mới token
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.error(t('noRefreshToken'));
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

    // Hàm lấy dữ liệu mượn thiết bị
    const fetchBorrowingData = async (page = 0, search = '') => {
        try {
            setLoading(true);
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError(t('noToken'));
                navigate('/login');
                return;
            }

            const url = search
                ? `${BASE_URL}/borrowing/get?equipmentName=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`
                : `${BASE_URL}/borrowing/get?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
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
                        const retryResponse = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            throw new Error(`${t('fetchErrorAfterRefresh')}: ${await retryResponse.text()}`);
                        }
                        const data = await retryResponse.json();
                        setBorrowingData(data.content || []);
                        setTotalPages(data.page.totalPages || 1);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('fetchError')}: ${await response.text()}`);
                }
            } else {
                const data = await response.json();
                setBorrowingData(data.content || []);
                setTotalPages(data.page.totalPages || 1);
            }
        } catch (err) {
            console.error('Fetch borrowing error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowingData(currentPage, searchTerm);
        const handleRefresh = () => fetchBorrowingData(currentPage, searchTerm);
        window.addEventListener('refreshBorrowingList', handleRefresh);
        return () => window.removeEventListener('refreshBorrowingList', handleRefresh);
    }, [t, currentPage, searchTerm]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'RETURNED':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'BORROWING':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'RETURNED':
                return t('statusReturned');
            case 'BORROWING':
                return t('statusBorrowing');
            case 'PENDING':
                return t('statusPending');
            case 'APPROVED':
                return t('statusApproved');
            case 'REJECTED':
                return t('statusRejected');
            default:
                return status;
        }
    };

    const handleAcceptBorrowing = async (borrowingId) => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error(t('notAuthenticated'));
            const response = await fetch(`${BASE_URL}/borrowing/get/${borrowingId}/confirm?status=APPROVED`, {
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
                        const retryResponse = await fetch(`${BASE_URL}/borrowing/get/${borrowingId}/confirm?status=APPROVED`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) throw new Error(`${t('updateError')}: ${await retryResponse.text()}`);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('updateError')}: ${await response.text()}`);
                }
            }

            const updatedData = await response.json();
            setBorrowingData(borrowingData.map(item => item.id === borrowingId ? updatedData : item));
            await fetch(`${BASE_URL}/notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    usersId: updatedData.usersId,
                    message: `${t('notificationAccepted')}: ${updatedData.equipmentName}`,
                }),
            });
            alert(t('borrowingAccepted'));
        } catch (err) {
            console.error('Accept borrowing error:', err);
            alert(err.message);
        }
    };

    const handleRejectBorrowing = async () => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error(t('notAuthenticated'));
            if (!adminNote.trim()) {
                alert(t('enterReason'));
                return;
            }
            const response = await fetch(`${BASE_URL}/borrowing/get/${rejectBorrowing.id}/confirm?status=REJECTED&adminNote=${encodeURIComponent(adminNote)}`, {
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
                        const retryResponse = await fetch(`${BASE_URL}/borrowing/get/${rejectBorrowing.id}/confirm?status=REJECTED&adminNote=${encodeURIComponent(adminNote)}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) throw new Error(`${t('updateError')}: ${await retryResponse.text()}`);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('updateError')}: ${await response.text()}`);
                }
            }

            const updatedData = await response.json();
            setBorrowingData(borrowingData.map(item => item.id === rejectBorrowing.id ? updatedData : item));
            await fetch(`${BASE_URL}/notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    usersId: updatedData.usersId,
                    message: `${t('notificationRejected')}: ${updatedData.equipmentName}. ${t('reason')}: ${adminNote}`,
                }),
            });
            setIsRejectModalOpen(false);
            setAdminNote('');
            alert(t('borrowingRejected'));
        } catch (err) {
            console.error('Reject borrowing error:', err);
            alert(err.message);
        }
    };

    const handleOpenRejectModal = (borrowing) => {
        setRejectBorrowing(borrowing);
        setAdminNote('');
        setIsRejectModalOpen(true);
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

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('borrowing')}</h1>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userName')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('borrowDate')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('returnDate')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('note')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {borrowingData.length > 0 ? (
                        borrowingData.map((borrowing) => (
                            <tr key={borrowing.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{borrowing.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{borrowing.equipmentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{`${borrowing.usersFirstName} ${borrowing.usersLastName}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{borrowing.borrowDate ? borrowing.borrowDate.replace('T', ' ').slice(0, 16) : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{borrowing.returnDate ? borrowing.returnDate.replace('T', ' ').slice(0, 16) : t('na')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{borrowing.note}</td>
                                <td className="py-4 px-6">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(borrowing.status)}`}
                                    >
                                        {getTranslatedStatus(borrowing.status) || '-'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex space-x-3">
                                        {borrowing.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleAcceptBorrowing(borrowing.id)}
                                                    className="p-2 text-green-700 font-bold rounded-md hover:bg-green-600 hover:text-white transition duration-200 cursor-pointer"
                                                    title={t('accept')}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenRejectModal(borrowing)}
                                                    className="p-2 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                                    title={t('reject')}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-600">
                                {t('noBorrowingRecords')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                {/* Phân trang nằm trong bảng, căn phải */}
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

            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('rejectBorrowing')}</h2>
                        <p className="text-gray-600 mb-4">{t('enterReasonForRejection', { name: rejectBorrowing?.equipmentName })}</p>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="4"
                            placeholder={t('reason')}
                        />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                onClick={handleRejectBorrowing}
                                className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
                            >
                                <XCircle size={20} className="mr-2" />
                                {t('confirm')}
                            </button>
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                <XCircle size={20} className="mr-2" />
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}