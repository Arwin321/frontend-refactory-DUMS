import React from 'react';
import { Layout, Typography, Breadcrumb, Button, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import handleLogOut from '../Utils/Auth/Logout';
import { useBreadcrumb } from './LayoutBreadcrumb';
import { decryptData } from '../components/Global/Formatter';
import { useNavigate } from 'react-router-dom';
import DateRealTime from '../components/Global/DateRealTime';

const { Link, Text } = Typography;
const { Header } = Layout;

const LayoutHeader = () => {
    const { breadcrumbItems } = useBreadcrumb();
    const navigate = useNavigate();

    // Ambil token warna dari theme Ant Design
    const { token } = theme.useToken() || {};
    const colorBgContainer = token?.colorBgContainer || '#fff';
    const colorBorder = token?.colorBorder || '#d9d9d9';
    const colorText = token?.colorText || '#1BAA56';

    // Ambil data user dari localStorage
    let userData = null;

    const sessionData = localStorage.getItem('session');
    if (sessionData) {
        userData = decryptData(sessionData);
    } else {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                // bungkus biar konsisten { user: {...} }
                userData = { user: JSON.parse(userRaw) };
            } catch (e) {
                console.error('Gagal parse user dari localStorage:', e);
            }
        }
    }

    // console.log('User data di header:', userData?.user);

    // Role handling
    let roleName = userData?.user?.role_name || 'Guest';
    const userName = userData?.user?.name || userData?.user?.username || userData?.user?.user_name || 'User';

    // Override jika Super Admin
    if (
        userData?.user?.is_sa === true ||
        userData?.user?.is_sa === 'true' ||
        userData?.user?.is_sa === 1
    ) {
        roleName = 'Super Admin';
    }

    return (
        <>
            <Header
                style={{
                    background: colorBgContainer,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    rowGap: 10,
                    paddingTop: 15,
                    paddingBottom: 20,
                    paddingLeft: 24,
                    paddingRight: 24,
                    // minHeight: 100,
                    boxSizing: 'border-box',
                    boxShadow: '5px 0 10px rgba(0, 0, 0, 0.4)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <Text
                        style={{
                            color: '#1BAA56',
                            fontSize: 26,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {/* Login AS {roleName} */}
                        DUMS
                    </Text>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    {/* <Text
                        style={{
                            color: '#000000',
                            fontSize: 20,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                        }}
                    > */}
                        {/* Login AS {roleName} */}
                        {/* Kamis, 04 November 2025 16:35:00 */}
                    {/* </Text> */}
                    <DateRealTime/>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                    }}
                >
                    <Button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#f5f5f5',
                            border: `1px solid ${colorBorder}`,
                            borderRadius: 6,
                            padding: '4px 12px',
                        }}
                    >
                        <UserOutlined style={{ fontSize: 16, color: colorText }} />
                        <Text style={{ marginLeft: 8, color: colorText }} strong>
                            {userName} @ {roleName}
                        </Text>
                    </Button>
                    <Link
                        onClick={() => {
                            handleLogOut(navigate);
                        }}
                        aria-label="Log out from the application"
                        style={{
                            color: colorText,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Logout
                    </Link>
                </div>
            </Header>

            <div style={{ width: '100%', maxWidth: '50%', textAlign: 'left' }}>
                <Breadcrumb
                    style={{
                        marginLeft: '20px',
                        marginTop: '20px',
                        marginBottom: '10px',
                    }}
                    items={breadcrumbItems || []}
                />
            </div>
        </>
    );
};

export default LayoutHeader;
