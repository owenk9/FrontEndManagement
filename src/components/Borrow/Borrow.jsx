import {useState, useEffect, useMemo} from 'react';
import debounce from 'lodash.debounce';
import Header from './Header.jsx';
import SidebarFilter from './SidebarFilter.jsx';
import BorrowTable from './BorrowTable.jsx';
import { t } from 'i18next';

export default function Borrow() {
    const [user] = useState({ name: 'John Doe', id: '12345' });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const BASE_URL = 'http://localhost:9090';

    const fetchStatuses = async () => {
        try {
            const response = await fetch(`${BASE_URL}/equipment/get-statuses`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(t('fetchError'));
            const data = await response.json();
            setStatuses(data || []);
        } catch (err) {
            console.error('Fetch statuses error:', err);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    useEffect(() => { fetchStatuses(); }, []);
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
            <Header user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
                    statuses={statuses}
                    filterParams={filterParams}
                    clearFilters={() => {
                        setFilterDate('');
                        setFilterCategory('');
                        setFilterLocation('');
                        setFilterStatus('');
                        setSearchQuery('');
                    }}
                />
                <BorrowTable
                    searchQuery={debouncedSearchQuery}
                    filterParams={filterParams}
                    setCategories={setCategories}
                    setLocations={setLocations}
                />
            </div>
        </div>
    );
}