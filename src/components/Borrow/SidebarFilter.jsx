import { useTranslation } from 'react-i18next';

export default function SidebarFilter({
                                          filterDate,
                                          setFilterDate,
                                          filterCategory,
                                          setFilterCategory,
                                          filterLocation,
                                          setFilterLocation,
                                          filterStatus,
                                          setFilterStatus,
                                          categories,
                                          locations,
                                          statuses,
                                          clearFilters,
                                      }) {
    const { t } = useTranslation();

    return (
        <div className="w-64 bg-white p-4 rounded-lg shadow-md mr-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters')}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('filterDate')}</label>
                    <input
                        type="datetime-local"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">{t('all')}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('location')}</label>
                    <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">{t('all')}</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">{t('all')}</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>{t(status)}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={clearFilters}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                    {t('clearFilters')}
                </button>
            </div>
        </div>
    );
}