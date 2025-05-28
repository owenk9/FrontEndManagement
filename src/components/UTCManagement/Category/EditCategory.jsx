import { useTranslation } from 'react-i18next';

export default function EditCategory({ isOpen, onClose, onSave, category, onInputChange }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editCategory')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('id')}</label>
                    <input
                        type="number"
                        name="id"
                        value={category.id}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        disabled
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('categoryName')}</label>
                    <input
                        type="text"
                        name="categoryName"
                        value={category.categoryName}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterCategoryName')}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('description')}</label>
                    <textarea
                        name="description"
                        value={category.description}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterDescription')}
                        rows="3"
                    />
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={onSave}
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
    );
}