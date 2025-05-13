import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext.jsx';

export default function ProtectedRoute({ children, requiredAuthorities }) {
    const { user, loading, refreshToken } = useAuth();
    const location = useLocation();
    const [checkingToken, setCheckingToken] = useState(true);
    const BASE_URL = 'http://localhost:9090';

    useEffect(() => {
        const verifyToken = async () => {
            const accessToken = localStorage.getItem('accessToken');

            if (!user && !loading && accessToken) {
                try {
                    const response = await fetch(`${BASE_URL}/user/me`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            const refreshed = await refreshToken();
                            if (!refreshed) {
                                setCheckingToken(false);
                                return;
                            }
                        } else {
                            throw new Error('Failed to verify token');
                        }
                    }
                } catch (err) {
                    console.error('Token verification error:', err);
                }
            }

            setCheckingToken(false);
        };

        verifyToken();
    }, [user, loading, refreshToken]);

    if (loading || checkingToken) {
        return <div>Loading...</div>; // Don't render child yet
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredAuthorities && !Array.isArray(requiredAuthorities)) {
        requiredAuthorities = [requiredAuthorities];
    }

    if (
        requiredAuthorities &&
        !requiredAuthorities.some((auth) => user.authorities.includes(auth))
    ) {
        return (
            <Navigate
                to="/"
                state={{ from: location, message: 'You do not have permission to access this page.' }}
                replace
            />
        );
    }

    return children;
}
