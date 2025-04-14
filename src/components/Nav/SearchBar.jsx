import { useTranslation } from 'react-i18next';
import {useState} from "react";

export default function SearchBar({ onSearch }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value); // Gửi giá trị tìm kiếm lên parent component
    };

    return (
        <div className="relative w-64">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={t('searchByEquipmentName')}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </div>
    );
}