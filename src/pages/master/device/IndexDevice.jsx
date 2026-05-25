import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListDevice from './component/ListDevice';
import DetailDevice from './component/DetailDevice';
import GeneratePdf from './component/GeneratePdf';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexDevice = memo(function IndexDevice() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowmodal] = useState(false);

    const setMode = (param) => {
        setShowmodal(true);
        switch (param) {
            case 'add':
                setReadOnly(false);
                break;

            case 'edit':
                setReadOnly(false);
                break;

            case 'preview':
                setReadOnly(true);
                break;

            default:
                setShowmodal(false);
                break;
        }
        setActionMode(param);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Master</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Device</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListDevice
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailDevice
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                showModal={showModal}
                permitDefault={false}
                actionMode={actionMode}
            />
            {actionMode == 'generatepdf' && (
                <GeneratePdf
                    setActionMode={setMode}
                    selectedData={selectedData}
                    setSelectedData={setSelectedData}
                    readOnly={readOnly}
                    showPdf={true}
                    permitDefault={true}
                />
            )}
        </React.Fragment>
    );
});

export default IndexDevice;
