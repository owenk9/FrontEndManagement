import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(
        debounce((value) => {
            onSearch(value);
        }, 300),
        [onSearch]
    );

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value); // Cập nhật state nội bộ
        debouncedSearch(value);
        console.log('SearchBar value:', value);
    };

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <div className="relative w-64">
            <input
                type="text"
                value={searchTerm} // Sử dụng state nội bộ
                onChange={handleSearch}
                placeholder={placeholder || t('searchByEquipmentName')}
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