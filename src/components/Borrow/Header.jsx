import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function Header({ user, searchQuery, setSearchQuery }) {
    const { t } = useTranslation();

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">{t('borrow')}</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('searchByEquipmentName')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
            </div>
            <div className="text-gray-700">
                {t('userInfo', { name: user.name, id: user.id })}
            </div>
        </header>
    );
}