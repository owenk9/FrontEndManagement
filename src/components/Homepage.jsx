export default function Homepage(){
    const stats = [
        { title: 'Tổng thiết bị', value: '150', color: 'bg-blue-100 text-blue-800' },
        { title: 'Đang mượn', value: '12', color: 'bg-green-100 text-green-800' },
        { title: 'Cần bảo trì', value: '5', color: 'bg-red-100 text-red-800' },
    ];
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Chào mừng đến với Hệ thống Quản lý Thiết bị</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.color} p-6 rounded-lg shadow-md flex flex-col items-center justify-center`}
                    >
                        <p className="text-lg font-semibold">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}