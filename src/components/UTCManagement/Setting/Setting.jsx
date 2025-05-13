import { useState } from 'react';
import { Edit, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [language, setLanguage] = useState(i18n.language);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BASE_URL = 'http://localhost:9090';

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSavePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError(t('fillAllFields'));
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError(t('passwordMismatch'));
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
                throw new Error(data.accessToken || 'Failed to change password');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsModalOpen(false);
            setError(null);
            alert(t('passwordUpdated'));
        } catch (err) {
            setError(err.message || t('changePasswordFailed'));
        }
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
        console.log('Language changed to:', newLanguage);
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

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
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

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('changePassword')}</h2>
                        {error && <p className="text-red-600 mb-4">{error}</p>}
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
                                    setIsModalOpen(false);
                                    setError(null);
                                }}
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