import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../Auth/AuthContext.jsx";

export default function AddMaintenance({ isOpen, onClose, onSave, newMaintenance, onInputChange}) {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const [equipments, setEquipments] = useState([]);
    const [equipmentItems, setEquipmentItems] = useState([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [warningMessage, setWarningMessage] = useState('');

    const BASE_URL = 'http://localhost:9090';

    // Fetch equipments from API
    const fetchEquipments = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/equipment/get?page=0&size=100`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setEquipments(data.content || data || []);
        } catch (err) {
            console.error('Failed to fetch equipments:', err);
        }
    };

    // Fetch equipment items based on selected equipment
    const fetchEquipmentItems = async (equipmentId) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/item/get?equipmentId=${equipmentId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            // Lọc chỉ các equipment items có trạng thái ACTIVE
            const activeItems = data.filter(item => item.status === 'ACTIVE') || [];
            setEquipmentItems(activeItems);
        } catch (err) {
            console.error('Failed to fetch equipment items:', err);
            setEquipmentItems([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchEquipments();
            setSelectedEquipmentId(''); // Reset equipmentId
            setEquipmentItems([]); // Reset equipmentItems
            setWarningMessage(''); // Reset warning
        }
    }, [isOpen]); // Removed onInputChange from dependency array

    const handleEquipmentChange = (e) => {
        const equipmentId = e.target.value;
        setSelectedEquipmentId(equipmentId);
        setWarningMessage(''); // Reset warning
        if (equipmentId) {
            fetchEquipmentItems(equipmentId);
        } else {
            setEquipmentItems([]);
        }
        onInputChange({ target: { name: 'equipmentItemId', value: '' } });
    };

    // const handleEquipmentItemChange = (e) => {
    //     // const equipmentItemId = e.target.value;
    //     // const selectedItem = equipmentItems.find((item) => item.id === parseInt(equipmentItemId));
    //     // if (selectedItem) {
    //     //     const serialNumber = selectedItem.serialNumber;
    //     //     const existingMaintenance = maintenanceData.find((m) => m.serialNumber === serialNumber);
    //     //     if (existingMaintenance) {
    //     //         if (existingMaintenance.status === 'IN_PROGRESS') {
    //     //             setWarningMessage('This equipment item is currently under maintenance.');
    //     //         } else {
    //     //             setWarningMessage('This serial number already exists, please choose another one.');
    //     //         }
    //     //         onInputChange({ target: { name: 'equipmentItemId', value: '' } });
    //     //     } else {
    //     //         setWarningMessage('');
    //     //         onInputChange(e);
    //     //     }
    //     // }
    // };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('addMaintenance')}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('equipment')}</label>
                    <select
                        name="equipmentId"
                        value={selectedEquipmentId}
                        onChange={handleEquipmentChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    >
                        <option value="">{t('selectEquipment')}</option>
                        {equipments.map((equipment) => (
                            <option key={equipment.id} value={equipment.id}>
                                {equipment.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('equipmentItem')}</label>
                    <select
                        name="equipmentItemId"
                        value={newMaintenance.equipmentItemId || ''}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                        disabled={!selectedEquipmentId}
                    >
                        <option value="">{t('selectEquipmentItem')}</option>
                        {equipmentItems.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.serialNumber}
                            </option>
                        ))}
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
                        value={newMaintenance.maintenanceDate || ''}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('description')}</label>
                    <textarea
                        name="description"
                        value={newMaintenance.description || ''}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterDescription')}
                        rows="3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">{t('status')}</label>
                    <select
                        name="status"
                        value={newMaintenance.status || 'SCHEDULED'}
                        onChange={onInputChange}
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
                        value={newMaintenance.cost || ''}
                        onChange={onInputChange}
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
                        value={newMaintenance.technician || ''}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder={t('enterTechnician')}
                        required
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