import { Search } from "lucide-react";
export default function SearchBar(){
    return (
        <div className="relative w-64">
            <input type="text"
                   placeholder="Search..."
                   className="w-full py-2 pl-10 pr-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
    )
}