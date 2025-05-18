import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const token = searchParams.get('token');
    const BASE_URL = 'http://localhost:9090';

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`${BASE_URL}/auth/validate-reset-token?token=${token}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                setTokenValid(true);
            } catch (err) {
                setError(err.message || t('invalidOrExpiredToken'));
            }
        };

        if (token) {
            validateToken();
        } else {
            setError(t('noTokenProvided'));
        }
    }, [token, fetchWithAuth, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            setLoading(false);
            return;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            setMessage(t('passwordResetSuccess'));
        } catch (err) {
            setError(err.message || t('resetPasswordError'));
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (error && !tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <p className="text-red-600 mb-4 text-center">{error}</p>
                    <p className="text-center">
                        <a href="/forgot-password" className="text-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
                            {t('tryAgain')}
                        </a>
                    </p>
                    <p className="mt-2 text-center">
                        <a href="/login" className="text-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
                            {t('backToLogin')}
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('resetPassword')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            {t('newPassword')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder={t('enterNewPassword')}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                            {t('confirmPassword')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder={t('confirmNewPassword')}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {message && <p className="text-red-600 mb-4">{message}</p>}
                    {error && <p className="text-red-600 mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors"
                        disabled={loading}
                    >
                        {loading ? t('resetting') : t('resetPassword')}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    <a href="/login" className="text-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
                        {t('backToLogin')}
                    </a>
                </p>
            </div>
        </div>
    );
}