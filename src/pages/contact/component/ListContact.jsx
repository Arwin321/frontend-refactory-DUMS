import React, { memo, useState, useEffect } from 'react';
import { Button, Row, Col, Input, Tabs, Space, ConfigProvider, Card, Tag, Switch } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UserOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { NotifAlert, NotifConfirmDialog } from '../../../components/Global/ToastNotif';
import { getAllContact, deleteContact, updateContact } from '../../../api/contact';

const ContactCard = memo(function ContactCard({
    contact,
    showEditModal,
    showDeleteModal,
    onStatusToggle,
}) {
    const handleStatusToggle = async (checked) => {
        try {
            const updatedContact = {
                contact_name: contact.contact_name || contact.name,
                contact_phone: contact.contact_phone || contact.phone,
                is_active: checked,
                contact_type: contact.contact_type,
            };

            await updateContact(contact.contact_id || contact.id, updatedContact);

            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: `Status "${contact.contact_name || contact.name}" berhasil diperbarui.`,
            });

            // Refresh contacts list
            onStatusToggle && onStatusToggle();
        } catch (error) {
            console.error('Error updating contact status:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Gagal memperbarui status kontak',
            });
        }
    };

    return (
        <Col xs={24} sm={12} md={8} lg={6}>
            <div
                className="contact-card"
                style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    height: '100%',
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e8e8e8',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
            >
                <div
                    style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    {/* Type Badge - Top Left */}
                    {/* <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                        <Tag
                            color={
                                contact.contact_type === 'operator'
                                    ? 'blue'
                                    : contact.contact_type === 'gudang'
                                    ? 'orange'
                                    : 'default'
                            }
                            style={{ fontSize: '11px' }}
                        >
                            {contact.contact_type === 'operator' ? 'Operator' : contact.contact_type === 'gudang' ? 'Gudang' : 'Unknown'}
                        </Tag>
                    </div> */}

                    {/* Status Slider - Top Right */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            padding: '4px 8px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Switch
                                checked={contact.status === 'active'}
                                onChange={handleStatusToggle}
                                style={{
                                    backgroundColor:
                                        contact.status === 'active' ? '#52c41a' : '#d9d9d9',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: contact.status === 'active' ? '#52c41a' : '#ff4d4f',
                                    fontWeight: 500,
                                }}
                            >
                                {contact.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flex: 1,
                            paddingTop: '28px',
                        }}
                    >
                        <div
                            className="avatar"
                            style={{
                                width: 55,
                                height: 55,
                                borderRadius: '50%',
                                backgroundColor:
                                    contact.status === 'active' ? '#52c41a' : '#ff4d4f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <UserOutlined style={{ color: 'white', fontSize: '25px' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    marginBottom: '4px',
                                    color: '#262626',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {contact.contact_name || contact.name}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                }}
                            >
                                <PhoneOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                                <span
                                    style={{
                                        color: contact.status === 'active' ? '#262626' : '#262626',
                                    }}
                                >
                                    {contact.contact_phone || contact.phone}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit and Delete Buttons - Bottom Right */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            marginTop: '8px',
                        }}
                    >
                        <Space>
                            <Button
                                type="default"
                                size="small"
                                style={{
                                    backgroundColor: '#fff7e6',
                                    borderColor: '#faad14',
                                    color: '#faad14',
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    height: '24px',
                                }}
                                icon={
                                    <EditOutlined style={{ color: '#faad14', fontSize: '11px' }} />
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showEditModal(contact);
                                }}
                            >
                                Edit info
                            </Button>
                            <Button
                                type="default"
                                danger
                                size="small"
                                style={{
                                    backgroundColor: '#fff1f0',
                                    borderColor: 'red',
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    height: '24px',
                                }}
                                icon={<DeleteOutlined style={{ fontSize: '11px' }} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showDeleteModal(contact);
                                }}
                            >
                                Delete
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </Col>
    );
});

