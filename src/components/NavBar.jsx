import  { useState } from 'react';
import homepage from '../assets/homepage3.png';
import maintenance from '../assets/maintenance.png';
import category from '../assets/category2.png';
import borrowing from '../assets/borrowing2.png';
import equipment from '../assets/equipment.png';
import setting from '../assets/setting.png';
import users from '../assets/user.png';
import NavItem from './NavItem.jsx';
import AuthModal from './AuthModal.jsx';

export default function NavBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 h-full min-w-64 bg-gray-100 border-r border-gray-300">
                <div className="flex justify-between flex-col h-screen">
                    <div>
                        <div className="flex items-center justify-center py-4 border-b border-gray-300">
                            <h1 className="text-xl font-bold tracking-wide">UEMS</h1>
                        </div>
                        <nav className="mt-4">
                            <NavItem to="/" icon={homepage} label="Home" />
                            <NavItem to="/equipments" icon={equipment} label="Equipments" />
                            <NavItem to="/category" icon={category} label="Category" />
                            <NavItem to="/maintenance" icon={maintenance} label="Maintenance" />
                            <NavItem to="/borrowing" icon={borrowing} label="Borrowing" />
                        </nav>
                    </div>
                    <div>
                        <NavItem to="/settings" icon={setting} label="Settings" />
                        <div
                            className="flex items-center space-x-3 p-3 pl-6 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img src={users} alt="User" className="w-5 h-5"/>
                            <span className="text-black">User</span>
                        </div>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}