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
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    const BASE_URL = 'http://localhost:9090';


    const fetchEquipments = async () => {
        try {
            let allEquipments = [];
            let page = 0;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await fetchWithAuth(`${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(t('fetchError'));
                const data = await response.json();
                allEquipments = [...allEquipments, ...(data.content || [])];
                setEquipments(allEquipments);
                if (data.page?.totalPages && page + 1 < data.page.totalPages) {
                    page++;
                } else {
                    hasMore = false;
                }
            }
        } catch (err) {
            console.error('Failed to fetch equipments:', err);
        }
    };


    const fetchEquipmentItems = async (equipmentId) => {
        setIsLoadingItems(true);
        try {

            const response = await fetchWithAuth(`${BASE_URL}/item/get?equipmentId=${equipmentId}&page=0&size=50`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();


            const items = Array.isArray(data) ? data : (data.content || []);
            const activeItems = items.filter(item => item.status === 'ACTIVE');


            if (activeItems.length > 0) {
                let allItems = [...activeItems];


                const hasMorePages = Array.isArray(data)
                    ? items.length === 50
                    : (data.page?.totalPages && data.page.totalPages > 1);

                if (hasMorePages) {

                    let page = 1;
                    let hasMore = true;

                    while (hasMore) {
                        const nextResponse = await fetchWithAuth(`${BASE_URL}/item/get?equipmentId=${equipmentId}&page=${page}&size=50`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                        });

                        if (!nextResponse.ok) break;
                        const nextData = await nextResponse.json();
                        const nextItems = Array.isArray(nextData) ? nextData : (nextData.content || []);
                        const nextActiveItems = nextItems.filter(item => item.status === 'ACTIVE');

                        allItems = [...allItems, ...nextActiveItems];


                        setEquipmentItems([...allItems]);


                        if (Array.isArray(nextData)) {
                            hasMore = nextItems.length === 50;
                        } else if (nextData.page?.totalPages) {
                            hasMore = page + 1 < nextData.page.totalPages;
                        } else {
                            hasMore = false;
                        }
                        page++;
                    }
                }

                setEquipmentItems(allItems);
            } else {
                setEquipmentItems([]);
            }
        } catch (err) {
            console.error('Failed to fetch equipment items:', err);
            setEquipmentItems([]);
        } finally {
            setIsLoadingItems(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchEquipments();
            setSelectedEquipmentId('');
            setEquipmentItems([]);
            setWarningMessage('');
            setIsLoadingItems(false);
        }
    }, [isOpen]);

    const handleEquipmentChange = (e) => {
        const equipmentId = e.target.value;
        setSelectedEquipmentId(equipmentId);
        setWarningMessage('');
        if (equipmentId) {
            fetchEquipmentItems(equipmentId);
        } else {
            setEquipmentItems([]);
            setIsLoadingItems(false);
        }
        onInputChange({ target: { name: 'equipmentItemId', value: '' } });
    };

    const handleEquipmentItemChange = (e) => {
        const equipmentItemId = e.target.value;
        const selectedItem = equipmentItems.find((item) => item.id === parseInt(equipmentItemId));
        if (selectedItem) {
            setWarningMessage('');
            onInputChange(e);
        } else {
            onInputChange({ target: { name: 'equipmentItemId', value: '' } });
        }
    };

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
                        style={{
                            maxHeight: equipments.length > 6 ? '150px' : 'auto',
                            overflowY: equipments.length > 6 ? 'auto' : 'visible'
                        }}
                        size={equipments.length > 6 ? 6 : 1}
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
                {selectedEquipmentId && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            {t('equipmentItem')}
                            {equipmentItems.length > 0 && (
                                <span className="text-sm text-gray-500 ml-2">
                                    ({equipmentItems.length} {t('items')})
                                </span>
                            )}
                        </label>

                        {isLoadingItems ? (
                            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center">
                                <span>{t('loadingEquipmentItems')}...</span>
                            </div>
                        ) : equipmentItems.length > 0 ? (
                            <div className="relative">
                                <select
                                    name="equipmentItemId"
                                    value={newMaintenance.equipmentItemId || ''}
                                    onChange={handleEquipmentItemChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                    style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}
                                    size={Math.min(equipmentItems.length + 1, 8)}
                                    required
                                >
                                    <option value="">{t('selectEquipmentItem')}</option>
                                    {equipmentItems.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {`${item.serialNumber}${item.name ? ` - ${item.name}` : ''}`}
                                            {item.location ? ` (${item.location})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center">
                                <span>{t('noEquipmentItems') || 'Không có thiết bị con nào'}</span>
                            </div>
                        )}

                        {warningMessage && (
                            <p className="text-red-500 text-sm mt-1">{warningMessage}</p>
                        )}
                    </div>
                )}

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