import { useState } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddMaintenance from './AddMaintenance.jsx'; // Import modal thêm mới
import EditMaintenance from './EditMaintenance.jsx';
import DeleteMaintenance from './DeleteMaintenance.jsx';
import { useTranslation } from 'react-i18next';

export default function Maintenance() {
    const { t } = useTranslation();

    const [maintenanceData, setMaintenanceData] = useState([
        { id: 1, name: 'Projector', maintenanceDate: '2024-03-01', description: 'HD projector for meeting rooms', status: 'Hoạt động' },
        { id: 2, name: 'Dell Laptop', maintenanceDate: '2024-02-10', description: 'High-performance office laptop', status: 'Bảo trì' },
        { id: 3, name: 'Bluetooth Speaker', maintenanceDate: '2023-12-15', description: 'High-quality audio speaker', status: 'Hỏng' },
        { id: 4, name: 'LCD Monitor', maintenanceDate: '2024-05-20', description: '24-inch Full HD monitor', status: 'Hoạt động' },
        { id: 5, name: 'Wireless Microphone', maintenanceDate: '2024-01-25', description: 'Wireless conference microphone', status: 'Hoạt động' },
        { id: 6, name: 'WiFi Router', maintenanceDate: '2023-11-05', description: '5GHz high-speed WiFi router', status: 'Hỏng' },
        { id: 7, name: 'Mechanical Keyboard', maintenanceDate: '2024-04-10', description: 'RGB mechanical keyboard', status: 'Hoạt động' },
        { id: 8, name: 'Wireless Mouse', maintenanceDate: '2024-02-18', description: 'Fast-charging wireless mouse', status: 'Bảo trì' },
        { id: 9, name: 'Gaming Headset', maintenanceDate: '2024-03-22', description: '7.1 gaming headset', status: 'Hoạt động' },
        { id: 10, name: 'Laser Printer', maintenanceDate: '2023-10-12', description: 'Black-and-white laser printer', status: 'Hỏng' },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
    const [newMaintenanceData, setNewMaintenanceData] = useState({
        id: '',
        name: '',
        maintenanceDate: '',
        description: '',
        status: 'Hoạt động',
    });

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

    const handleAddMaintenance = () => {
        if (!newMaintenanceData.id || !newMaintenanceData.name || !newMaintenanceData.maintenanceDate) {
            alert(t('fillRequiredMaintenanceFields'));
            return;
        }
        setMaintenanceData([...maintenanceData, { ...newMaintenanceData, id: parseInt(newMaintenanceData.id) }]);
        setNewMaintenanceData({ id: '', name: '', maintenanceDate: '', description: '', status: 'Hoạt động' });
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (maintenance) => {
        setSelectedMaintenance({ ...maintenance });
        setIsEditModalOpen(true);
    };

    const handleEditMaintenance = () => {
        if (!selectedMaintenance.name || !selectedMaintenance.maintenanceDate) {
            alert(t('fillRequiredMaintenanceFields'));
            return;
        }
        const updatedMaintenance = maintenanceData.map((item) =>
            item.id === selectedMaintenance.id ? { ...selectedMaintenance } : item
        );
        setMaintenanceData(updatedMaintenance);
        setIsEditModalOpen(false);
        setSelectedMaintenance(null);
    };

    const handleOpenDeleteModal = (maintenance) => {
        setMaintenanceToDelete(maintenance);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteMaintenance = () => {
        setMaintenanceData(maintenanceData.filter((item) => item.id !== maintenanceToDelete.id));
        setIsDeleteModalOpen(false);
        setMaintenanceToDelete(null);
    };

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewMaintenanceData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedMaintenance((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('maintenance')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16} />
                    {t('addMaintenance')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipmentName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('maintenanceDate')}</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">{t('description')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('status')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {maintenanceData.map((maintenance) => (
                        <tr key={maintenance.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{maintenance.id}</td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.name}</td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.maintenanceDate}</td>
                            <td className="py-4 px-6 text-gray-800">{maintenance.description}</td>
                            <td className="py-4 px-6">
                  <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(maintenance.status)}`}
                  >
                    {t(
                        maintenance.status === 'Hoạt động'
                            ? 'statusActive'
                            : maintenance.status === 'Bảo trì'
                                ? 'statusMaintenance'
                                : 'statusBroken'
                    )}
                  </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEditModal(maintenance)}
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(maintenance)}
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
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

            {/* Modal thêm bảo trì */}
            <AddMaintenance
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddMaintenance}
                newMaintenance={newMaintenanceData}
                onInputChange={handleAddInputChange}
            />

            {/* Modal chỉnh sửa bảo trì */}
            <EditMaintenance
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditMaintenance}
                maintenance={selectedMaintenance || {}}
                onInputChange={handleEditInputChange}
            />

            {/* Modal xóa bảo trì */}
            <DeleteMaintenance
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMaintenance}
                equipmentName={maintenanceToDelete?.name || ''}
            />
        </div>
    );
}