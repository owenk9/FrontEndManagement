import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

export default function Statistics() {
    const { t } = useTranslation();
    const { fetchWithAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalEquipment: 0,
        totalEquipmentItems: 0,
        totalMaintenanceCost: 0,
        statusDistribution: [],
        maintenanceByTime: [],
        brokenByTime: [],
    });
    const BASE_URL = 'http://localhost:9090';

    const fetchStatistics = async () => {
        try {
            setLoading(true);

            // Fetch tổng số Equipment
            const totalEquipmentResponse = await fetchWithAuth(`${BASE_URL}/statistics/total_equipment`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!totalEquipmentResponse.ok) throw new Error(t('fetchError'));
            const totalEquipment = await totalEquipmentResponse.json();

            // Fetch tổng số EquipmentItems
            const totalEquipmentItemsResponse = await fetchWithAuth(`${BASE_URL}/statistics/total_equipment_item`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!totalEquipmentItemsResponse.ok) throw new Error(t('fetchError'));
            const totalEquipmentItems = await totalEquipmentItemsResponse.json();

            // Fetch phân bố trạng thái
            const statusDistributionResponse = await fetchWithAuth(`${BASE_URL}/statistics/status_distribution`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!statusDistributionResponse.ok) throw new Error(t('fetchError'));
            const statusDistribution = await statusDistributionResponse.json();

            // Fetch tổng chi phí bảo trì
            const totalMaintenanceCostResponse = await fetchWithAuth(`${BASE_URL}/statistics/total_maintenance_cost`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!totalMaintenanceCostResponse.ok) throw new Error(t('fetchError'));
            const totalMaintenanceCost = await totalMaintenanceCostResponse.json();

            // Fetch số lượng bảo trì theo thời gian (giới hạn trong năm 2025)
            const maintenanceByTimeResponse = await fetchWithAuth(
                `${BASE_URL}/statistics/maintenance_by_time?startDate=2025-01-01 00:00:00&endDate=2025-12-31 23:59:59&groupBy=month`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!maintenanceByTimeResponse.ok) throw new Error(t('fetchError'));
            const maintenanceByTime = await maintenanceByTimeResponse.json();

            // Fetch số lượng thiết bị hỏng theo thời gian (giới hạn trong năm 2025)
            const brokenByTimeResponse = await fetchWithAuth(
                `${BASE_URL}/statistics/broken_by_time?startDate=2025-01-01 00:00:00&endDate=2025-12-31 23:59:59&groupBy=month`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!brokenByTimeResponse.ok) throw new Error(t('fetchError'));
            const brokenByTime = await brokenByTimeResponse.json();

            setStats({
                totalEquipment,
                totalEquipmentItems,
                totalMaintenanceCost,
                statusDistribution,
                maintenanceByTime,
                brokenByTime,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    // Dữ liệu cho biểu đồ phân bố trạng thái (đổi từ Bar sang Doughnut)
    const statusChartData = {
        labels: stats.statusDistribution.map((item) => item.status),
        datasets: [
            {
                label: t('statusDistribution'),
                data: stats.statusDistribution.map((item) => item.count),
                backgroundColor: ['#34D399', '#EF4444', '#FBBF24', '#3B82F6'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2,
                hoverOffset: 10
            },
        ],
    };

    // Dữ liệu cho biểu đồ số lượng bảo trì theo thời gian (đổi từ Bar sang Line)
    const maintenanceByTimeChartData = {
        labels: stats.maintenanceByTime.map((item) => item.timePeriod),
        datasets: [
            {
                label: t('maintenanceByTime'),
                data: stats.maintenanceByTime.map((item) => item.maintenanceCount || item.count),
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                borderColor: '#FBBF24',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#FBBF24',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true
            },
        ],
    };

    // Dữ liệu cho biểu đồ chi phí bảo trì theo thời gian (giữ nguyên Bar)
    const maintenanceCostByTimeChartData = {
        labels: stats.maintenanceByTime.map((item) => item.timePeriod),
        datasets: [
            {
                label: t('maintenanceCostByTime'),
                data: stats.maintenanceByTime.map((item) => item.totalCost || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 1,
            },
        ],
    };

    // Dữ liệu cho biểu đồ số lượng thiết bị hỏng theo thời gian (giữ nguyên Bar)
    const brokenByTimeChartData = {
        labels: stats.brokenByTime.map((item) => item.timePeriod),
        datasets: [
            {
                label: t('brokenByTime'),
                data: stats.brokenByTime.map((item) => item.count),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#EF4444',
                borderWidth: 1,
                barPercentage: 0.7,
                hoverBackgroundColor: 'rgba(239, 68, 68, 1)',
            },
        ],
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p>{t('loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
                <button
                    onClick={fetchStatistics}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {t('retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 min-w-full bg-gray-50">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('homePage')}</h1>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-600">{t('totalEquipment')}</h2>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10h6m-6-10h6" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-600">{t('totalEquipmentItems')}</h2>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEquipmentItems}</p>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-600">{t('totalMaintenanceCost')}</h2>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalMaintenanceCost.toLocaleString()} VND</p>
                    </div>
                </div>
            </div>

            {/* Biểu đồ phân bố trạng thái - Chuyển từ Bar sang Doughnut */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('statusDistribution')}</h2>
                <div className="h-64 flex justify-center">
                    <div style={{ maxWidth: '400px' }}>
                        <Doughnut
                            data={statusChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            boxWidth: 15,
                                            padding: 15
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.label}: ${context.raw} (${((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`,
                                        }
                                    }
                                },
                                cutout: '60%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Biểu đồ số lượng bảo trì theo thời gian - Chuyển từ Bar sang Line */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('maintenanceByTime')}</h2>
                <div className="h-64">
                    <Line
                        data={maintenanceByTimeChartData}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: t('numberOfMaintenance'),
                                    },
                                    ticks: {
                                        callback: (value) => value,
                                        max: Math.max(...stats.maintenanceByTime.map((item) => item.maintenanceCount || item.count)) * 1.2 || 10,
                                    },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: t('timePeriod'),
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `${context.dataset.label}: ${context.raw}`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Biểu đồ chi phí bảo trì theo thời gian - Giữ nguyên Bar */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('maintenanceCostByTime')}</h2>
                <div className="h-64">
                    <Bar
                        data={maintenanceCostByTimeChartData}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: t('maintenanceCost'),
                                    },
                                    ticks: {
                                        callback: (value) => `${(value / 1000000).toFixed(1)}M`,
                                        max: Math.max(...stats.maintenanceByTime.map((item) => item.totalCost || 0)) * 1.2 || 12000000,
                                    },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: t('timePeriod'),
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Biểu đồ số lượng thiết bị hỏng theo thời gian - Giữ nguyên Bar */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('brokenByTime')}</h2>
                <div className="h-64">
                    <Bar
                        data={brokenByTimeChartData}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: t('numberOfBroken'),
                                    },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: t('timePeriod'),
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `${t('brokenByTime')}: ${context.raw} thiết bị`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}