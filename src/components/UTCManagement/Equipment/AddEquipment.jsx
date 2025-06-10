import { useTranslation } from 'react-i18next';

export default function AddEquipment({ isOpen, onClose, onSave, newEquipment, onInputChange, onImageChange, categories }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('addEquipment')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('equipmentName')}</label>
                    <input
                        type="text"
                        name="name"
                        value={newEquipment.name}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterEquipmentName')}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('image')}</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={onImageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('category')}</label>
                    <select
                        name="categoryId"
                        value={newEquipment.categoryId}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black overflow-y-auto"
                        size={categories.length >= 6 ? 6 : 1}
                    >
                        <option value="">{t('selectCategory')}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('description')}</label>
                    <textarea
                        name="description"
                        value={newEquipment.description}
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