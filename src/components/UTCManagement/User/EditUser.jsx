import { useTranslation } from 'react-i18next';

export default function EditUser({ isOpen, onClose, onSave, user, onInputChange }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSave = () => {
        onSave();
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editUser')}</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('id')}</label>
                        <input
                            type="number"
                            name="id"
                            value={user.id || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('firstName')}</label>
                        <input
                            type="text"
                            name="firstName"
                            value={user.firstName || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('firstName')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('lastName')}</label>
                        <input
                            type="text"
                            name="lastName"
                            value={user.lastName || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('lastName')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('email')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('password')}</label>
                        <input
                            type="password"
                            name="password"
                            value={user.password || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('password')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('department')}</label>
                        <input
                            type="text"
                            name="department"
                            value={user.department || ''}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('department')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">{t('role')}</label>
                        <select
                            name="role"
                            value={user.role || 'USER'}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="USER">{t('user')}</option>
                            <option value="ADMIN">{t('admin')}</option>
                            <option value="SUPER_ADMIN">{t('superAdmin')}</option>
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                        >
                            {t('save')}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}