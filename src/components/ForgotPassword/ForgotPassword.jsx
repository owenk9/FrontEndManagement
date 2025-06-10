import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const BASE_URL = 'http://localhost:9090';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 404 || errorText.toLowerCase().includes('not found')) {
                    throw new Error(t('emailNotFound'));
                }
                throw new Error(errorText || t('forgotPasswordError'));
            }

            toast.success(t('resetPasswordLinkSent'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('forgotPassword')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('enterEmail')}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors"
                        disabled={loading}
                    >
                        {loading ? t('sending') : t('sendResetLink')}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    <a href="/login" className="text-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
                        {t('backToLogin')}
                    </a>
                </p>
            </div>
            <ToastContainer />
        </div>
    );
}