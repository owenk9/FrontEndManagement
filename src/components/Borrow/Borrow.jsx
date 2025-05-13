import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import Header from './Header.jsx';
import SidebarFilter from './SidebarFilter.jsx';
import BorrowTable from './BorrowTable.jsx';
import { t } from 'i18next';

export default function Borrow() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [userId, setUserId] = useState(null); // Thêm state userId

    const debouncedSetQuery = useMemo(() => {
        return debounce((value) => {
            setDebouncedSearchQuery(value);
        }, 500);
    }, []);

    useEffect(() => {
        debouncedSetQuery(searchQuery);
        return () => {
            debouncedSetQuery.cancel();
        };
    }, [searchQuery, debouncedSetQuery]);

    const filterParams = useMemo(() => ({
        filterDate, filterCategory, filterLocation, filterStatus
    }), [filterDate, filterCategory, filterLocation, filterStatus]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setUserId={setUserId} // Truyền callback để cập nhật userId
            />
            <div className="flex flex-1 p-6">
                <SidebarFilter
                    filterDate={filterDate}
                    setFilterDate={setFilterDate}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    filterLocation={filterLocation}
                    setFilterLocation={setFilterLocation}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    categories={categories}
                    locations={locations}
                    filterParams={filterParams}
                    clearFilters={() => {
                        setFilterDate('');
                        setFilterCategory('');
                        setFilterLocation('');
                        setFilterStatus('');
                        setSearchQuery('');
                    }}
                />
                {userId ? (
                    <BorrowTable
                        searchQuery={debouncedSearchQuery}
                        filterParams={filterParams}
                        setCategories={setCategories}
                        setLocations={setLocations}
                        userId={userId} // Truyền userId cho BorrowTable
                    />
                ) : (
                    <div className="flex-1 p-6 text-center">
                        <p className="text-gray-600">{t('loadingUserData')}...</p>
                    </div>
                )}
            </div>
        </div>
    );
}