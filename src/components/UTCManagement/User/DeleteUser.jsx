import { useTranslation } from 'react-i18next';

export default function DeleteUser({ isOpen, onClose, onConfirm, userName }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className="bg-white rounded-lg shadow-xl w-80 max-w-[90%] p-6 pointer-events-auto">
                    <h2 className="text-lg font-bold text-center text-gray-900 mb-4">{t('deleteUser')}</h2>
                    <p className="text-gray-700 mb-6">
                        {t('areYouSureDeleteUser', { name: userName })}?
                    </p>
                    <div className="flex justify-between">
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition duration-200"
                        >
                            {t('yes')}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            {t('no')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}