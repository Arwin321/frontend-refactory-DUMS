import React, { useState, useEffect } from 'react';
import { Layout, theme, Grid } from 'antd';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';
import LayoutSidebar from './LayoutSidebar';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = ({ children }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const screens = useBreakpoint();
    const isDesktop = screens.lg;

    return (
        <Layout style={{ height: '100vh' }}>
            <LayoutSidebar />
            <Layout
                style={{
                    marginLeft: isDesktop ? '250px' : '0',
                    overflow: 'auto',
                }}
            >
                <LayoutHeader />
                <Content
                    style={{
                        margin: '0 10px',
                        flex: '1 0 auto',
                        padding: '8px 8px',
                    }}
                >
                    {/* <div
            style={{
              padding: 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          > */}
                    {children}
                    {/* </div> */}
                </Content>
                {/* <LayoutFooter /> */}
            </Layout>
        </Layout>
    );
};
export default MainLayout;
