import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import homepage from '../../../assets/homepage3.png';
import maintenance from '../../../assets/maintenance.png';
import category from '../../../assets/category2.png';
import borrowing from '../../../assets/borrowing2.png';
import equipment from '../../../assets/equipment.png';
import setting from '../../../assets/setting.png';
import users from '../../../assets/user.png';
import locations from '../../../assets/location.png';
import borrowIcon from '../../../assets/borrowing2.png';
import userIcon from '../../../assets/user2.png';
import statistics from '../../../assets/statistics.png';
import broken from '../../../assets/broken2.png';
import NavItem from './NavItem.jsx';
import AuthModal from '../User/AuthModal.jsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx'; // Import useAuth

export default function NavBar() {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { hasAuthority } = useAuth(); // Sử dụng useAuth để kiểm tra quyền
    const BASE_URL = 'http://localhost:9090';

    const fetchUser = async (token) => {
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
                    return fetchUser(localStorage.getItem('accessToken'));
                }
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('401') || err.message.includes('notAuthenticated')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            navigate('/login');
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
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                await fetch(`${BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
            } catch (err) {
                console.error('Logout error:', err);
            }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        setIsUserDropdownOpen(false);
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetchUser(accessToken);
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className="fixed top-0 left-0 h-full min-w-64 bg-gray-100 border-r border-gray-300">
                <div className="flex justify-between flex-col h-screen">
                    <div>
                        <div className="flex items-center justify-center py-4 border-b border-gray-300">
                            <h1 className="text-xl font-bold tracking-wide">UEMS</h1>
                        </div>
                        <nav className="mt-4">
                            <NavItem to="/homepage" icon={homepage} label={t('home')} />
                            <NavItem to="/equipments" icon={equipment} label={t('equipment')} />
                            <NavItem to="/category" icon={category} label={t('category')} />
                            <NavItem to="/maintenance" icon={maintenance} label={t('maintenance')} />
                            {/*<NavItem to="/borrowing" icon={borrowing} label={t('borrowing')} />*/}
                            <NavItem to="/broken" icon={broken} label={t('brokenReport')} />
                            <NavItem to="/location" icon={locations} label={t('location')} />
                            <NavItem to="/statistics" icon={statistics} label={t("statistics")} />
                            {/* Chỉ hiển thị NavItem "User" nếu là SUPER_ADMIN */}
                            {hasAuthority('ROLE_SUPER_ADMIN') && (
                                <NavItem to="/user" icon={userIcon} label={t('user')} />
                            )}
                            {user?.role === 'ADMIN' && location.pathname === '/management' && (
                                <NavItem to="/borrowing" icon={borrowIcon} label={t('goToBorrowTable')} />
                            )}
                        </nav>
                    </div>
                    <div>
                        <NavItem to="/settings" icon={setting} label={t('Setting')} />
                        <div className="relative">
                            <div
                                className="flex items-center space-x-3 p-3 pl-6 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <img src={users} alt="User" className="w-5 h-5" />
                                <span className="text-black">{user?.fullName || 'Unknown'}</span>
                            </div>
                            {isUserDropdownOpen && (
                                <div className="absolute bottom-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-2">
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold">{user?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-gray-600">{user?.email || 'unknown@example.com'}</p>
                                        <p className="text-xs text-gray-500">{t('role')}: {user?.role || 'Unknown'}</p>
                                    </div>
                                    <button
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setIsModalOpen(true);
                                            setIsUserDropdownOpen(false);
                                        }}
                                    >
                                        {t('viewProfile')}
                                    </button>
                                    <Link
                                        to="/settings"
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        {t('Setting')}
                                    </Link>
                                    <button
                                        className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                                        onClick={handleLogout}
                                    >
                                        {t('logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
        </>
    );
}