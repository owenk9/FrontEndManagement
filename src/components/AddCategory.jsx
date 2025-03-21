import 'react';

export default function AddCategory({ isOpen, onClose, onSave, newCategory, onInputChange }) {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            {/*<div*/}
            {/*    className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm z-40"*/}
            {/*    onClick={onClose}*/}
            {/*/>*/}
            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6 pointer-events-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">ID</label>
                        <input
                            type="number"
                            name="id"
                            value={newCategory.id}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ID"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">Category Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newCategory.name}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter category name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={newCategory.description}
                            onChange={onInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter description"
                            rows="3"
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}