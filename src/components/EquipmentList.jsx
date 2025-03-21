import { useState } from 'react';
import SearchBar from './SearchBar.jsx';

import { Pencil, Trash2, Plus } from 'lucide-react';
import AddEquipment from "./AddEquipment.jsx";

export default function EquipmentList() {
    const [equipmentData, setEquipmentData] = useState([
        { id: 1, name: 'Máy chiếu', status: 'Hoạt động', purchaseDate: '2023-05-10', description: 'Máy chiếu HD cho phòng ' },
        { id: 2, name: 'Laptop Dell', status: 'Bảo trì', purchaseDate: '2022-08-15', description: 'Laptop văn phòng hiệu suất cao' },
        { id: 3, name: 'Loa Bluetooth', status: 'Hỏng', purchaseDate: '2021-11-20', description: 'Loa âm thanh chất lượng cao' },
        { id: 4, name: 'Màn hình LCD', status: 'Hoạt động', purchaseDate: '2024-02-05', description: 'Màn hình Full HD 24 inch' },
        { id: 5, name: 'Micro không dây', status: 'Hoạt động', purchaseDate: '2023-09-12', description: 'Micro không dây hội nghị' },
        { id: 6, name: 'Bộ phát WiFi', status: 'Hỏng', purchaseDate: '2022-03-30', description: 'Bộ phát WiFi 5GHz tốc độ cao' },
        { id: 7, name: 'Bàn phím cơ', status: 'Hoạt động', purchaseDate: '2023-12-01', description: 'Bàn phím cơ RGB' },
        { id: 8, name: 'Chuột không dây', status: 'Bảo trì', purchaseDate: '2024-01-10', description: 'Chuột không dây sạc nhanh' },
        { id: 9, name: 'Tai nghe gaming', status: 'Hoạt động', purchaseDate: '2023-06-18', description: 'Tai nghe gaming 7.1' },
        { id: 10, name: 'Máy in laser', status: 'Hỏng', purchaseDate: '2021-07-25', description: 'Máy in laser trắng đen' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        id: '',
        name: '',
        status: 'Hoạt động', // Sửa 'Hoat dong' thành 'Hoạt động'
        purchaseDate: '',
        description: '',
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

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleAddEquipment = () => {
        if (!newEquipmentData.id || !newEquipmentData.name || !newEquipmentData.purchaseDate) {
            alert('Please fill in all required fields: ID, Name, Purchase Date');
            return;
        }
        setEquipmentData([...equipmentData, { ...newEquipmentData, id: parseInt(newEquipmentData.id) }]);
        setNewEquipmentData({ id: '', name: '', status: 'Hoạt động', purchaseDate: '', description: '' });
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Equipments</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenModal}
                >
                    <Plus size={16} />
                    Add Equipment
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">ID</th>
                        <th className="py-4 px-6 text-left font-semibold">Equipment name</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 text-left font-semibold">Purchase date</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">Description</th>
                        <th className="py-4 px-6 font-semibold">Actions</th>
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
                    {equipment.status}
                  </span>
                            </td>
                            <td className="py-4 px-6 text-gray-800">{equipment.purchaseDate}</td>
                            <td className="py-4 px-6 text-gray-800">{equipment.description}</td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer">
                                        <Pencil size={16} />
                                    </button>
                                    <button className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Sử dụng AddEquipmentModal */}
            <AddEquipment
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddEquipment}
                newEquipment={newEquipmentData}
                onInputChange={handleInputChange}
            />
        </div>
    );
}