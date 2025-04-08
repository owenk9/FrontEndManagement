import { useState, useEffect } from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddEquipment from './AddEquipment.jsx';
import EditEquipment from './EditEquipment.jsx';
import DeleteEquipment from './DeleteEquipment.jsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function EquipmentList() {
    const { t } = useTranslation();

    const [equipmentData, setEquipmentData] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        name: '',
        status: 'Active',
        purchaseDate: '',
        description: '',
        quantity: '',
        categoryId: null,
        locationId: null,
        image: null,
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (bắt đầu từ 0)
    const [totalPages, setTotalPages] = useState(0); // Tổng số trang
    const [pageSize] = useState(10); // Số bản ghi mỗi trang (giữ nguyên như API)

    const BASE_URL = 'http://localhost:9090';

    // Fetch danh sách thiết bị với phân trang
    const fetchEquipmentData = async (page = 0) => { // Giá trị mặc định là 0
        try {
            const response = await fetch(`${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Fetch error: ", errorText);
                throw new Error(t('fetchError'));
            }
            const data = await response.json();
            setEquipmentData(data.content || []); // Đảm bảo content luôn có giá trị
            setTotalPages(data.totalPages || 1); // Mặc định 1 nếu không có totalPages
            setCurrentPage(data.number || page); // Dùng page nếu number không hợp lệ
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipmentData(currentPage);
    }, [currentPage]); // Gọi lại khi currentPage thay đổi

    // Thêm thiết bị
    const handleAddEquipment = async () => {
        if (!newEquipmentData.name || !newEquipmentData.purchaseDate || !newEquipmentData.quantity || !newEquipmentData.categoryId || !newEquipmentData.locationId) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        try {
            const formData = new FormData();
            formData.append('equipment', JSON.stringify({
                name: newEquipmentData.name,
                status: newEquipmentData.status,
                purchaseDate: newEquipmentData.purchaseDate,
                description: newEquipmentData.description,
                quantity: parseInt(newEquipmentData.quantity),
                categoryId: newEquipmentData.categoryId,
                locationId: newEquipmentData.locationId,
            }));
            if (newEquipmentData.image) formData.append('image', newEquipmentData.image);

            const response = await fetch(`${BASE_URL}/equipment/add`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error: ", errorText);
                throw new Error(t('addError'));
            }
            const addedEquipment = await response.json();
            setEquipmentData([...equipmentData, addedEquipment]);
            setNewEquipmentData({
                name: '',
                status: 'Active',
                purchaseDate: '',
                description: '',
                quantity: '',
                categoryId: null,
                locationId: null,
                image: null,
            });
            setIsAddModalOpen(false);
            fetchEquipmentData(currentPage); // Làm mới danh sách sau khi thêm
        } catch (err) {
            alert(err.message);
        }
    };

    // Chỉnh sửa thiết bị
    const handleEditEquipment = async () => {
        if (!selectedEquipment.name || !selectedEquipment.purchaseDate || !selectedEquipment.quantity || !selectedEquipment.categoryId || !selectedEquipment.locationId) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        try {
            const formData = new FormData();
            formData.append('equipment', JSON.stringify({
                name: selectedEquipment.name,
                status: selectedEquipment.status,
                purchaseDate: selectedEquipment.purchaseDate,
                description: selectedEquipment.description,
                quantity: parseInt(selectedEquipment.quantity),
                categoryId: selectedEquipment.categoryId,
                locationId: selectedEquipment.locationId,
            }));
            if (selectedEquipment.image instanceof File) formData.append('image', selectedEquipment.image);

            const response = await fetch(`${BASE_URL}/equipment/update/${selectedEquipment.id}`, {
                method: 'PATCH',
                body: formData,
            });
            if (!response.ok) throw new Error(t('updateError'));
            const updatedEquipment = await response.json();
            setEquipmentData(equipmentData.map((item) =>
                Number(item.id) === Number(updatedEquipment.id) ? updatedEquipment : item
            ).sort((a, b) => a.id - b.id));
            setIsEditModalOpen(false);
            setSelectedEquipment(null);
            fetchEquipmentData(currentPage); // Làm mới danh sách sau khi chỉnh sửa
        } catch (err) {
            alert(err.message);
        }
    };

    // Xóa thiết bị
    const handleDeleteEquipment = async () => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/delete/${equipmentToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(t('deleteError'));
            setEquipmentData(equipmentData.filter((item) => item.id !== equipmentToDelete.id));
            setIsDeleteModalOpen(false);
            setEquipmentToDelete(null);
            fetchEquipmentData(currentPage); // Làm mới danh sách sau khi xóa
        } catch (err) {
            alert(err.message);
        }
    };

    // Hàm lấy màu sắc trạng thái
    function getStatusColor(status) {
        switch (status) {
            case 'Broken': return 'bg-red-100 text-red-700 border-red-200';
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    // Điều hướng trang
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setLoading(true);
            setCurrentPage(page);
        }
    };

    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (equipment) => {
        setSelectedEquipment({ ...equipment, image: null });
        setIsEditModalOpen(true);
    };
    const handleOpenDeleteModal = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteModalOpen(true);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipmentData((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipment((prev) => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (e) => {
        setNewEquipmentData((prev) => ({ ...prev, image: e.target.files[0] }));
    };
    const handleEditImageChange = (e) => {
        setSelectedEquipment((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <p>{t('loading')}</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
            </div>
        );
    }

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
                    <tr className="rounded-t-lg">
                        <th className="py-4 px-6 text-left font-semibold">{t('id')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('equipmentName')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('image')}</th>
                        <th className="py-4 px-6 text-left font-semibold">{t('quantity')}</th>
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
                            <td className="py-4 px-6 text-gray-800">
                                {equipment.imageUrl ? (
                                    <img
                                        src={equipment.imageUrl}
                                        alt={equipment.name}
                                        className="w-16 h-16 object-cover rounded"
                                        onError={(e) => {
                                            console.error(`Failed to load image: ${equipment.imageUrl}`);
                                            e.target.src = '/fallback-image.png'; // Ảnh dự phòng
                                        }}
                                    />
                                ) : (
                                    'No image'
                                )}
                            </td>
                            <td className="py-4 px-6 text-gray-800">{equipment.quantity}</td>
                            <td className="py-4 px-6">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(equipment.status)}`}
                                    >
                                        {equipment.status}
                                    </span>
                            </td>
                            <td className="py-4 px-6 text-gray-800">
                                {format(new Date(equipment.purchaseDate), 'dd/MM/yyyy HH:mm')}
                            </td>

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

            {/* Giao diện phân trang */}
            <div className="flex justify-between items-center mt-4">
                <button
                    className={`px-4 py-2 rounded-md ${currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    {t('previous')}
                </button>
                <span className="text-gray-700">
                    {t('page')} {currentPage + 1} / {totalPages}
                </span>
                <button
                    className={`px-4 py-2 rounded-md ${currentPage === totalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-700'}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    {t('next')}
                </button>
            </div>

            <AddEquipment
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddEquipment}
                newEquipment={newEquipmentData}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
            />
            <EditEquipment
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditEquipment}
                equipment={selectedEquipment || {}}
                onInputChange={handleEditInputChange}
                onImageChange={handleEditImageChange}
            />
            <DeleteEquipment
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEquipment}
                equipmentName={equipmentToDelete?.name || ''}
            />
        </div>
    );
}