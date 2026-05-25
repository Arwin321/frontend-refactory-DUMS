import { Button, Spin, Typography } from 'antd';
import { Link } from 'react-router-dom';
import ImgPIU from '../../assets/freepik/LOGOPIU.png';

const { Title, Paragraph, Text } = Typography;

const Waiting = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
                padding: '5vh 16px',
                textAlign: 'center',
                minHeight: '100vh',
            }}
        >
            <img
                src={ImgPIU} 
                alt="Loading"
                style={{
                    maxWidth: '30%',
                    // width: '400px',
                    marginBottom: '4vh',
                }}
            />
            <Spin size="large" style={{ marginBottom: '4vh' }} />

            <Title
                level={2}
                style={{
                    fontWeight: 800,
                    marginBottom: 12,
                    fontSize: 'clamp(28px, 5vw, 42px)',
                    color: '#1f1f1f',
                }}
            >
                Please wait...
            </Title>

            <Paragraph
                style={{
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    maxWidth: '90%',
                    color: '#595959',
                    marginBottom: '3vh',
                }}
            >
                We are loading your content. This won’t take long.
            </Paragraph>
        </div>
    );
};

export default Waiting;
