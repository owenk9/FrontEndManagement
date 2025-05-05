import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddEquipmentItem({ isOpen, onClose, onSave, newEquipmentItem, onInputChange, locations, equipmentName }) {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleSave = () => {
        const newErrors = {};
        if (!newEquipmentItem.serialNumber) newErrors.serialNumber = true;
        if (!newEquipmentItem.locationId) newErrors.locationId = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSave();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('addEquipmentItem')} - {equipmentName}
                </h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('serialNumber')}</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={newEquipmentItem.serialNumber}
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
                        value={newEquipmentItem.status}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="ACTIVE">{t('statusActive')}</option>
                        <option value="BROKEN">{t('statusBroken')}</option>
                        <option value="MAINTENANCE">{t('statusMaintenance')}</option>
                        <option value="BORROWED">{t('statusBorrowed')}</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('purchaseDate')}</label>
                    <input
                        type="datetime-local"
                        name="purchaseDate"
                        value={newEquipmentItem.purchaseDate}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('location')}</label>
                    <select
                        name="locationId"
                        value={newEquipmentItem.locationId}
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
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('returnDate')}</label>
                    <input
                        type="datetime-local"
                        name="returnDate"
                        value={newEquipmentItem.returnDate}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
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