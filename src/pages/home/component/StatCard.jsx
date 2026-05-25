import { Card } from 'antd';

const StatCard = ({ title, data }) => {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card title={title} style={{ borderRadius: 12 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                }}
            >
                {data.map((item, idx) => (
                    <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 'clamp(12px, 1.5vw, 16px)', fontWeight: 500 }}>
                            {item.label}
                        </div>
                        <div
                            style={{
                                fontSize: 'clamp(20px, 3vw, 28px)',
                                fontWeight: 700,
                                color: item.color,
                            }}
                        >
                            {item.percent}%
                        </div>
                        <div style={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: item.color }}>
                            {item.count.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ position: 'relative', height: 28, marginTop: 8 }}>
                <div
                    style={{
                        display: 'flex',
                        height: 20,
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
                    {data.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: `${item.percent}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div
                style={{
                    marginTop: 16,
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                }}
            >
                Total: {totalCount.toLocaleString()}
            </div>
        </Card>
    );
};

export default StatCard;
