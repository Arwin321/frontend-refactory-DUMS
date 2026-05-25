import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import ImgRobot from '../../assets/freepik/404.png';

const { Title, Paragraph, Text } = Typography;

const NotFound = () => {
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
            <Title
                level={2}
                style={{
                    fontWeight: 800,
                    marginBottom: 12,
                    fontSize: 'clamp(28px, 5vw, 42px)',
                    color: '#1f1f1f',
                }}
            >
                Oops... You seem lost.
            </Title>

            <Paragraph
                style={{
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    maxWidth: '90%',
                    color: '#595959',
                    marginBottom: '3vh',
                }}
            >
                We couldn't find the page you were looking for. Let us take you back to the main
                page.
            </Paragraph>

            <img
                src={ImgRobot}
                alt="404 Not Found"
                style={{
                    maxWidth: '90%',
                    width: '480px',
                    marginBottom: '4vh',
                }}
            />

            <Link to="/">
                <Button
                    type="default"
                    size="large"
                    style={{
                        backgroundColor: '#2f2f2f',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                    }}
                >
                    Go back
                </Button>
            </Link>

            <Text type="secondary" style={{ fontSize: '12px', marginTop: '5vh' }}>
                Illustration by{' '}
                <a
                    href="https://www.freepik.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1890ff' }}
                >
                    Freepik
                </a>
            </Text>
        </div>
    );
};

export default NotFound;
