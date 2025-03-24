import { useState } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddEquipment from './AddEquipment.jsx';
import EditEquipment from './EditEquipment.jsx';
import DeleteEquipment from './DeleteEquipment.jsx'; // Import component mới
import { useTranslation } from 'react-i18next';

export default function EquipmentList() {
    const { t } = useTranslation();

    const [equipmentData, setEquipmentData] = useState([
        { id: 1, name: 'Projector', status: 'Hoạt động', purchaseDate: '2023-05-10', description: 'HD projector for meeting rooms' },
        { id: 2, name: 'Dell Laptop', status: 'Bảo trì', purchaseDate: '2022-08-15', description: 'High-performance office laptop' },
        { id: 3, name: 'Bluetooth Speaker', status: 'Hỏng', purchaseDate: '2021-11-20', description: 'High-quality audio speaker' },
        { id: 4, name: 'LCD Monitor', status: 'Hoạt động', purchaseDate: '2024-02-05', description: '24-inch Full HD monitor' },
        { id: 5, name: 'Wireless Microphone', status: 'Hoạt động', purchaseDate: '2023-09-12', description: 'Wireless conference microphone' },
        { id: 6, name: 'WiFi Router', status: 'Hỏng', purchaseDate: '2022-03-30', description: '5GHz high-speed WiFi router' },
        { id: 7, name: 'Mechanical Keyboard', status: 'Hoạt động', purchaseDate: '2023-12-01', description: 'RGB mechanical keyboard' },
        { id: 8, name: 'Wireless Mouse', status: 'Bảo trì', purchaseDate: '2024-01-10', description: 'Fast-charging wireless mouse' },
        { id: 9, name: 'Gaming Headset', status: 'Hoạt động', purchaseDate: '2023-06-18', description: '7.1 gaming headset' },
        { id: 10, name: 'Laser Printer', status: 'Hỏng', purchaseDate: '2021-07-25', description: 'Black-and-white laser printer' },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        id: '',
        name: '',
        status: 'Hoạt động',
        purchaseDate: '',
        description: '',
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);

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

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddEquipment = () => {
        if (!newEquipmentData.id || !newEquipmentData.name || !newEquipmentData.purchaseDate) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        setEquipmentData([...equipmentData, { ...newEquipmentData, id: parseInt(newEquipmentData.id) }]);
        setNewEquipmentData({ id: '', name: '', status: 'Hoạt động', purchaseDate: '', description: '' });
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (equipment) => {
        setSelectedEquipment({ ...equipment });
        setIsEditModalOpen(true);
    };

    const handleEditEquipment = () => {
        if (!selectedEquipment.name || !selectedEquipment.purchaseDate) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        const updatedEquipment = equipmentData.map((item) =>
            item.id === selectedEquipment.id ? selectedEquipment : item
        );
        setEquipmentData(updatedEquipment);
        setIsEditModalOpen(false);
        setSelectedEquipment(null);
    };

    const handleOpenDeleteModal = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEquipment = () => {
        setEquipmentData(equipmentData.filter((item) => item.id !== equipmentToDelete.id));
        setIsDeleteModalOpen(false);
        setEquipmentToDelete(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipment((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('equipments')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addEquipment')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipmentName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('status')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('purchaseDate')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">{t('description')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {equipmentData.map((equipment) => (
                        <tr key={equipment.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{equipment.id}</td>
                            <td className="py-4 px-6 text-gray-800">{equipment.name}</td>
                            <td className="py-4 px-6">
                  <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(equipment.status)}`}
                  >
                    {t(
                        equipment.status === 'Hoạt động'
                            ? 'statusActive'
                            : equipment.status === 'Bảo trì'
                                ? 'statusMaintenance'
                                : 'statusBroken'
                    )}
                  </span>
                            </td>
                            <td className="py-4 px-6 text-gray-800">{equipment.purchaseDate}</td>
                            <td className="py-4 px-6 text-gray-800">{equipment.description}</td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenEditModal(equipment)}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenDeleteModal(equipment)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm thiết bị */}
            <AddEquipment
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddEquipment}
                newEquipment={newEquipmentData}
                onInputChange={handleInputChange}
            />

            {/* Modal chỉnh sửa thiết bị */}
            <EditEquipment
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditEquipment}
                equipment={selectedEquipment || {}}
                onInputChange={handleEditInputChange}
            />

            {/* Modal xác nhận xóa */}
            <DeleteEquipment
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEquipment}
                equipmentName={equipmentToDelete?.name || ''}
            />
        </div>
    );
}