const ListContact = memo(function ListContact(props) {
    const [activeTab, setActiveTab] = useState('all');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Default filter object matching plantSection pattern
    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);

    // Fetch contacts from API
    const fetchContacts = async () => {
        setLoading(true);
        try {
            // Build search parameters matching database pattern
            const searchParams = { ...formDataFilter };

            // Add specific filters if not "all"
            if (activeTab !== 'all') {
                if (activeTab === 'operator') {
                    searchParams.code = 'operator';
                } else if (activeTab === 'gudang') {
                    searchParams.code = 'gudang';
                }
            }

            const queryParams = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            const response = await getAllContact(queryParams);
            setFilteredContacts(response.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Gagal memuat data kontak',
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch contacts on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }
        fetchContacts();
    }, []);

    // Refetch when filters change
    useEffect(() => {
        fetchContacts();
    }, [formDataFilter, activeTab]);

    // Listen for saved contact data
    useEffect(() => {
        if (props.lastSavedContact) {
            fetchContacts();
        }
    }, [props.lastSavedContact]);

    const getFilteredContacts = () => {
        return filteredContacts;
    };

    const showEditModal = (param) => {
        props.setSelectedData(param);
        props.setActionMode('edit');
    };

    const showAddModal = () => {
        props.setSelectedData(null);
        props.setActionMode('add');

        props.setContactType?.(activeTab);
    };

    const showDeleteModal = (contact) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi Hapus',
            message: `Kontak "${contact.contact_name || contact.name}" akan dihapus?`,
            onConfirm: () => handleDelete(contact),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (contact) => {
        try {
            await deleteContact(contact.contact_id || contact.id);
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: `Kontak "${contact.contact_name || contact.name}" berhasil dihapus.`,
            });
            // Refetch contacts after deletion
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Gagal menghapus kontak',
            });
        }
    };

    return (
        <React.Fragment>
            <Card>
                <Row>
                    <Col xs={24}>
                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={12} lg={12}>
                                <Input.Search
                                    placeholder="Search by name..."
                                    value={formDataFilter.criteria}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormDataFilter({ criteria: value });
                                        if (value === '') {
                                            setFormDataFilter(defaultFilter);
                                        }
                                    }}
                                    onSearch={(value) => setFormDataFilter({ criteria: value })}
                                    allowClear={{
                                        clearIcon: (
                                            <span onClick={() => setFormDataFilter(defaultFilter)}>
                                                ✕
                                            </span>
                                        ),
                                    }}
                                    enterButton={
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            style={{
                                                backgroundColor: '#23A55A',
                                                borderColor: '#23A55A',
                                            }}
                                        >
                                            Search
                                        </Button>
                                    }
                                    size="large"
                                />
                            </Col>
                            <Col>
                                <Space wrap size="small">
                                    <ConfigProvider
                                        theme={{
                                            components: {
                                                Button: {
                                                    defaultBg: 'white',
                                                    defaultColor: '#23A55A',
                                                    defaultBorderColor: '#23A55A',
                                                },
                                            },
                                        }}
                                    >
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => showAddModal()}
                                            size="large"
                                        >
                                            Add Contact
                                        </Button>
                                    </ConfigProvider>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} style={{ marginTop: '16px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            {/* Tabs  */}
                            {/* <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                size="large"
                                items={[
                                    {
                                        key: 'all',
                                        label: 'All',
                                    },
                                    {
                                        key: 'operator',
                                        label: 'Operator',
                                    },
                                    {
                                        key: 'gudang',
                                        label: 'Gudang',
                                    },
                                ]}
                            /> */}
                        </div>

                        {getFilteredContacts().length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span style={{ color: '#8c8c8c' }}>
                                    {loading ? 'Loading contacts...' : 'No contacts found'}
                                </span>
                            </div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {getFilteredContacts().map((contact) => (
                                    <ContactCard
                                        key={contact.contact_id || contact.id}
                                        contact={{
                                            ...contact,
                                            id: contact.contact_id || contact.id,
                                            name: contact.contact_name || contact.name,
                                            phone: contact.contact_phone || contact.phone,
                                            status: contact.is_active ? 'active' : 'inactive',
                                        }}
                                        showEditModal={showEditModal}
                                        showDeleteModal={showDeleteModal}
                                        onStatusToggle={fetchContacts}
                                    />
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ListContact;
