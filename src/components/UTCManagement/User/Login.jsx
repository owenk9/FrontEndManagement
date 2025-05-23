// src/components/UTCManagement/User/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext.jsx';
import {jwtDecode} from "jwt-decode";

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshToken, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const BASE_URL = 'http://localhost:9090';

    const validateForm = () => {
        if (!email || !password) {
            setValidationError(t('invalidCredentials') || 'Email or password is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError(t('invalidCredentials') || 'Invalid email format');
            return false;
        }

        setValidationError(null);
        return true;
    };

    const decodeToken = async (token) => {
        try {
            let decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                token = await refreshToken();
                decoded = jwtDecode(token);
            }
            console.log(decoded)
            return {
                id: decoded.sub,
                authorities: decoded.authorities || [],
            };
        } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // logout()
        }
    }
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('loginError') || 'Invalid credentials');
            }

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const token = await decodeToken(data.accessToken);

            if (token.authorities.includes("ROLE_ADMIN") || token.authorities.includes("ROLE_SUPER_ADMIN")) {
                navigate('/homepage', { replace: true });
                console.log("admin")
            } else if (token.authorities.includes("ROLE_USER")) {
                navigate('/borrow', { replace: true });
                console.log("user")
            } else {
                logout();
            }

            await refreshToken();
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleInputChange = (e, setter) => {
        setter(e.target.value);
        setValidationError(null);
        setError(null);
    };

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">{t('login')}</h1>

                {(validationError || error) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                        {validationError || error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => handleInputChange(e, setEmail)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            {t('password')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => handleInputChange(e, setPassword)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
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

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-700">
                                {t('rememberMe') || 'Remember Me'}
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-gray-700 hover:text-black underline"
                        >
                            {t('forgotPassword') || 'Forgot Password?'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-700 transition disabled:bg-gray-400"
                    >
                        {loading ? t('loading') : t('login')}
                    </button>
                </form>
            </div>
        </div>
    );
}