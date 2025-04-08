import { useTranslation } from 'react-i18next';

export default function EditEquipment({ isOpen, onClose, onSave, equipment, onInputChange, onImageChange }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editEquipment')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('id')}</label>
                    <input
                        type="number"
                        name="id"
                        value={equipment.id}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        disabled
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('equipmentName')}</label>
                    <input
                        type="text"
                        name="name"
                        value={equipment.name}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterEquipmentName')}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('image')}</label>
                    {equipment.imageUrl && (
                        <div className="mb-2">
                            <img
                                src={equipment.imageUrl}
                                alt="Current equipment"
                                className="w-16 h-16 object-cover rounded"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={onImageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('status')}</label>
                    <select
                        name="status"
                        value={equipment.status}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Broken">Broken</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('purchaseDate')}</label>
                    <input
                        type="datetime-local"
                        name="purchaseDate"
                        value={equipment.purchaseDate}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('quantity')}</label>
                    <input
                        type="number"
                        name="quantity"
                        value={equipment.quantity}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterQuantity')}
                        min="1"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('categoryId')}</label>
                    <input
                        type="number"
                        name="categoryId"
                        value={equipment.categoryId}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter Category ID"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('locationId')}</label>
                    <input
                        type="number"
                        name="locationId"
                        value={equipment.locationId}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter Location ID"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('description')}</label>
                    <textarea
                        name="description"
                        value={equipment.description}
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