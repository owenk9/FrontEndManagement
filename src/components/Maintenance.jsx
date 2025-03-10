import SearchBar from "./SearchBar.jsx";
import {Pencil, Trash2} from "lucide-react";

export default function Maintenance(){
    const maintenanceData = [
        { id: 1, name: 'Máy chiếu', maintenanceDate: '2024-03-01', description: 'Máy chiếu HD cho phòng họp', status: 'Hoạt động' },
        { id: 2, name: 'Laptop Dell', maintenanceDate: '2024-02-10', description: 'Laptop văn phòng hiệu suất cao', status: 'Bảo trì' },
        { id: 3, name: 'Loa Bluetooth', maintenanceDate: '2023-12-15', description: 'Loa âm thanh chất lượng cao', status: 'Hỏng' },
        { id: 4, name: 'Màn hình LCD', maintenanceDate: '2024-05-20', description: 'Màn hình Full HD 24 inch', status: 'Hoạt động' },
        { id: 5, name: 'Micro không dây', maintenanceDate: '2024-01-25', description: 'Micro không dây hội nghị', status: 'Hoạt động' },
        { id: 6, name: 'Bộ phát WiFi', maintenanceDate: '2023-11-05', description: 'Bộ phát WiFi 5GHz tốc độ cao', status: 'Hỏng' },
        { id: 7, name: 'Bàn phím cơ', maintenanceDate: '2024-04-10', description: 'Bàn phím cơ RGB', status: 'Hoạt động' },
        { id: 8, name: 'Chuột không dây', maintenanceDate: '2024-02-18', description: 'Chuột không dây sạc nhanh', status: 'Bảo trì' },
        { id: 9, name: 'Tai nghe gaming', maintenanceDate: '2024-03-22', description: 'Tai nghe gaming 7.1', status: 'Hoạt động'},
        { id: 10, name: 'Máy in laser', maintenanceDate: '2023-10-12', description: 'Máy in laser trắng đen', status: 'Hỏng' }
    ];
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
    return(
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
            </div>
            <div className="mb-6">
                <SearchBar/>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">ID</th>
                        <th className="py-4 px-6 text-left font-semibold">Equipment name</th>
                        <th className="py-4 px-6 text-left font-semibold">Maintenance date</th>
                        <th className="py-4 px-6 text-left font-semibold w-80">Description</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 font-semibold">Actions</th>
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
                                    {maintenance.status}
                                  </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        className="p-2  text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer">
                                        <Pencil size={16}/>
                                    </button>
                                    <button
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500  hover:text-white transition duration-200 cursor-pointer">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}