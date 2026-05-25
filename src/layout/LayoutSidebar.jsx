import React from 'react';
import { Layout } from 'antd';
import LayoutLogo from './LayoutLogo';
import LayoutMenu from './LayoutMenu';

const { Sider } = Layout;
const LayoutSidebar = () => {
    return (
        <Sider
            width={255}
            breakpoint="lg"
            collapsedWidth="0"
            onBreakpoint={(broken) => {
                // console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
                // console.log(collapsed, type);
            }}
            style={{
                background: 'linear-gradient(180deg, #1BAA56 0%,rgb(5, 75, 34) 100%)',
                // overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                borderTopRightRadius: '30px',
                borderBottomRightRadius: '30px',
                boxShadow: '5px 0 10px rgba(0, 0, 0, 0.4)',
                zIndex: 9999
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden'
            }}>
                {/* Logo section - fixed height */}
                <div style={{flexShrink: 0,minHeight: '64px'}}>
                    <LayoutLogo />
                </div>
                
                {/* Menu section - scrollable */}
                <div style={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                    <div className="custom-menu-scrollbar" style={{flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'transparent'}}>
                        <LayoutMenu />
                    </div>
                </div>
            </div>
        </Sider>
    );
};

export default LayoutSidebar;
