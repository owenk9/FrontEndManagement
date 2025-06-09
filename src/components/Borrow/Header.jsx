import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, User, LogOut } from 'lucide-react';
import { Edit, Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Header({ searchQuery, setSearchQuery, setUserId }) {
    const { t } = useTranslation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalError, setModalError] = useState(null);
    const BASE_URL = 'http://localhost:9090';

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    await refreshToken();
                    return fetchUserInfo(localStorage.getItem('accessToken'));
                }
                throw new Error(response.statusText);
            }
            const data = await response.json();
            setUserData(data);
            if (setUserId) setUserId(data.id);
        } catch (err) {
            console.error('Fetch user info error:', err);
            setError(null);
            toast.error(err.message || t('fetchUserInfoFailed'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            if (err.message.includes('401') || err.message.includes('notAuthenticated')) {
                window.location.href = '/login';
            }
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            window.location.href = '/login';
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to refresh token');
            }
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || localStorage.getItem('refreshToken'));
        } catch (err) {
            console.error('Refresh token error:', err);
            toast.error(err.message || t('refreshTokenFailed'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            window.location.href = '/login';
        }
    };

    const handleLogout = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            }).catch(err => console.error('Logout error:', err));
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setModalError(null);
    };

    const handleSavePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setModalError(null);
            toast.error(t('fillAllFields'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setModalError(null);
            toast.error(t('passwordMismatch'), {
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
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${BASE_URL}/user/change_password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    oldPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.accessToken || t('changePasswordFailed'));
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangePasswordModalOpen(false);
            setModalError(null);
            toast.success(t('passwordUpdated'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            setModalError(null);
            toast.error(err.message || t('changePasswordFailed'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'currentPassword') {
            setShowCurrentPassword(!showCurrentPassword);
        } else if (field === 'newPassword') {
            setShowNewPassword(!showNewPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetchUserInfo(accessToken);
        } else {
            window.location.href = '/login';
        }
    }, [setUserId]);

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('searchByEquipmentName')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
            </div>
            <div className="flex items-center justify-end w-full">
                {userData && (
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                        >
                            {userData.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt={userData.fullName || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => (e.target.src = '/default-avatar.png')}
                                />
                            ) : (
                                <User size={24} className="text-gray-600" />
                            )}
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                <div
                                    className="p-4 border-b border-gray-200 cursor-pointer"
                                    onClick={() => {
                                        setIsPersonalInfoOpen(true);
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <p className="text-sm font-semibold text-gray-900">{userData.fullName || 'User'}</p>
                                    <p className="text-xs text-gray-500">{userData.email || 'user@example.com'}</p>
                                </div>
                                <button
                                    onClick={() => setIsChangePasswordModalOpen(true)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit size={16} className="mr-2" />
                                    {t('changePassword')}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    {t('logout')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="absolute top-4 right-4 bg-red-100 text-red-700 p-2 rounded-md">
                    {error}
                </div>
            )}

            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('changePassword')}</h2>
                        {modalError && <p className="text-red-600 mb-4">{modalError}</p>}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('currentPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                    placeholder={t('currentPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('currentPassword')}
                                    aria-label={showCurrentPassword ? t('hidePassword') : t('showPassword')}
                                >
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('newPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                    placeholder={t('newPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                    aria-label={showNewPassword ? t('hidePassword') : t('showPassword')}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('confirmPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                    placeholder={t('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={handleSavePassword}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                {t('update')}
                            </button>
                            <button
                                onClick={() => {
                                    setIsChangePasswordModalOpen(false);
                                    setModalError(null);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPersonalInfoOpen && userData && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('personalInformation')}</h2>
                        <div className="space-y-4">
                            <p><strong>{t('fullName')}:</strong> {userData.fullName || 'N/A'}</p>
                            <p><strong>{t('email')}:</strong> {userData.email || 'N/A'}</p>
                            <p><strong>{t('role')}:</strong> {userData.role || 'N/A'}</p>
                            <p><strong>{t('department')}:</strong> {userData.department || 'N/A'}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsPersonalInfoOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </header>
    );
}