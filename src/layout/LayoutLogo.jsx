import { Image } from 'antd';
import logoPiu from '../assets/freepik/LOGOPIU.png';
import React from 'react';

const LayoutLogo = () => {
    return (
        <div
            style={{
                margin: '1rem auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: '1rem',
            }}
        >
            <div
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255,255,255,0.95), rgba(220,220,220,0.5))',
                    borderRadius: '50%',
                    width: 160,
                    height: 160,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Ring sebelum logo utama */}
                <div
                    style={{
                        border: '5px solid #ffffffff',
                        borderRadius: '50%',
                        width: 160,
                        height: 160,
                        position: 'absolute',
                        zIndex: 1,
                    }}
                />

                <div
                    style={{
                        borderRadius: '10px',
                        padding: '4px',
                        mixBlendMode: 'normal',
                        opacity: 1,
                        zIndex: 2,
                    }}
                >
                    <Image
                        src={logoPiu}
                        alt="logo"
                        width={140}
                        height={100}
                        preview={false}
                        style={{
                            filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.2))',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LayoutLogo;
