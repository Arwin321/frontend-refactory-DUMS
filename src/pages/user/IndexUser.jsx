import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListUser from './component/ListUser';
import DetailUser from './component/DetailUser';
import ChangePasswordModal from './component/ChangePasswordModal';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexUser = memo(function IndexUser() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowmodal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

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
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            • User
                        </Text>
                    ),
                },
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListUser
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                setShowChangePasswordModal={setShowChangePasswordModal}
                setSelectedUserForPassword={setSelectedUserForPassword}
            />
            <DetailUser
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                showModal={showModal}
                actionMode={actionMode}
            />
            <ChangePasswordModal
                showModal={showChangePasswordModal}
                setShowModal={setShowChangePasswordModal}
                selectedUser={selectedUserForPassword}
                setSelectedUser={setSelectedUserForPassword}
            />
        </React.Fragment>
    );
});

export default IndexUser;
