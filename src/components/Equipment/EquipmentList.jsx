import {useState, useEffect} from 'react';
import SearchBar from '../Nav/SearchBar.jsx';
import {Pencil, Trash2, Plus} from 'lucide-react';
import AddEquipment from './AddEquipment.jsx';
import EditEquipment from './EditEquipment.jsx';
import DeleteEquipment from './DeleteEquipment.jsx';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';

export default function EquipmentList() {
    const {t} = useTranslation();

    const [equipmentData, setEquipmentData] = useState([]);
    const [locations, setLocations] = useState([]); // Danh sách locations
    const [categories, setCategories] = useState([]); // Danh sách categories
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newEquipmentData, setNewEquipmentData] = useState({
        name: '',
        status: 'Active',
        purchaseDate: '',
        description: '',
        quantity: '',
        categoryId: '',
        locationId: '',
        image: null,
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const BASE_URL = 'http://localhost:9090';

    // Fetch danh sách thiết bị
    const fetchEquipmentData = async (page = 0) => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/get?page=${page}&size=${pageSize}`, {
                method: 'GET', headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setEquipmentData(data.content || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.number || page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${BASE_URL}/category/get-all?page=0&size=10`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            console.log('Fetched categories:', JSON.stringify(data, null, 2)); // Log chi tiết
            setCategories(data.content || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/location/get-all?page=0&size=10`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            console.log('Fetched locations:', JSON.stringify(data, null, 2)); // Log chi tiết
            setLocations(data.content || []);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    };

    useEffect(() => {
        fetchEquipmentData(currentPage);
        fetchLocations();
        fetchCategories();
    }, [currentPage]);

    const handleAddEquipment = async () => {
        if (!newEquipmentData.name || !newEquipmentData.purchaseDate || !newEquipmentData.quantity || !newEquipmentData.categoryId || !newEquipmentData.locationId) {
            alert(t('fillRequiredEquipmentFields'));
            return;
        }
        try {
            // Tạo FormData mới
            const formData = new FormData();

            // Chuẩn bị dữ liệu equipment
            const equipmentData = {
                name: newEquipmentData.name,
                status: newEquipmentData.status,
                purchaseDate: newEquipmentData.purchaseDate,
                description: newEquipmentData.description,
                quantity: parseInt(newEquipmentData.quantity),
                categoryId: parseInt(newEquipmentData.categoryId),
                locationId: parseInt(newEquipmentData.locationId),
            };

            // Thêm dữ liệu equipment dưới dạng JSON string với Blob
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], {
                type: 'application/json'
            });
            formData.append('equipment', equipmentBlob);

            // Thêm ảnh nếu có
            if (newEquipmentData.image) {
                formData.append('image', newEquipmentData.image);
            }

            console.log('FormData được gửi khi thêm:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Gửi request mà không đặt Content-Type header
            const response = await fetch(`${BASE_URL}/equipment/add`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Add failed with status:', response.status, 'Response:', errorText);
                throw new Error(t('addError'));
            }

            setNewEquipmentData({
                name: '',
                status: 'Active',
                purchaseDate: '',
                description: '',
                quantity: '',
                categoryId: '',
                locationId: '',
                image: null,
            });
            setIsAddModalOpen(false);
            fetchEquipmentData(currentPage);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditEquipment = async () => {
        if (!selectedEquipment.name) {
            alert(t('equipmentNameRequired'));
            return;
        }
        try {
            // Tạo FormData mới
            const formData = new FormData();

            // Chuẩn bị dữ liệu equipment
            const equipmentData = {
                name: selectedEquipment.name,
                status: selectedEquipment.status || 'Active',
                purchaseDate: selectedEquipment.purchaseDate || new Date().toISOString().slice(0, 16),
                description: selectedEquipment.description || '',
                quantity: parseInt(selectedEquipment.quantity) || 1,
                categoryId: parseInt(selectedEquipment.categoryId) || 1,
                locationId: parseInt(selectedEquipment.locationId) || 1,
            };

            // Thêm dữ liệu equipment dưới dạng JSON string
            const equipmentBlob = new Blob([JSON.stringify(equipmentData)], {
                type: 'application/json'
            });
            formData.append('equipment', equipmentBlob);

            // Thêm ảnh nếu có
            if (selectedEquipment.image instanceof File) {
                formData.append('image', selectedEquipment.image);
            }

            console.log('FormData được gửi:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Gửi request mà không đặt Content-Type header
            const response = await fetch(`${BASE_URL}/equipment/update/${selectedEquipment.id}`, {
                method: 'PATCH',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update failed with status:', response.status, 'Response:', errorText);
                throw new Error(t('updateError'));
            }

            setIsEditModalOpen(false);
            setSelectedEquipment(null);
            fetchEquipmentData(currentPage);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteEquipment = async () => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/delete/${equipmentToDelete.id}`, {
                method: 'DELETE', headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(t('deleteError'));
            setIsDeleteModalOpen(false);
            setEquipmentToDelete(null);
            fetchEquipmentData(currentPage);
        } catch (err) {
            alert(err.message);
        }
    };

    function getStatusColor(status) {
        switch (status) {
            case 'Broken':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Maintenance':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setLoading(true);
            setCurrentPage(page);
        }
    };

    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (equipment) => {
        const selectedCategory = categories.find(cat => cat.categoryName === equipment.categoryName); // Dùng categoryName
        const selectedLocation = locations.find(loc => loc.locationName === equipment.locationName); // Dùng locationName

        setSelectedEquipment({
            ...equipment,
            categoryId: selectedCategory ? selectedCategory.id : '', // Gán id nếu tìm thấy, không thì ''
            locationId: selectedLocation ? selectedLocation.id : '', // Gán id nếu tìm thấy, không thì ''
            image: null,
        });
        setIsEditModalOpen(true);
    };
    const handleOpenDeleteModal = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteModalOpen(true);
    };
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewEquipmentData((prev) => ({...prev, [name]: value}));
    };
    const handleEditInputChange = (e) => {
        const {name, value} = e.target;
        setSelectedEquipment((prev) => ({...prev, [name]: value}));
    };
    const handleImageChange = (e) => {
        setNewEquipmentData((prev) => ({...prev, image: e.target.files[0]}));
    };
    const handleEditImageChange = (e) => {
        setSelectedEquipment((prev) => ({...prev, image: e.target.files[0]}));
    };

    if (loading) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center">
        <p>{t('loading')}</p></div>;
    if (error) return <div className="min-h-screen p-6 min-w-full flex items-center justify-center"><p
        className="text-red-600">{t('error')}: {error}</p></div>;

    return (<div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('equipments')}</h1>
            </div>
            <div className="mb-6 flex justify-between items-center">
                <SearchBar/>
                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={16}/>
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
                        <th className="py-4 px-6 text-left font-semibold">{t('category')}</th>
                        {/* Hiển thị tên category */}
                        <th className="py-4 px-6 text-left font-semibold">{t('location')}</th>
                        {/* Hiển thị tên location */}
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
                                {equipment.imageUrl ? (<img
                                    src={equipment.imageUrl}
                                    alt={equipment.name}
                                    className="w-16 h-16 object-cover rounded"
                                    onError={(e) => {
                                        console.error(`Failed to load image: ${equipment.imageUrl}`);
                                        e.target.src = '/fallback-image.png';
                                    }}
                                />) : ('No image')}
                            </td>
                            <td className="py-4 px-6 text-gray-800">{equipment.quantity}</td>
                            <td className="py-4 px-6">
                                    <span
                                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(equipment.status)}`}>
                                        {equipment.status}
                                    </span>
                            </td>
                            <td className="py-4 px-6 text-gray-800">
                                {format(new Date(equipment.purchaseDate), 'dd/MM/yyyy HH:mm')}
                            </td>
                            <td className="py-4 px-6 text-gray-800">{equipment.categoryName}</td>
                            {/* Hiển thị tên category */}
                            <td className="py-4 px-6 text-gray-800">{equipment.locationName}</td>
                            {/* Hiển thị tên location */}
                            <td className="py-4 px-6 text-gray-800">{equipment.description}</td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        className="p-2 text-blue-700 font-bold rounded-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenEditModal(equipment)}
                                    >
                                        <Pencil size={16}/>
                                    </button>
                                    <button
                                        className="px-2 py-1 text-red-700 font-bold rounded-md hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                                        onClick={() => handleOpenDeleteModal(equipment)}
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
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
                locations={locations}
                categories={categories}
            />
            <EditEquipment
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditEquipment}
                equipment={selectedEquipment || {}}
                onInputChange={handleEditInputChange}
                onImageChange={handleEditImageChange}
                locations={locations}
                categories={categories}
            />
            <DeleteEquipment
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEquipment}
                equipmentName={equipmentToDelete?.name || ''}
            />
        </div>);
}