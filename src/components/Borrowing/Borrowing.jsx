import { useState } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2 } from 'lucide-react';
import EditBorrowing from './EditBorrowing.jsx'; // Import modal chỉnh sửa
import DeleteBorrowing from './DeleteBorrowing.jsx'; // Import modal xóa
import { useTranslation } from 'react-i18next';

export default function Borrowing() {
    const { t } = useTranslation();

    // const [borrowingData, setBorrowingData] = useState([
    //     { id: 1, equipmentName: 'Projector', userName: 'Nguyen Van A', borrowDate: '2023-10-01T09:00', returnDate: '2023-10-05T17:00', status: 'Returned' },
    //     { id: 2, equipmentName: 'Laptop Dell', userName: 'Tran Thi B', borrowDate: '2023-11-15T14:30', returnDate: null, status: 'Borrowing' },
    //     { id: 3, equipmentName: 'Bluetooth Speaker', userName: 'Le Van C', borrowDate: '2023-12-10T10:15', returnDate: '2023-12-12T16:45', status: 'Returned' },
    // ]);
    const [borrowingData, setBorrowingData] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBorrowing, setSelectedBorrowing] = useState(null);
    const [borrowingToDelete, setBorrowingToDelete] = useState(null);

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

    const handleOpenEditModal = (borrowing) => {
        setSelectedBorrowing({ ...borrowing });
        setIsEditModalOpen(true);
    };

    const handleEditBorrowing = () => {
        if (!selectedBorrowing.equipmentName || !selectedBorrowing.userName || !selectedBorrowing.borrowDate) {
            alert(t('fillRequiredBorrowingFields')); // Key mới cho thông báo lỗi
            return;
        }
        const updatedBorrowing = borrowingData.map((item) =>
            item.id === selectedBorrowing.id ? { ...selectedBorrowing } : item
        );
        setBorrowingData(updatedBorrowing);
        setIsEditModalOpen(false);
        setSelectedBorrowing(null);
    };

    const handleOpenDeleteModal = (borrowing) => {
        setBorrowingToDelete(borrowing);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteBorrowing = () => {
        setBorrowingData(borrowingData.filter((item) => item.id !== borrowingToDelete.id));
        setIsDeleteModalOpen(false);
        setBorrowingToDelete(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedBorrowing((prev) => ({ ...prev, [name]: value || null }));
    };

    return (
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('borrowing')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar />
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipmentName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('userName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('borrowDate')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('returnDate')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('status')}</th>
                        <th className="py-4 px-6 font-semibold">{t('actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {borrowingData.map((borrowing) => (
                        <tr key={borrowing.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{borrowing.id}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.equipmentName}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.userName}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.borrowDate.replace('T', ' ')}</td>
                            <td className="py-4 px-6 text-gray-800">{borrowing.returnDate ? borrowing.returnDate.replace('T', ' ') : t('na')}</td>
                            <td className="py-4 px-6">
                  <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(borrowing.status)}`}
                  >
                    {t(borrowing.status === 'Returned' ? 'returned' : 'borrowingStatus')}
                  </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEditModal(borrowing)}
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(borrowing)}
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

            {/* Modal chỉnh sửa mượn */}
            <EditBorrowing
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditBorrowing}
                borrowing={selectedBorrowing || {}}
                onInputChange={handleInputChange}
            />

            {/* Modal xóa mượn */}
            <DeleteBorrowing
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteBorrowing}
                equipmentName={borrowingToDelete?.equipmentName || ''}
                userName={borrowingToDelete?.userName || ''}
            />
        </div>
    );
}