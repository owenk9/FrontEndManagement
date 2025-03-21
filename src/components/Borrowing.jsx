import SearchBar from "./SearchBar.jsx";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function Borrowing() {
    const borrowingData = [
        { "id": 1, "equipmentName": "Máy chiếu", "userName": "Nguyễn Văn A", "borrowDate": "2023-10-01T09:00:00", "returnDate": "2023-10-05T17:00:00", "status": "Returned" },
        { "id": 2, "equipmentName": "Laptop Dell", "userName": "Trần Thị B", "borrowDate": "2023-11-15T14:30:00", "returnDate": null, "status": "Borrowing" },
        { "id": 3, "equipmentName": "Loa Bluetooth", "userName": "Lê Văn C", "borrowDate": "2023-12-10T10:15:00", "returnDate": "2023-12-12T16:45:00", "status": "Returned" },
        { "id": 4, "equipmentName": "Màn hình LCD", "userName": "Nguyễn Văn A", "borrowDate": "2024-01-20T08:00:00", "returnDate": null, "status": "Borrowing" },
        { "id": 5, "equipmentName": "Micro không dây", "userName": "Phạm Thị D", "borrowDate": "2024-02-05T13:00:00", "returnDate": "2024-02-07T09:30:00", "status": "Returned" },
        { "id": 6, "equipmentName": "Bộ phát WiFi", "userName": "Trần Thị B", "borrowDate": "2024-03-01T15:00:00", "returnDate": null, "status": "Borrowing" },
        { "id": 7, "equipmentName": "Bàn phím cơ", "userName": "Lê Văn C", "borrowDate": "2024-03-10T11:00:00", "returnDate": "2024-03-15T14:00:00", "status": "Returned" },
        { "id": 8, "equipmentName": "Chuột không dây", "userName": "Phạm Thị D", "borrowDate": "2024-03-18T09:30:00", "returnDate": null, "status": "Borrowing" },
        { "id": 9, "equipmentName": "Tai nghe gaming", "userName": "Nguyễn Văn A", "borrowDate": "2024-03-20T10:00:00", "returnDate": null, "status": "Borrowing" },
        { "id": 10, "equipmentName": "Máy in laser", "userName": "Trần Thị B", "borrowDate": "2024-03-22T12:00:00", "returnDate": "2024-03-25T15:00:00", "status": "Returned" }
    ];

    function getStatusColor(status) {
        switch (status) {
            case 'Returned':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Borrowing':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Borrowing</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">Id</th>
                        <th className="py-4 px-6 text-left font-semibold">Equipment name</th>
                        <th className="py-4 px-6 text-left font-semibold">Name</th>
                        <th className="py-4 px-6 text-left font-semibold">Borrow date</th>
                        <th className="py-4 px-6 text-left font-semibold">Return date</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {borrowingData.map((borrowing) => (
                        <tr key={borrowing.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{borrowing.id}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.equipmentName}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.userName}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.borrowDate}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.returnDate || "N/A"}</td>
                            <td className="py-4 px-6">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(borrowing.status)}`}
                                    >
                                        {borrowing.status}
                                    </span>
                            </td>
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
        </div>
    );
}
