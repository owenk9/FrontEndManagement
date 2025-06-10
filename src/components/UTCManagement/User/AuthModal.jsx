export default function AuthModal({ isOpen, onClose, user }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
                    <div className="mb-6">
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> {user?.email || 'Unknown'}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Full Name:</span> {user?.fullName || 'Not updated'}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Role:</span> {user?.role || 'Unknown'}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Department:</span> {user?.department || 'Not updated'}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}