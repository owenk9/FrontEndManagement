import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function EditMaintenance({ isOpen, onClose, onSave, maintenance, onInputChange, equipmentItems, maintenanceData }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        serialNumber: '',
        maintenanceDate: '',
        description: '',
        status: 'SCHEDULED',
        cost: '',
        technician: '',
    });
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        if (isOpen && maintenance) {
            setFormData({
                serialNumber: maintenance.serialNumber || '',
                maintenanceDate: maintenance.maintenanceDate || '',
                description: maintenance.description || '',
                status: maintenance.status || 'SCHEDULED',
                cost: maintenance.cost || '',
                technician: maintenance.technician || '',
            });
            setWarningMessage(''); // Reset warning when modal opens
        }
    }, [isOpen, maintenance]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        onInputChange(e);

        // Validate serialNumber
        if (name === 'serialNumber' && value) {
            const existingMaintenance = maintenanceData?.find(
                (m) => m.serialNumber === value && m.id !== maintenance?.id
            );
            if (existingMaintenance) {
                setWarningMessage('This serial number already exists, please choose another one.');
            } else {
                setWarningMessage('');
            }
        }
    };

    if (!isOpen) return null;

    // Get unique serial numbers from equipmentItems
    const uniqueSerialNumbers = equipmentItems && Array.isArray(equipmentItems)
        ? [...new Set(equipmentItems.map((item) => item.serialNumber).filter(Boolean))]
        : [];

    // Debugging logs
    console.log('equipmentItems:', equipmentItems);
    console.log('maintenanceData:', maintenanceData);
    console.log('maintenance:', maintenance);
    console.log('uniqueSerialNumbers:', uniqueSerialNumbers);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editMaintenance')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('serialNumber')}</label>
                    <select
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    >
                        <option value="">{t('selectSerialNumber')}</option>
                        {uniqueSerialNumbers.length > 0 ? (
                            uniqueSerialNumbers.map((serial) => (
                                <option key={serial} value={serial}>
                                    {serial}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No serial numbers available</option>
                        )}
                    </select>
                    {warningMessage && (
                        <p className="text-red-500 text-sm mt-1">{warningMessage}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('maintenanceDate')}</label>
                    <input
                        type="datetime-local"
                        name="maintenanceDate"
                        value={formData.maintenanceDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('description')}</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterDescription')}
                        rows="3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('status')}</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="SCHEDULED">{t('statusScheduled')}</option>
                        <option value="IN_PROGRESS">{t('statusInProgress')}</option>
                        <option value="COMPLETED">{t('statusCompleted')}</option>
                        <option value="FAILED">{t('statusFailed')}</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('cost')}</label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterCost')}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('technician')}</label>
                    <input
                        type="text"
                        name="technician"
                        value={formData.technician}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterTechnician')}
                        required
                    />
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={() => onSave(formData)}
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