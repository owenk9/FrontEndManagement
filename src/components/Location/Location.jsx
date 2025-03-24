import { useState } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import AddEquipmentToLocation from './AddEquipmentLocation.jsx';
import AddLocation from './AddLocation.jsx';
import EditLocation from './EditLocation.jsx'; // Import modal chỉnh sửa
import DeleteLocation from './DeleteLocation.jsx'; // Import modal xóa
import { useTranslation } from 'react-i18next';

export default function Location() {
    const { t } = useTranslation();

    const [locationData, setLocationData] = useState([
        {
            id: 1,
            locationName: 'Room 101',
            equipment: [
                { id: 1, name: 'Projector', status: 'Hoạt động', description: 'HD projector' },
                { id: 2, name: 'Laptop Dell', status: 'Bảo trì', description: 'Office laptop' },
            ],
        },
        {
            id: 2,
            locationName: 'Lab A',
            equipment: [
                { id: 3, name: 'LCD Monitor', status: 'Hoạt động', description: '24-inch monitor' },
            ],
        },
        {
            id: 3,
            locationName: 'Warehouse B',
            equipment: [],
        },
    ]);

    const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [newEquipmentData, setNewEquipmentData] = useState({
        id: '',
        name: '',
        status: 'Hoạt động',
        description: '',
    });
    const [newLocationData, setNewLocationData] = useState({
        id: '',
        locationName: '',
        equipment: [],
    });
    const [expandedRows, setExpandedRows] = useState({});

    function getStatusColor(status) {
        switch (status) {
            case 'Hỏng':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Hoạt động':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Bảo trì':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const handleOpenAddEquipmentModal = (locationId) => {
        setSelectedLocationId(locationId);
        setIsAddEquipmentModalOpen(true);
    };

    const handleAddEquipment = () => {
        if (!newEquipmentData.id || !newEquipmentData.name) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        const updatedLocations = locationData.map((location) => {
            if (location.id === selectedLocationId) {
                return {
                    ...location,
                    equipment: [...location.equipment, { ...newEquipmentData, id: parseInt(newEquipmentData.id) }],
                };
            }
            return location;
        });
        setLocationData(updatedLocations);
        setNewEquipmentData({ id: '', name: '', status: 'Hoạt động', description: '' });
        setIsAddEquipmentModalOpen(false);
        setSelectedLocationId(null);
    };

    const handleOpenAddLocationModal = () => {
        setIsAddLocationModalOpen(true);
    };

    const handleAddLocation = () => {
        if (!newLocationData.id || !newLocationData.locationName) {
            alert(t('fillRequiredLocationFields'));
            return;
        }
        setLocationData([...locationData, { ...newLocationData, id: parseInt(newLocationData.id), equipment: [] }]);
        setNewLocationData({ id: '', locationName: '', equipment: [] });
        setIsAddLocationModalOpen(false);
    };

    const handleOpenEditModal = (location) => {
        setSelectedLocation({ ...location });
        setIsEditModalOpen(true);
    };

    const handleEditLocation = () => {
        if (!selectedLocation.locationName) {
            alert(t('fillRequiredLocationFields'));
            return;
        }
        const updatedLocations = locationData.map((item) =>
            item.id === selectedLocation.id ? { ...selectedLocation } : item
        );
        setLocationData(updatedLocations);
        setIsEditModalOpen(false);
        setSelectedLocation(null);
    };

    const handleOpenDeleteModal = (location) => {
        setLocationToDelete(location);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteLocation = () => {
        setLocationData(locationData.filter((item) => item.id !== locationToDelete.id));
        setIsDeleteModalOpen(false);
        setLocationToDelete(null);
    };

    const handleEquipmentInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocationInputChange = (e) => {
        const { name, value } = e.target;
        setNewLocationData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedLocation((prev) => ({ ...prev, [name]: value }));
    };

    const toggleRowExpansion = (locationId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [locationId]: !prev[locationId],
        }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('locations')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddLocationModal}
                >
                    <Plus size={16} />
                    {t('addLocation')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('locationName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipment')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {locationData.map((location) => (
                        <>
                            <tr key={location.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="py-4 px-6 text-gray-800">{location.id}</td>
                                <td className="py-4 px-6 text-gray-800">{location.locationName}</td>
                                <td className="py-4 px-6 text-gray-800">
                                    <button
                                        onClick={() => toggleRowExpansion(location.id)}
                                        className="flex items-center gap-2 text-blue-700 hover:underline"
                                    >
                                        {location.equipment.length} {t('equipments')}
                                        {expandedRows[location.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleOpenAddEquipmentModal(location.id)}
                                            className="flex items-center gap-2 px-2 py-1 text-green-700 font-bold rounded-md hover:bg-green-600 hover:text-white transition duration-200"
                                        >
                                            <Plus size={16} />
                                            {t('addEquipment')}
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditModal(location)}
                                            className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(location)}
                                            className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedRows[location.id] && location.equipment.length > 0 && (
                                <tr className="bg-gray-50">
                                    <td colSpan="4" className="py-2 px-6">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="text-gray-600">
                                                <th className="py-2 px-4 text-left">{t('id')}</th>
                                                <th className="py-2 px-4 text-left">{t('equipmentName')}</th>
                                                <th className="py-2 px-4 text-left">{t('status')}</th>
                                                <th className="py-2 px-4 text-left">{t('description')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {location.equipment.map((equip) => (
                                                <tr key={equip.id} className="border-t border-gray-200">
                                                    <td className="py-2 px-4">{equip.id}</td>
                                                    <td className="py-2 px-4">{equip.name}</td>
                                                    <td className="py-2 px-4">
                                <span
                                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(equip.status)}`}
                                >
                                  {t(
                                      equip.status === 'Hoạt động'
                                          ? 'statusActive'
                                          : equip.status === 'Bảo trì'
                                              ? 'statusMaintenance'
                                              : 'statusBroken'
                                  )}
                                </span>
                                                    </td>
                                                    <td className="py-2 px-4">{equip.description}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm thiết bị vào địa điểm */}
            <AddEquipmentToLocation
                isOpen={isAddEquipmentModalOpen}
                onClose={() => setIsAddEquipmentModalOpen(false)}
                onSave={handleAddEquipment}
                newEquipment={newEquipmentData}
                onInputChange={handleEquipmentInputChange}
                locationName={locationData.find((loc) => loc.id === selectedLocationId)?.locationName || ''}
            />

            {/* Modal thêm địa điểm */}
            <AddLocation
                isOpen={isAddLocationModalOpen}
                onClose={() => setIsAddLocationModalOpen(false)}
                onSave={handleAddLocation}
                newLocation={newLocationData}
                onInputChange={handleLocationInputChange}
            />

            {/* Modal chỉnh sửa địa điểm */}
            <EditLocation
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditLocation}
                location={selectedLocation || {}}
                onInputChange={handleEditInputChange}
            />

            {/* Modal xóa địa điểm */}
            <DeleteLocation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteLocation}
                locationName={locationToDelete?.locationName || ''}
            />
        </div>
    );
}