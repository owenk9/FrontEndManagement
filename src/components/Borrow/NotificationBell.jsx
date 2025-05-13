// NotificationBell.jsx
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:9090';

export default function NotificationBell({ userId }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menuOpenForNotification, setMenuOpenForNotification] = useState(null);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.error(t('noRefreshToken'));
            return false;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('refreshTokenFailed'));
            }
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || localStorage.getItem('refreshToken'));
            return true;
        } catch (err) {
            console.error('Refresh token error:', err);
            alert(err.message || t('refreshTokenFailed'));
            return false;
        }
    };

    const fetchNotifications = async () => {
        if (!userId) {
            console.warn('userId is undefined, skipping fetchNotifications');
            return;
        }

        try {
            setLoading(true);
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error(t('noToken'));
                return;
            }

            const response = await fetch(`${BASE_URL}/notification/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(`${BASE_URL}/notification/user/${userId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            throw new Error(t('fetchErrorAfterRefresh'));
                        }
                        const data = await retryResponse.json();
                        const sortedNotifications = data.sort((a, b) => {
                            if (!a.isRead && b.isRead) return -1;
                            if (a.isRead && !b.isRead) return 1;
                            return 0;
                        });
                        setNotifications(sortedNotifications || []);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('fetchError')}: Notifications`);
                }
            } else {
                const data = await response.json();
                console.log('Fetched notifications:', data);
                const sortedNotifications = data.sort((a, b) => {
                    if (!a.isRead && b.isRead) return -1;
                    if (a.isRead && !b.isRead) return 1;
                    return 0;
                });
                console.log('Sorted notifications:', sortedNotifications);
                setNotifications(sortedNotifications || []);
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error(t('noToken'));
                return;
            }

            const response = await fetch(`${BASE_URL}/notification/read/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(`${BASE_URL}/notification/read/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            const errorText = await retryResponse.text();
                            throw new Error(`${t('updateError')}: Mark as read - ${errorText}`);
                        }
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`${t('updateError')}: Mark as read - ${errorText}`);
                }
            }

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id ? { ...notification, isRead: true } : notification
                ).sort((a, b) => {
                    if (!a.isRead && b.isRead) return -1;
                    if (a.isRead && !b.isRead) return 1;
                    return 0;
                })
            );
        } catch (err) {
            console.error('Mark as read error:', err);
            alert(err.message);
        }
    };

    const deleteNotification = async (id) => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error(t('noToken'));
                return;
            }

            const response = await fetch(`${BASE_URL}/notification/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetch(`${BASE_URL}/notification/delete/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            throw new Error(t('deleteErrorAfterRefresh'));
                        }
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(`${t('deleteError')}: Delete notification`);
                }
            }

            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification.id !== id)
            );
        } catch (err) {
            console.error('Delete notification error:', err);
        }
    };

    // Lắng nghe sự kiện xác nhận mượn để thêm thông báo mới
    useEffect(() => {
        const handleBorrowingConfirmation = (event) => {
            const { notification } = event.detail; // Lấy thông báo từ sự kiện
            if (notification && notification.usersId === userId) {
                setNotifications((prevNotifications) => {
                    // Kiểm tra xem thông báo đã tồn tại chưa
                    const exists = prevNotifications.some((notif) => notif.id === notification.id);
                    if (!exists) {
                        return [...prevNotifications, notification].sort((a, b) => {
                            if (!a.isRead && b.isRead) return -1;
                            if (a.isRead && !b.isRead) return 1;
                            return 0;
                        });
                    }
                    return prevNotifications;
                });
            }
        };

        window.addEventListener('borrowingConfirmed', handleBorrowingConfirmation);
        return () => window.removeEventListener('borrowingConfirmed', handleBorrowingConfirmation);
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [t, userId]);

    useEffect(() => {
        const handleRefresh = () => {
            fetchNotifications();
        };
        window.addEventListener('refreshBorrowingList', handleRefresh);
        return () => window.removeEventListener('refreshBorrowingList', handleRefresh);
    }, []);

    const handleClickOutside = (e) => {
        if (showDropdown && !e.target.closest('.notification-container')) {
            setShowDropdown(false);
        }
        if (menuOpenForNotification !== null && !e.target.closest('.notification-menu')) {
            setMenuOpenForNotification(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown, menuOpenForNotification]);

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return (
        <div className="relative notification-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative focus:outline-none"
                aria-label={t('notifications')}
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{t('notifications')}</h3>
                            {loading && <span className="text-xs text-gray-500">{t('loading')}...</span>}
                        </div>

                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 border-b border-gray-200 relative ${
                                        notification.isRead ? 'bg-gray-100' : 'bg-yellow-50'
                                    } hover:bg-gray-200 transition-colors duration-150`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                            {/*<p className="text-xs text-gray-400">*/}
                                            {/*    {new Date(notification.createdAt).toLocaleString('en-GB', {*/}
                                            {/*        year: 'numeric',*/}
                                            {/*        month: '2-digit',*/}
                                            {/*        day: '2-digit',*/}
                                            {/*        hour: '2-digit',*/}
                                            {/*        minute: '2-digit',*/}
                                            {/*        hour12: false,*/}
                                            {/*    })}*/}
                                            {/*</p>*/}
                                        </div>
                                        <div className="relative notification-menu">
                                            <button
                                                onClick={() =>
                                                    setMenuOpenForNotification(
                                                        menuOpenForNotification === notification.id ? null : notification.id
                                                    )
                                                }
                                                className="p-1 hover:bg-gray-300 rounded-full"
                                            >
                                                <MoreHorizontal size={16} className="text-gray-500" />
                                            </button>
                                            {menuOpenForNotification === notification.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Check size={16} className="mr-2 text-green-600" />
                                                            {t('markAsRead')}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Trash2 size={16} className="mr-2 text-red-600" />
                                                        {t('delete')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600 p-3">{t('noNotifications')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}