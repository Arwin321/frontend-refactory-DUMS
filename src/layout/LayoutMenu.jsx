import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Typography, Image } from 'antd';
import { getSessionData } from '../components/Global/Formatter';
import {
    HomeOutlined,
    DatabaseOutlined,
    SettingOutlined,
    UserOutlined,
    AntDesignOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    HistoryOutlined,
    DollarOutlined,
    RollbackOutlined,
    ProductOutlined,
    TagOutlined,
    AppstoreOutlined,
    MobileOutlined,
    WarningOutlined,
    LineChartOutlined,
    FileTextOutlined,
    BellOutlined,
    AlertOutlined,
    SafetyOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    DesktopOutlined,
    NodeExpandOutlined,
    GroupOutlined,
    SlidersOutlined,
    SnippetsOutlined,
    ContactsOutlined,
    ToolOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const allItems = [
    {
        key: 'home',
        icon: <HomeOutlined style={{ fontSize: '19px' }} />,
        label: (
            <Link to="/dashboard/home" className="fontMenus">
                Home
            </Link>
        ),
    },
    {
        key: 'dashboard-svg',
        icon: <GroupOutlined style={{ fontSize: '19px' }} />,
        label: 'Dashboard',
        children: [
            {
                key: 'dashboard-svg-compressor',
                icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                label: 'Compressor',
                children: [
                    {
                        key: 'dashboard-svg-compressor-overview',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/overview-compressor">Overview</Link>,
                    },
                    {
                        key: 'dashboard-svg-compressor-compressor-a',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/compressor-a">Compressor A</Link>,
                    },
                    {
                        key: 'dashboard-svg-compressor-compressor-b',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/compressor-b">Compressor B</Link>,
                    },
                    {
                        key: 'dashboard-svg-compressor-compressor-c',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/compressor-c">Compressor C</Link>,
                    },
                ],
            },
            {
                key: 'dashboard-svg-airdryer',
                icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                label: 'Air Dryer',
                children: [
                    {
                        key: 'dashboard-svg-airdryer-overview',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/overview-airdryer">Overview</Link>,
                    },
                    {
                        key: 'dashboard-svg-airdryer-airdryer-a',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/airdryer-a">Air Dryer A</Link>,
                    },
                    {
                        key: 'dashboard-svg-airdryer-airdryer-b',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/airdryer-b">Air Dryer B</Link>,
                    },
                    {
                        key: 'dashboard-svg-airdryer-airdryer-c',
                        icon: <NodeExpandOutlined style={{ fontSize: '19px' }} />,
                        label: <Link to="/dashboard-svg/airdryer-c">Air Dryer C</Link>,
                    },
                ],
            },
        ],
    },
    {
        key: 'master',
        icon: <DatabaseOutlined style={{ fontSize: '19px' }} />,
        label: 'Master',
        children: [
            {
                key: 'master-plant-sub-section',
                icon: <ProductOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/plant-sub-section">Plant Sub Section</Link>,
            },
            {
                key: 'master-brand-device',
                icon: <AntDesignOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/brand-device">Brand Device</Link>,
            },
            {
                key: 'master-device',
                icon: <MobileOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/device">Device</Link>,
            },
            {
                key: 'master-unit',
                icon: <AppstoreOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/unit">Unit</Link>,
            },
            {
                key: 'master-tag',
                icon: <TagOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/tag">Tag</Link>,
            },
            {
                key: 'master-status',
                icon: <SafetyOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/status">Status</Link>,
            },
            {
                key: 'master-sparepart',
                icon: <ToolOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/master/sparepart">Sparepart</Link>,
            },
            // {
            //     key: 'master-shift',
            //     icon: <ClockCircleOutlined style={{ fontSize: '19px' }} />,
            //     label: <Link to="/master/shift">Shift</Link>,
            // },
        ],
    },
    {
        key: 'report',
        icon: <SnippetsOutlined style={{ fontSize: '19px' }} />,
        label: 'Report',
        children: [
            {
                key: 'report-trending',
                icon: <LineChartOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/report/trending">Trending</Link>,
            },
            {
                key: 'report-report',
                icon: <FileTextOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/report/report">Report</Link>,
            },
        ],
    },
    {
        key: 'history',
        icon: <HistoryOutlined style={{ fontSize: '19px' }} />,
        label: 'History',
        children: [
            {
                key: 'history-alarm',
                icon: <AlertOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/history/alarm">Alarm</Link>,
            },
            {
                key: 'history-event',
                icon: <SlidersOutlined style={{ fontSize: '19px' }} />,
                label: <Link to="/history/event">Event</Link>,
            },
        ],
    },
    {
        key: 'contact',
        icon: <ContactsOutlined style={{ fontSize: '19px' }} />,
        label: (
            <Link to="/contact" className="fontMenus">
                Contact
            </Link>
        ),
    },
    {
        key: 'notification',
        icon: <BellOutlined style={{ fontSize: '19px' }} />,
        label: (
            <Link to="/notification" className="fontMenus">
                Notification
            </Link>
        ),
    },
    {
        key: 'role',
        icon: <SafetyOutlined style={{ fontSize: '19px' }} />,
        label: (
            <Link to="/role" className="fontMenus">
                Role
            </Link>
        ),
    },
    {
        key: 'user',
        icon: <UserOutlined style={{ fontSize: '19px' }} />,
        label: (
            <Link to="/user" className="fontMenus">
                User
            </Link>
        ),
    },
    // {
    //     key: 'jadwal-shift',
    //     icon: <CalendarOutlined style={{ fontSize: '19px' }} />,
    //     label: (
    //         <Link to="/jadwal-shift" className="fontMenus">
    //             Jadwal Shift
    //         </Link>
    //     ),
    // },
];

const LayoutMenu = () => {
    const location = useLocation();
    const [stateOpenKeys, setStateOpenKeys] = useState(['home']);
    const [selectedKeys, setSelectedKeys] = useState(['home']);

    // Function to get menu key from current path
    const getMenuKeyFromPath = (pathname) => {
        // Remove leading slash and split path
        const pathParts = pathname.replace(/^\//, '').split('/');

        // Handle different route patterns
        if (pathname === '/dashboard/home') return 'home';
        if (pathname === '/user') return 'user';
        if (pathname === '/role') return 'role';
        if (pathname === '/notification') return 'notification';
        if (pathname === '/jadwal-shift') return 'jadwal-shift';
        if (pathname === '/contact') return 'contact';

        // Handle master routes
        if (pathname.startsWith('/master/')) {
            const subPath = pathParts[1];
            // Convert kebab-case to the actual menu keys
            const masterKeyMap = {
                'plant-sub-section': 'master-plant-sub-section',
                'brand-device': 'master-brand-device',
                device: 'master-device',
                unit: 'master-unit',
                tag: 'master-tag',
                status: 'master-status',
                sparepart: 'master-sparepart',
                shift: 'master-shift',
            };
            return masterKeyMap[subPath] || `master-${subPath}`;
        }

        // Handle dashboard svg routes
        if (pathname.startsWith('/dashboard-svg/')) {
            const subPath = pathParts[1];
            // Map specific routes to their menu keys
            if (subPath === 'overview-compressor') return 'dashboard-svg-compressor-overview';
            if (subPath === 'compressor-a') return 'dashboard-svg-compressor-compressor-a';
            if (subPath === 'compressor-b') return 'dashboard-svg-compressor-compressor-b';
            if (subPath === 'compressor-c') return 'dashboard-svg-compressor-compressor-c';
            if (subPath === 'overview-airdryer') return 'dashboard-svg-airdryer-overview';
            if (subPath === 'airdryer-a') return 'dashboard-svg-airdryer-airdryer-a';
            if (subPath === 'airdryer-b') return 'dashboard-svg-airdryer-airdryer-b';
            if (subPath === 'airdryer-c') return 'dashboard-svg-airdryer-airdryer-c';

            return `dashboard-svg-${subPath}`;
        }

        // Handle report routes
        if (pathname.startsWith('/report/')) {
            const subPath = pathParts[1];
            const reportKeyMap = {
                trending: 'report-trending',
                report: 'report-report',
            };
            return reportKeyMap[subPath] || `report-${subPath}`;
        }

        // Handle history routes
        if (pathname.startsWith('/history/')) {
            const subPath = pathParts[1];
            const historyKeyMap = {
                alarm: 'history-alarm',
                event: 'history-event',
            };
            return historyKeyMap[subPath] || `history-${subPath}`;
        }

        return 'home'; // default
    };

    // Function to get parent keys from menu key
    const getParentKeys = (key) => {
        const parentKeys = [];

        if (key.startsWith('dashboard-svg-compressor-')) {
            parentKeys.push('dashboard-svg', 'dashboard-svg-compressor');
        } else if (key.startsWith('dashboard-svg-airdryer-')) {
            parentKeys.push('dashboard-svg', 'dashboard-svg-airdryer');
        } else if (key.startsWith('dashboard-svg-')) {
            parentKeys.push('dashboard-svg');
        } else if (key.startsWith('master-')) {
            parentKeys.push('master');
        } else if (key.startsWith('report-')) {
            parentKeys.push('report');
        } else if (key.startsWith('history-')) {
            parentKeys.push('history');
        }

        return parentKeys;
    };

    // Update selected and open keys when route changes
    useEffect(() => {
        const currentKey = getMenuKeyFromPath(location.pathname);
        setSelectedKeys([currentKey]);

        const parentKeys = getParentKeys(currentKey);

        // Always keep the parent menus open when a child is selected
        if (parentKeys.length > 0) {
            setStateOpenKeys(parentKeys);
        } else {
            setStateOpenKeys([]);
        }
    }, [location.pathname]);

    const getLevelKeys = (items1) => {
        const key = {};
        const func = (items2, level = 1) => {
            items2.forEach((item) => {
                if (item.key) {
                    key[item.key] = level;
                }
                if (item.children) {
                    func(item.children, level + 1);
                }
            });
        };
        func(items1);
        return key;
    };

    const levelKeys = getLevelKeys(allItems);

    const onOpenChange = (openKeys) => {
        const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);

        // If clicking on a menu that was previously closed
        if (currentOpenKey !== undefined) {
            const repeatIndex = openKeys
                .filter((key) => key !== currentOpenKey)
                .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

            setStateOpenKeys(
                openKeys
                    .filter((_, index) => index !== repeatIndex)
                    .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
            );
        } else {
            // If clicking on a menu that was previously open, close only that menu
            // but keep other parent menus open if they have active children
            const currentKey = getMenuKeyFromPath(location.pathname);
            const necessaryParentKeys = getParentKeys(currentKey);

            // Filter out only the menus that are necessary to keep open
            const filteredOpenKeys = openKeys.filter((key) => necessaryParentKeys.includes(key));

            setStateOpenKeys(filteredOpenKeys);
        }
    };

    const session = getSessionData();
    const isAdmin = session?.user?.user_id;

    const karyawan = () => {
        return allItems
            .filter((item) => item.key !== 'setting')
            .map((item) => {
                if (item.key === 'master') {
                    return {
                        ...item,
                    };
                }
                return item;
            });
    };

    const items = isAdmin === 1 ? allItems : karyawan();

    return (
        <Menu
            mode="inline"
            items={items}
            selectedKeys={selectedKeys}
            openKeys={stateOpenKeys}
            onOpenChange={onOpenChange}
            style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
            }}
            theme="dark"
            className="custom-green-menu"
        />
    );
};
export default LayoutMenu;
