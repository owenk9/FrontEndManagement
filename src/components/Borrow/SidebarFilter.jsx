import { useTranslation } from 'react-i18next';

export default function SidebarFilter({
                                          filterCategory,
                                          setFilterCategory,
                                          filterLocation,
                                          setFilterLocation,
                                          categories,
                                          locations,
                                          clearFilters,
                                      }) {
    const { t } = useTranslation();

    return (
        <div className="w-64 bg-white p-4 rounded-lg shadow-md mr-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters')}</h2>
            <div className="space-y-4">
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