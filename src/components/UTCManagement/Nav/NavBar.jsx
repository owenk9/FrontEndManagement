import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate để xử lý đăng xuất
import homepage from '../../../assets/homepage3.png';
import maintenance from '../../../assets/maintenance.png';
import category from '../../../assets/category2.png';
import borrowing from '../../../assets/borrowing2.png';
import equipment from '../../../assets/equipment.png';
import setting from '../../../assets/setting.png';
import users from '../../../assets/user.png';
import location from '../../../assets/location.png';
import NavItem from './NavItem.jsx';
import AuthModal from '../User/AuthModal.jsx';
import { useTranslation } from 'react-i18next';

export default function NavBar() {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const currentUser = {
        fullName: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        role: 'User',
    };
    const handleLogout = () => {

        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            <div className="fixed top-0 left-0 h-full min-w-64 bg-gray-100 border-r border-gray-300">
                <div className="flex justify-between flex-col h-screen">
                    <div>
                        <div className="flex items-center justify-center py-4 border-b border-gray-300">
                            <h1 className="text-xl font-bold tracking-wide">UEMS</h1>
                        </div>
                        <nav className="mt-4">
                            <NavItem to="/" icon={homepage} label={t('home')} />
                            <NavItem to="/equipments" icon={equipment} label={t('equipments')} />
                            <NavItem to="/category" icon={category} label={t('category')} />
                            <NavItem to="/maintenance" icon={maintenance} label={t('maintenance')} />
                            <NavItem to="/borrowing" icon={borrowing} label={t('borrowing')} />
                            <NavItem to="/location" icon={location} label={t('locations')} />
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
                                <span className="text-black">{currentUser.fullName}</span>
                            </div>
                            {isUserDropdownOpen && (
                                <div className="absolute bottom-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-2">
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold">{currentUser.fullName}</p>
                                        <p className="text-xs text-gray-600">{currentUser.email}</p>
                                        <p className="text-xs text-gray-500">{t('role')}: {currentUser.role}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        {t('viewProfile')}
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        {t('Setting')}
                                    </Link>
                                    <button
                                        className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                                        onClick={() => {
                                            handleLogout();
                                            setIsUserDropdownOpen(false);
                                        }}
                                    >
                                        {t('logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}