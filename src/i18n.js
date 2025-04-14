import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    settings: 'Settings',
                    personalInfo: 'Personal Information',
                    name: 'Name',
                    email: 'Email',
                    saveChanges: 'Save Changes',
                    changePassword: 'Change Password',
                    currentPassword: 'Current Password',
                    newPassword: 'New Password',
                    confirmPassword: 'Confirm New Password',
                    update: 'Update',
                    cancel: 'Cancel',
                    language: 'Language',
                    english: 'English',
                    vietnamese: 'Vietnamese',
                    infoSaved: 'Information has been saved!',
                    fillAllFields: 'Please fill in all the fields!',
                    passwordMismatch: 'The new password and confirmation do not match!',
                    passwordUpdated: 'Password has been updated!',

                    //  Borrowing
                    borrowing: 'Borrowing',
                    id: 'Id',
                    equipmentName: 'Equipment name',
                    userName: 'Name',
                    borrowDate: 'Borrow date',
                    returnDate: 'Return date',
                    status: 'Status',
                    actions: 'Actions',
                    returned: 'Returned',
                    borrowingStatus: 'Borrowing',
                    na: 'N/A',

                    //  AddCategory
                    addNewCategory: 'Add New Category',
                    categoryName: 'Category Name',
                    description: 'Description',
                    save: 'Save',
                    enterId: 'Enter ID',
                    enterCategoryName: 'Enter category name',
                    enterDescription: 'Enter description',

                    //  Category
                    category: 'Category',
                    addCategory: 'Add Category',
                    fillRequiredFields: 'Please fill in all required fields: ID, Name',

                    //  AddEquipment
                    addNewEquipment: 'Add New Equipment',
                    statusActive: 'Active',
                    statusMaintenance: 'Maintenance',
                    statusBroken: 'Broken',
                    purchaseDate: 'Purchase Date',
                    enterEquipmentName: 'Enter equipment name',
                    quantity: 'Quantity',
                    enterQuantity: 'Enter quantity',

                    //  EquipmentList
                    equipments: 'Equipments',
                    addEquipment: 'Add Equipment',
                    fillRequiredEquipmentFields: 'Please fill in all required fields: ID, Name, Purchase Date',
                    image: "Image",
                    location: "Location",
                    selectCategory: 'Select Category',
                    selectLocation: 'Select Location',
                    noImage: 'No image',

                    //  Maintenance
                    maintenance: 'Maintenance',
                    maintenanceDate: 'Maintenance Date',
                    cost: 'Cost',
                    technician: 'Technician',

                    //  Location
                    locations: 'Locations',
                    locationName: 'Location Name',
                    equipment: 'Equipment',
                    addEquipmentToLocation: 'Add Equipment to Location',
                    fillRequiredEquipmentFieldsForLocation: 'Please fill in all required fields: ID, Name',

                    // NavBar
                    home: 'Home',
                    // EditEquipment
                    editEquipment: 'Edit Equipment',

                    //  DeleteConfirmation
                    confirmDelete: 'Confirm Delete',
                    areYouSureDeleteEquipment: 'Are you sure you want to delete',
                    yes: 'Yes',
                    no: 'No',

                    // EditCategory
                    editCategory: 'Edit Category',

                    // DeleteCategory
                    areYouSureDeleteCategory: 'Are you sure you want to delete',

                    // AddLocation
                    addLocation: 'Add Location',
                    enterLocationName: 'Enter location name',
                    fillRequiredLocationFields: 'Please fill in all required fields: ID, Location Name',

                    // EditLocationModal
                    editLocation: 'Edit Location',

                    // DeleteLocationModal
                    areYouSureDeleteLocation: 'Are you sure you want to delete this location',

                    // EditMaintenanceModal
                    editMaintenance: 'Edit Maintenance',
                    fillRequiredMaintenanceFields: 'Please fill in all required fields: Name, Maintenance Date',

                    // DeleteMaintenanceModal
                    areYouSureDeleteMaintenance: 'Are you sure you want to delete this maintenance record for',
                    // AddMaintenanceModal
                    addMaintenance: 'Add Maintenance',

                    // EditBorrowingModal
                    editBorrowing: 'Edit Borrowing',
                    enterUserName: 'Enter user name',
                    fillRequiredBorrowingFields: 'Please fill in all required fields: Equipment Name, User Name, Borrow Date',

                    // DeleteBorrowingModal
                    areYouSureDeleteBorrowing: 'Are you sure you want to delete the borrowing record for',
                    by: 'by',

                    // User dropdown
                    role: 'Role',
                    viewProfile: 'View Profile',
                    logout: 'Logout',

                    // Home
                    welcome: 'Welcome',
                    homeDescription: 'Manage your equipment efficiently with UEMS.',
                    totalEquipments: 'Total Equipments',
                    borrowingCount: 'Active Borrowings',
                    maintenanceCount: 'Under Maintenance',
                    recentNotifications: 'Recent Notifications',
                    noNotifications: 'No recent notifications.',
                    manageEquipments: 'View and manage all equipments',
                    manageBorrowing: 'Track borrowing records',
                    manageMaintenance: 'Schedule and track maintenance',


                    // Pagination
                    previous: 'Previous', // Thêm Previous
                    next: 'Next', // Thêm Next
                    page: 'Page',

                    // Search bar
                    searchByEquipmentName: 'Search by name',
                },
            },
            vi: {
                translation: {
                    settings: 'Cài đặt',
                    personalInfo: 'Thông tin cá nhân',
                    name: 'Tên',
                    email: 'Email',
                    saveChanges: 'Lưu thay đổi',
                    changePassword: 'Đổi mật khẩu',
                    currentPassword: 'Mật khẩu hiện tại',
                    newPassword: 'Mật khẩu mới',
                    confirmPassword: 'Xác nhận mật khẩu mới',
                    update: 'Cập nhật',
                    cancel: 'Hủy',
                    language: 'Ngôn ngữ',
                    english: 'Tiếng Anh',
                    vietnamese: 'Tiếng Việt',
                    infoSaved: 'Thông tin đã được lưu!',
                    fillAllFields: 'Vui lòng điền đầy đủ các trường!',
                    passwordMismatch: 'Mật khẩu mới và xác nhận không khớp!',
                    passwordUpdated: 'Mật khẩu đã được cập nhật!',

                    //  Borrowing
                    borrowing: 'Mượn thiết bị',
                    id: 'Mã',
                    equipmentName: 'Tên thiết bị',
                    userName: 'Tên người mượn',
                    borrowDate: 'Ngày mượn',
                    returnDate: 'Ngày trả',
                    status: 'Trạng thái',
                    actions: 'Hành động',
                    returned: 'Đã trả',
                    borrowingStatus: 'Đang mượn',
                    na: 'Không có',

                    //  AddCategory
                    addNewCategory: 'Thêm danh mục mới',
                    categoryName: 'Tên danh mục',
                    description: 'Mô tả',
                    save: 'Lưu',
                    enterId: 'Nhập mã',
                    enterCategoryName: 'Nhập tên danh mục',
                    enterDescription: 'Nhập mô tả',

                    //  Category
                    category: 'Danh mục',
                    addCategory: 'Thêm danh mục',
                    fillRequiredFields: 'Vui lòng điền đầy đủ các trường bắt buộc: Mã, Tên',

                    //  AddEquipment
                    addNewEquipment: 'Thêm thiết bị mới',
                    statusActive: 'Hoạt động',
                    statusMaintenance: 'Bảo trì',
                    statusBroken: 'Hỏng',
                    purchaseDate: 'Ngày mua',
                    enterEquipmentName: 'Nhập tên thiết bị',
                    quantity: 'Số lượng', // Thêm quantity
                    enterQuantity: 'Nhập số lượng',

                    //  EquipmentList
                    equipments: 'Thiết bị',
                    addEquipment: 'Thêm thiết bị',
                    fillRequiredEquipmentFields: 'Vui lòng điền đầy đủ các trường bắt buộc: Mã, Tên, Ngày mua',
                    image: "Hình ảnh",
                    location: "Địa điểm",
                    selectLocation: "Chọn địa điểm",
                    selectCategory: "Chọn danh mục",
                    noImage: 'Không có hình ảnh',


                    //  Maintenance
                    maintenance: 'Bảo trì',
                    maintenanceDate: 'Ngày bảo trì',
                    cost: 'Giá',
                    technician: 'Thợ bảo trì',

                    //  Location
                    locations: 'Vị trí',
                    locationName: 'Tên vị trí',
                    equipment: 'Thiết bị', // Số lượng thiết bị ở bảng chính
                    addEquipmentToLocation: 'Thêm thiết bị vào vị trí', // Tiêu đề modal
                    fillRequiredEquipmentFieldsForLocation: 'Vui lòng điền đầy đủ các trường bắt buộc: Mã, Tên', // Thông báo lỗi

                    // NavBar
                    home: 'Trang chủ',
                    user: 'Người dùng',

                    // EditEquipment
                    editEquipment: 'Chỉnh sửa thiết bị',

                    //  DeleteConfirmationModal
                    confirmDelete: 'Xác nhận xóa',
                    areYouSureDeleteEquipment: 'Bạn có chắc muốn xóa thiết bị',
                    yes: 'Có',
                    no: 'Không',

                    // EditCategoryModal
                    editCategory: 'Chỉnh sửa danh mục',
                    // DeleteCategoryModal
                    areYouSureDeleteCategory: 'Bạn có chắc muốn xóa danh mục',

                    // AddLocation
                    addLocation: 'Thêm vị trí',
                    enterLocationName: 'Nhập tên vị trí',
                    fillRequiredLocationFields: 'Vui lòng điền đầy đủ các trường bắt buộc: Mã, Tên vị trí',

                    // EditLocationModal
                    editLocation: 'Chỉnh sửa vị trí',

                    // DeleteLocationModal
                    areYouSureDeleteLocation: 'Bạn có chắc muốn xóa vị trí này',

                    // EditMaintenanceModal
                    editMaintenance: 'Chỉnh sửa bảo trì',
                    fillRequiredMaintenanceFields: 'Vui lòng điền đầy đủ các trường bắt buộc: Tên, Ngày bảo trì',

                    // DeleteMaintenanceModal
                    areYouSureDeleteMaintenance: 'Bạn có chắc muốn xóa bản ghi bảo trì này cho',

                    // AddMaintenanceModal
                    addMaintenance: 'Thêm bảo trì',

                    // EditBorrowingModal
                    editBorrowing: 'Chỉnh sửa mượn',
                    enterUserName: 'Nhập tên người dùng',
                    fillRequiredBorrowingFields: 'Vui lòng điền đầy đủ các trường bắt buộc: Tên thiết bị, Tên người dùng, Ngày mượn',

                    // DeleteBorrowingModal
                    areYouSureDeleteBorrowing: 'Bạn có chắc muốn xóa bản ghi mượn cho',
                    by: 'bởi',

                    // User dropdown
                    role: 'Vai trò',
                    viewProfile: 'Xem hồ sơ',
                    logout: 'Đăng xuất',

                    // Home
                    welcome: 'Chào mừng',
                    homeDescription: 'Quản lý thiết bị của bạn hiệu quả với UEMS.',
                    totalEquipments: 'Tổng số thiết bị',
                    borrowingCount: 'Số lượt mượn đang hoạt động',
                    maintenanceCount: 'Đang bảo trì',
                    recentNotifications: 'Thông báo gần đây',
                    noNotifications: 'Không có thông báo gần đây.',
                    manageEquipments: 'Xem và quản lý tất cả thiết bị',
                    manageBorrowing: 'Theo dõi hồ sơ mượn',
                    manageMaintenance: 'Lên lịch và theo dõi bảo trì',

                    // Pagination
                    previous: 'Trang trước',
                    next: 'Trang sau',
                    page: 'Trang',

                    // Search bar
                    searchByEquipmentName: 'Tìm kiếm theo tên ',
                },
            },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;