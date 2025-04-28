import 'react';

export default function AuthModal({ isOpen, onClose }) {
    const user = { username: 'NguyenVanA' };

    const handleLogout = () => {
        console.log('Đăng xuất');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            {/*<div*/}
            {/*    className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm z-40"*/}
            {/*    onClick={onClose}*/}
            {/*/>*/}

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50  bg-black/30">
                <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin tài khoản</h2>
                    <div className="mb-6">
                        <p className="text-gray-700">
                            <span className="font-semibold">Tên tài khoản:</span> {user.username}
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Đổi mật khẩu</h3>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">
                            Cập nhật mật khẩu
                        </button>
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                        >
                            Đăng xuất
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}