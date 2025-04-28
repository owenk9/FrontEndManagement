import { useState } from 'react';
import { Save, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const [userInfo, setUserInfo] = useState({
        name: 'John Doe',
        email: 'johndoe@example.com',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [language, setLanguage] = useState(i18n.language); // Đồng bộ với ngôn ngữ hiện tại

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveUserInfo = () => {
        console.log('Saved user info:', userInfo);
        alert(t('infoSaved'));
    };

    const handleSavePassword = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert(t('fillAllFields'));
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert(t('passwordMismatch'));
            return;
        }
        console.log('Password updated:', passwordData);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsModalOpen(false);
        alert(t('passwordUpdated'));
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage); // Thay đổi ngôn ngữ toàn bộ ứng dụng
        console.log('Language changed to:', newLanguage);
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
            </div>

            {/* Main Content */}
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Personal Information */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">{t('name')}</label>
                            <input
                                type="text"
                                name="name"
                                value={userInfo.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">{t('email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                            />
                        </div>
                        <button
                            onClick={handleSaveUserInfo}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                        >
                            <Save size={16} />
                            {t('saveChanges')}
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('changePassword')}</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                    >
                        <Edit size={16} />
                        {t('changePassword')}
                    </button>
                </div>

                {/* Language */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('language')}</h2>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                    >
                        <option value="en">{t('english')}</option>
                        <option value="vi">{t('vietnamese')}</option>
                    </select>
                </div>
            </div>

            {/* Change Password Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    {/* Modal content */}
                    <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('changePassword')}</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('currentPassword')}</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder={t('currentPassword')}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('newPassword')}</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder={t('newPassword')}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1">{t('confirmPassword')}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder={t('confirmPassword')}
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={handleSavePassword}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                {t('update')}
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}