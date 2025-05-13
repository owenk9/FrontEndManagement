import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const BASE_URL = 'http://localhost:9090';

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            logout();
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to refresh token');
            }
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || refreshToken);
            const decoded = jwtDecode(data.accessToken);
            setUser({
                id: decoded.sub,
                authorities: decoded.authorities || [],
            });
            return data.access_token
        } catch (error) {
            console.error('Refresh token error:', error);
            logout();
        }
    };

    const fetchWithAuth = async (url, options = {}) => {
        let accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            await refreshToken();
            accessToken = localStorage.getItem('accessToken');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            ...options.headers,
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // If the token has expired, try refreshing and retrying once
            if (response.status === 401) {
                await refreshToken();
                const newAccessToken = localStorage.getItem('accessToken');
                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                return retryResponse;
            }

            return response;
        } catch (error) {
            console.error('fetchWithAuth error:', error);
            throw error;
        }
    };
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        await refreshToken();
                    } else {
                        setUser({
                            id: decoded.sub,
                            authorities: decoded.authorities || [],
                        });
                    }
                } catch (error) {
                    console.error('Invalid token:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const hasAuthority = (authority) => user?.authorities.includes(authority) || false;

    const hasAnyAuthority = (requiredAuthorities) =>
        requiredAuthorities.some((auth) => user?.authorities.includes(auth));

    const logout = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            }).catch((err) => console.error('Logout error:', err));
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshToken, hasAuthority, hasAnyAuthority, logout , fetchWithAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);