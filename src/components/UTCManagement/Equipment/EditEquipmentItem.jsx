import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EditEquipmentItem({ isOpen, onClose, onSave, equipmentItem, onInputChange, locations }) {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleSave = () => {
        const newErrors = {};
        if (!equipmentItem.serialNumber) newErrors.serialNumber = true;
        if (!equipmentItem.locationId) newErrors.locationId = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log('Saving equipment item:', equipmentItem); // Debug dữ liệu trước khi lưu
            onSave();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editEquipmentItem')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('serialNumber')}</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={equipmentItem.serialNumber || ''}
                        onChange={onInputChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                            errors.serialNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('enterSerialNumber')}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('status')}</label>
                    <select
                        name="status"
                        value={equipmentItem.status || 'Active'}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="ACTIVE">{t('statusActive')}</option>
                        <option value="BROKEN">{t('statusBroken')}</option>
                        <option value="MAINTENANCE">{t('statusMaintenance')}</option>

                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('purchaseDate')}</label>
                    <input
                        type="datetime-local"
                        name="purchaseDate"
                        value={equipmentItem.purchaseDate || ''}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('location')}</label>
                    <select
                        name="locationId"
                        value={equipmentItem.locationId || ''}
                        onChange={onInputChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                            errors.locationId ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">{t('selectLocation')}</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.locationName}
                            </option>
                        ))}
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
    );
}