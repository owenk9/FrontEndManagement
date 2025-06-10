import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Auth/AuthContext.jsx';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

            const [
                totalEquipmentResponse,
                totalEquipmentItemsResponse,
                statusDistributionResponse,
                totalMaintenanceCostResponse,
                maintenanceByTimeResponse,
                brokenByTimeResponse,
            ] = await Promise.all([
                fetchWithAuth(`${BASE_URL}/statistics/total_equipment`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
                fetchWithAuth(`${BASE_URL}/statistics/total_equipment_item`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
                fetchWithAuth(`${BASE_URL}/statistics/status_distribution`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
                fetchWithAuth(`${BASE_URL}/statistics/total_maintenance_cost`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
                fetchWithAuth(`${BASE_URL}/statistics/maintenance_by_time?startDate=2025-01-01 00:00:00&endDate=2025-12-31 23:59:59&groupBy=month`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
                fetchWithAuth(`${BASE_URL}/statistics/broken_by_time?startDate=2025-01-01 00:00:00&endDate=2025-12-31 23:59:59&groupBy=month`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
            ]);

            if (!totalEquipmentResponse.ok) throw new Error(t('fetchError') + ': Total Equipment');
            if (!totalEquipmentItemsResponse.ok) throw new Error(t('fetchError') + ': Total Equipment Items');
            if (!statusDistributionResponse.ok) throw new Error(t('fetchError') + ': Status Distribution');
            if (!totalMaintenanceCostResponse.ok) throw new Error(t('fetchError') + ': Total Maintenance Cost');
            if (!maintenanceByTimeResponse.ok) throw new Error(t('fetchError') + ': Maintenance By Time');
            if (!brokenByTimeResponse.ok) throw new Error(t('fetchError') + ': Broken By Time');

            const [
                totalEquipment,
                totalEquipmentItems,
                statusDistribution,
                totalMaintenanceCost,
                maintenanceByTime,
                brokenByTime,
            ] = await Promise.all([
                totalEquipmentResponse.json(),
                totalEquipmentItemsResponse.json(),
                statusDistributionResponse.json(),
                totalMaintenanceCostResponse.json(),
                maintenanceByTimeResponse.json(),
                brokenByTimeResponse.json(),
            ]);

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


    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return '#34D399';
            case 'BROKEN':
                return '#EF4444';
            case 'MAINTENANCE':
                return '#FBBF24';
            case 'IN_PROGRESS':
                return '#3B82F6';
            case 'COMPLETED':
                return '#A855F7';
            case 'FAILED':
                return '#F87171';
            default:
                return '#D1D5DB';
        }
    };

    const statusChartData = {
        labels: stats.statusDistribution.map((item) => item.status),
        datasets: [
            {
                label: t('statusDistribution'),
                data: stats.statusDistribution.map((item) => item.count),
                backgroundColor: stats.statusDistribution.map((item) => getStatusColor(item.status)),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    const maintenanceByTimeChartData = {
        labels: stats.maintenanceByTime.map((item) => item.period),
        datasets: [
            {
                label: t('maintenanceByTime'),
                data: stats.maintenanceByTime.map((item) => item.maintenanceCount),
                backgroundColor: 'rgba(251, 191, 36, 0.7)',
                borderColor: '#FBBF24',
                borderWidth: 1,
                barPercentage: 0.8,
                hoverBackgroundColor: 'rgba(251, 191, 36, 1)',
            },
        ],
    };

    const maintenanceCostByTimeChartData = {
        labels: stats.maintenanceByTime.map((item) => item.period),
        datasets: [
            {
                label: t('maintenanceCostByTime'),
                data: stats.maintenanceByTime.map((item) => item.totalCost),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3B82F6',
                borderWidth: 1,
                barPercentage: 0.8,
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            },
        ],
    };

    const brokenByTimeChartData = {
        labels: stats.brokenByTime.map((item) => item.timePeriod),
        datasets: [
            {
                label: t('brokenByTime'),
                data: stats.brokenByTime.map((item) => item.count),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#EF4444',
                borderWidth: 1,
                barPercentage: 0.8,
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

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('statusDistribution')}</h2>
                <div className="h-80 flex justify-center">
                    <Pie
                        data={statusChartData}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        boxWidth: 12,
                                        padding: 20,
                                        font: { size: 14 },
                                    },
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) =>
                                            `${context.label}: ${context.raw} (${((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('maintenanceByTime')}</h2>
                <div className="h-80">
                    {stats.maintenanceByTime.length > 0 ? (
                        <Bar
                            data={maintenanceByTimeChartData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: { display: true, text: t('numberOfMaintenance') },
                                        ticks: { stepSize: 1 },
                                    },
                                    x: {
                                        title: { display: true, text: t('timePeriod') },
                                    },
                                },
                                plugins: {
                                    legend: { display: true, position: 'top' },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.dataset.label}: ${context.raw}`,
                                        },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p className="text-center text-gray-600">{t('noDataAvailable')}</p>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('maintenanceCostByTime')}</h2>
                <div className="h-80">
                    {stats.maintenanceByTime.length > 0 ? (
                        <Bar
                            data={maintenanceCostByTimeChartData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: { display: true, text: t('maintenanceCost') },
                                        ticks: { callback: (value) => `${(value / 1000000).toFixed(1)}M VND` },
                                    },
                                    x: {
                                        title: { display: true, text: t('timePeriod') },
                                    },
                                },
                                plugins: {
                                    legend: { display: true, position: 'top' },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
                                        },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p className="text-center text-gray-600">{t('noDataAvailable')}</p>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('brokenByTime')}</h2>
                <div className="h-80">
                    {stats.brokenByTime.length > 0 ? (
                        <Bar
                            data={brokenByTimeChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: { display: true, text: t('numberOfBroken') },
                                        ticks: { stepSize: 1 },
                                    },
                                    x: {
                                        title: { display: true, text: t('timePeriod') },
                                    },
                                },
                                plugins: {
                                    legend: { display: true, position: 'top' },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${t('brokenByTime')}: ${context.raw} thiết bị`,
                                        },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p className="text-center text-gray-600">{t('noDataAvailable')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}