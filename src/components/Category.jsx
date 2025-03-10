import SearchBar from "./SearchBar.jsx";
import {Pencil, Trash2} from "lucide-react";

export default function Category(){
    const categoryData = [
        { id: 1, name: 'Thiết bị trình chiếu', description: 'Máy chiếu, màn hình' },
        { id: 2, name: 'Máy tính', description: 'PC, laptop' },
        { id: 3, name: 'Thiết bị âm thanh', description: 'Loa, micro' },
    ];
    return(
        <div className="min-h-screen p-6 min-w-full overflow-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Category</h1>
            </div>
            <div className="mb-6">
                <SearchBar/>
            </div>
            <div className="bg-white shadow-md rounded-lg mb-4">
                <table className="min-w-full">
                    <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="py-4 px-6 text-left font-semibold">Id</th>
                        <th className="py-4 px-6 text-left font-semibold">Category name</th>
                        <th className="py-4 px-6 text-left font-semibold">Description</th>
                        <th className="py-4 px-6 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categoryData.map((category) =>
                        <tr key={category.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-800">{category.id}</td>
                            <td className="py-4 px-6 text-gray-800">{category.name}</td>
                            <td className="py-4 px-6 text-gray-800">{category.description}</td>
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
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}