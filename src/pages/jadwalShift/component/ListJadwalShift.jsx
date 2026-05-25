import React, { memo, useState, useEffect } from 'react';
import {
    Space,
    ConfigProvider,
    Button,
    Row,
    Col,
    Card,
    Input,
    Typography,
    Divider,
    Checkbox,
    Select,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import { getAllJadwalShift, deleteJadwalShift, updateJadwalShift } from '../../../api/jadwal-shift';
import { getAllShift } from '../../../api/master-shift';

const { Title, Text } = Typography;

const ListJadwalShift = memo(function ListJadwalShift(props) {
    const [trigerFilter, setTrigerFilter] = useState(false);
    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [groupedSchedules, setGroupedSchedules] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [editingShift, setEditingShift] = useState(null);
    const [pendingChanges, setPendingChanges] = useState({});
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const navigate = useNavigate();

    const formatRelativeTimestamp = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        let dayString;
        if (date >= startOfToday) {
            dayString = 'Hari ini';
        } else if (date >= startOfYesterday) {
            dayString = 'Kemarin';
        } else {
            dayString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
        }

        const timeString = date
            .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
            .replace('.', ':');
        return `${dayString}, ${timeString}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const paging = {
                page: 1,
                limit: 1000,
            };

            const params = new URLSearchParams({ ...paging, ...formDataFilter });

            // Fetch both schedules and shifts data
            const [schedulesResponse, shiftsResponse] = await Promise.all([
                getAllJadwalShift(params),
                getAllShift(params),
            ]);

            // Handle nested data structure from backend
            const rawData = schedulesResponse?.data || schedulesResponse || [];
            const shifts = shiftsResponse?.data || shiftsResponse || [];

            setShiftOptions(shifts);

            // Parse backend response structure: [{ shift: { shift_id, shift_name, users: [...] } }]
            const grouped = {};
            const allUsers = [];

            rawData.forEach((item) => {
                if (item.shift && item.shift.shift_name) {
                    const shift = item.shift;
                    const shiftName = shift.shift_name.toUpperCase().trim();

                    // Initialize shift group
                    if (!grouped[shiftName]) {
                        grouped[shiftName] = {
                            shift_id: shift.shift_id,
                            users: [],
                            lastUpdate: { user: 'N/A', timestamp: '1970-01-01T00:00:00Z' },
                        };
                    }

                    // Process users in this shift
                    if (shift.users && Array.isArray(shift.users)) {
                        shift.users.forEach((user) => {
                            const normalizedUser = {
                                id: user.user_schedule_id,
                                user_schedule_id: user.user_schedule_id,
                                user_id: user.user_id,
                                shift_id: shift.shift_id,
                                shift_name: shift.shift_name,
                                nama_employee: user.user_fullname || user.user_name || 'Unknown',
                                whatsapp: user.user_phone || '-',
                                user_fullname: user.user_fullname,
                                user_name: user.user_name,
                                user_phone: user.user_phone,
                                updated_at: user.updated_at,
                                created_at: user.created_at,
                                updated_by: user.updated_by,
                            };

                            grouped[shiftName].users.push(normalizedUser);
                            allUsers.push(normalizedUser);

                            // Update last update timestamp
                            const currentUpdate = new Date(
                                user.updated_at || user.created_at || new Date()
                            );
                            const lastUpdate = new Date(grouped[shiftName].lastUpdate.timestamp);
                            if (currentUpdate > lastUpdate) {
                                grouped[shiftName].lastUpdate = {
                                    user: user.updated_by || 'N/A',
                                    timestamp: currentUpdate.toISOString(),
                                };
                            }
                        });
                    }
                }
            });

            setEmployeeOptions(allUsers);

            // Add empty shifts that don't have users yet
            shifts.forEach((shift) => {
                const shiftName = shift.shift_name.toUpperCase().trim();
                if (!grouped[shiftName]) {
                    grouped[shiftName] = {
                        shift_id: shift.shift_id,
                        users: [],
                        lastUpdate: { user: 'N/A', timestamp: new Date().toISOString() },
                    };
                }
            });

            setGroupedSchedules(grouped);
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Gagal Memuat Data',
                message: 'Terjadi kesalahan saat memuat data jadwal shift.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            if (props.actionMode === 'list') {
                setFormDataFilter(defaultFilter);
                doFilter();
            }
        } else {
            navigate('/signin');
        }
    }, [props.actionMode]);

    useEffect(() => {
        if (props.actionMode === 'list') {
            fetchData();
        }
    }, [trigerFilter]);

    const doFilter = () => {
        setTrigerFilter((prev) => !prev);
    };

    const handleSearch = () => {
        setFormDataFilter({ criteria: searchValue });
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchValue('');
        setFormDataFilter({ criteria: '' });
        setTrigerFilter((prev) => !prev);
    };

    const showPreviewModal = (param) => {
        props.setSelectedData(param);
        props.setActionMode('preview');
    };

    const showEditModal = (param = null) => {
        props.setSelectedData(param);
        props.setActionMode('edit');
    };

    const showAddModal = (param = null) => {
        props.setSelectedData(param);
        props.setActionMode('add');
    };

    const showDeleteDialog = (param) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi Hapus',
            message: `Jadwal untuk karyawan "${param.nama_employee}" akan dihapus?`,
            onConfirm: () => handleDelete(param.id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (id) => {
        const response = await deleteJadwalShift(id);
        if (response.statusCode === 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'Jadwal berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: response?.message || 'Gagal menghapus jadwal.',
            });
        }
    };

    const handleShiftEditMode = (shiftName) => {
        setEditingShift(shiftName);
        setPendingChanges({}); // Clear pending changes
        setSelectedSchedules([]); // Clear selections when entering a new edit mode
    };

    const cancelShiftEditMode = () => {
        setEditingShift(null);
        setPendingChanges({});
        setSelectedSchedules([]);
    };

    const handleSelectSchedule = (id, isChecked) => {
        if (isChecked) {
            setSelectedSchedules((prev) => [...prev, id]);
        } else {
            setSelectedSchedules((prev) => prev.filter((scheduleId) => scheduleId !== id));
        }
    };

    const handleBulkUpdateChange = (scheduleId, field, value) => {
        setPendingChanges((prev) => ({
            ...prev,
            [scheduleId]: {
                ...prev[scheduleId],
                [field]: value,
            },
        }));
    };

    const handleBulkSave = async () => {
        if (Object.keys(pendingChanges).length === 0) {
            NotifAlert({
                icon: 'info',
                title: 'Tidak Ada Perubahan',
                message: 'Tidak ada perubahan untuk disimpan.',
            });
            cancelShiftEditMode();
            return;
        }

        const updatePromises = Object.keys(pendingChanges).map((id) => {
            const originalSchedule = groupedSchedules[editingShift].users.find(
                (u) => u.id.toString() === id
            );
            const changes = pendingChanges[id];

            // Build payload according to backend schema
            const payload = {
                user_id: changes.user_id || originalSchedule.user_id,
                shift_id: changes.shift_id || originalSchedule.shift_id,
            };

            if (originalSchedule.schedule_id) {
                payload.schedule_id = originalSchedule.schedule_id;
            }

            return updateJadwalShift(id, payload);
        });

        try {
            await Promise.all(updatePromises);
            NotifOk({
                icon: 'success',
                title: 'Berhasil',
                message: 'Semua perubahan berhasil disimpan.',
            });
            doFilter();
            cancelShiftEditMode();
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: 'Gagal menyimpan beberapa perubahan.',
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedSchedules.length === 0) {
            NotifAlert({
                icon: 'warning',
                title: 'Perhatian',
                message: 'Pilih setidaknya satu jadwal untuk dihapus.',
            });
            return;
        }
        NotifConfirmDialog({
            icon: 'question',
            title: `Konfirmasi Hapus`,
            message: `Anda yakin ingin menghapus ${selectedSchedules.length} jadwal yang dipilih?`,
            onConfirm: async () => {
                await Promise.all(selectedSchedules.map((id) => deleteJadwalShift(id)));
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `${selectedSchedules.length} jadwal berhasil dihapus.`,
                });
                doFilter();
                setEditingShift(null);
                setSelectedSchedules([]);
            },
        });
    };

    return (
        <React.Fragment>
            <Card>
                <Title level={3}>Jadwal Shift</Title>
                <Divider />

                {/* <Row>
                    <Col xs={24}>
                        <Row justify="end" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={12} lg={12}>
                                <Input.Search
                                    placeholder="Cari berdasarkan nama..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        if (value === '') {
                                            handleSearchClear();
                                        }
                                    }}
                                    onSearch={handleSearch}
                                    allowClear
                                    enterButton={
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            style={{
                                                backgroundColor: '#23A55A',
                                                borderColor: '#23A55A',
                                            }}
                                        />
                                    }
                                    size="large"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row> */}

                <div style={{ marginTop: '24px' }}>
                    {loading ? (
                        <Text>Memuat data...</Text>
                    ) : Object.keys(groupedSchedules).length === 0 ? (
                        <Text>Tidak ada data jadwal untuk ditampilkan.</Text>
                    ) : (
                        ['SHIFT PAGI', 'SHIFT SORE', 'SHIFT MALAM']
                            .filter((shiftName) => groupedSchedules[shiftName])
                            .map((shiftName) => (
                                <div key={shiftName} style={{ marginBottom: '32px' }}>
                                    {' '}
                                    {/* Container for each shift section */}
                                    <Row
                                        justify="space-between"
                                        align="middle"
                                        style={{
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid #f0f0f0',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        <Col>
                                            <Title level={5} style={{ margin: 0 }}>
                                                {shiftName} (
                                                {groupedSchedules[shiftName].users.length} Karyawan)
                                            </Title>
                                        </Col>
                                        {editingShift === shiftName ? (
                                            <Col>
                                                <Space wrap>
                                                    <Button
                                                        key="cancel"
                                                        onClick={cancelShiftEditMode}
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        key="delete"
                                                        type="primary"
                                                        danger
                                                        onClick={handleBulkDelete}
                                                        disabled={selectedSchedules.length === 0}
                                                    >
                                                        Hapus Dipilih ({selectedSchedules.length})
                                                    </Button>
                                                    <Button
                                                        key="save"
                                                        type="primary"
                                                        onClick={handleBulkSave}
                                                        style={{
                                                            backgroundColor: '#23A55A',
                                                            borderColor: '#23A55A',
                                                        }}
                                                    >
                                                        Simpan Perubahan
                                                    </Button>
                                                </Space>
                                            </Col>
                                        ) : (
                                            <Col>
                                                <Space wrap>
                                                    <Button
                                                        key="add"
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => showAddModal()}
                                                        style={{
                                                            backgroundColor: '#23A55A',
                                                            borderColor: '#23A55A',
                                                        }}
                                                        disabled={editingShift !== null}
                                                    >
                                                        Tambah Jadwal Shift
                                                    </Button>
                                                    <ConfigProvider
                                                        key="edit-config"
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
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleShiftEditMode(shiftName)}
                                                            disabled={editingShift !== null}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </ConfigProvider>
                                                </Space>
                                            </Col>
                                        )}
                                    </Row>
                                    {/* Horizontal scrollable container for employee cards */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            overflowX: 'auto',
                                            gap: '16px',
                                            paddingTop: '8px',
                                            paddingBottom: '10px',
                                            minWidth: `${4 * (320 + 16)}px`,
                                        }}
                                    >
                                        {groupedSchedules[shiftName].users.length > 0 ? (
                                            groupedSchedules[shiftName].users.map((user) => (
                                                <Card
                                                    key={user.id}
                                                    hoverable
                                                    style={{
                                                        width: 320,
                                                        height: 240,
                                                        flexShrink: 0,
                                                        textAlign: 'left',
                                                        border: '1px solid #42AAFF',
                                                        opacity:
                                                            editingShift !== null &&
                                                            editingShift !== shiftName
                                                                ? 0.5
                                                                : 1,
                                                        pointerEvents:
                                                            editingShift !== null &&
                                                            editingShift !== shiftName
                                                                ? 'none'
                                                                : 'auto',
                                                    }}
                                                    styles={{
                                                        body: { padding: '16px', height: '100%' },
                                                    }}
                                                >
                                                    {editingShift === shiftName ? (
                                                        // EDIT MODE VIEW
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                height: '100%',
                                                                gap: '12px',
                                                                padding: '16px 4px',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    paddingTop: '8px',
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedSchedules.includes(
                                                                        user.id
                                                                    )}
                                                                    onChange={(e) =>
                                                                        handleSelectSchedule(
                                                                            user.id,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    style={{
                                                                        transform: 'scale(1.4)',
                                                                    }}
                                                                />
                                                            </div>
                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'center',
                                                                    gap: '14px',
                                                                    paddingRight: '4px',
                                                                }}
                                                            >
                                                                <div>
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            color: '#8c8c8c',
                                                                            display: 'block',
                                                                            marginBottom: '6px',
                                                                        }}
                                                                    >
                                                                        KARYAWAN
                                                                    </Text>
                                                                    <Select
                                                                        showSearch
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Pilih Karyawan"
                                                                        optionFilterProp="children"
                                                                        defaultValue={user.user_id}
                                                                        onChange={(value) =>
                                                                            handleBulkUpdateChange(
                                                                                user.id,
                                                                                'user_id',
                                                                                value
                                                                            )
                                                                        }
                                                                        size="large"
                                                                    >
                                                                        {employeeOptions.map(
                                                                            (emp) => (
                                                                                <Select.Option
                                                                                    key={
                                                                                        emp.user_id ||
                                                                                        emp.id
                                                                                    }
                                                                                    value={
                                                                                        emp.user_id ||
                                                                                        emp.id
                                                                                    }
                                                                                >
                                                                                    {emp.user_fullname ||
                                                                                        emp.user_name ||
                                                                                        emp.nama_employee}
                                                                                </Select.Option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            color: '#8c8c8c',
                                                                            display: 'block',
                                                                            marginBottom: '6px',
                                                                        }}
                                                                    >
                                                                        NO. TELEPON
                                                                    </Text>
                                                                    <Input
                                                                        value={
                                                                            pendingChanges[user.id]
                                                                                ?.user_id
                                                                                ? employeeOptions.find(
                                                                                      (emp) =>
                                                                                          emp.user_id ===
                                                                                          pendingChanges[
                                                                                              user
                                                                                                  .id
                                                                                          ]?.user_id
                                                                                  )?.user_phone ||
                                                                                  user.whatsapp
                                                                                : user.whatsapp
                                                                        }
                                                                        readOnly
                                                                        style={{
                                                                            backgroundColor:
                                                                                '#f5f5f5',
                                                                            color: '#595959',
                                                                            cursor: 'not-allowed',
                                                                        }}
                                                                        size="large"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            color: '#8c8c8c',
                                                                            display: 'block',
                                                                            marginBottom: '6px',
                                                                        }}
                                                                    >
                                                                        SHIFT
                                                                    </Text>
                                                                    <Select
                                                                        showSearch
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Pilih Shift"
                                                                        optionFilterProp="children"
                                                                        defaultValue={user.shift_id}
                                                                        onChange={(value) =>
                                                                            handleBulkUpdateChange(
                                                                                user.id,
                                                                                'shift_id',
                                                                                value
                                                                            )
                                                                        }
                                                                        size="large"
                                                                    >
                                                                        {shiftOptions.map(
                                                                            (shift) => (
                                                                                <Select.Option
                                                                                    key={
                                                                                        shift.shift_id
                                                                                    }
                                                                                    value={
                                                                                        shift.shift_id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        shift.shift_name
                                                                                    }
                                                                                </Select.Option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // NORMAL VIEW
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'space-between',
                                                                height: '100%',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    backgroundColor: '#42AAFF',
                                                                    color: '#FFFFFF',
                                                                    padding: '9px 12px',
                                                                    borderRadius: '15px',
                                                                    marginBottom: '8px',
                                                                }}
                                                            >
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        fontSize: '18px',
                                                                        color: '#FFFFFF',
                                                                        display: 'block',
                                                                        marginBottom: '4px',
                                                                    }}
                                                                >
                                                                    {user.nama_employee}
                                                                </Text>
                                                                <Text
                                                                    style={{
                                                                        fontSize: '14px',
                                                                        color: '#FFFFFF',
                                                                    }}
                                                                >
                                                                    {user.whatsapp}
                                                                </Text>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'flex-end',
                                                                }}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        fontSize: '12px',
                                                                        display: 'block',
                                                                        lineHeight: '1.4',
                                                                    }}
                                                                >
                                                                    <Text strong>
                                                                        Terakhir diperbarui
                                                                    </Text>{' '}
                                                                    <br />
                                                                    {formatRelativeTimestamp(
                                                                        user.updated_at ||
                                                                            user.created_at ||
                                                                            new Date()
                                                                    )}{' '}
                                                                    <br />
                                                                    oleh {user.updated_by || 'N/A'}
                                                                </Text>
                                                                <Space>
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<EyeOutlined />}
                                                                        onClick={() =>
                                                                            showPreviewModal(user)
                                                                        }
                                                                        style={{
                                                                            color: '#1890ff',
                                                                            borderColor: '#1890ff',
                                                                        }}
                                                                        title="View"
                                                                    />
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() =>
                                                                            showEditModal(user)
                                                                        }
                                                                        style={{
                                                                            color: '#faad14',
                                                                            borderColor: '#faad14',
                                                                        }}
                                                                        title="Edit"
                                                                    />
                                                                    <Button
                                                                        danger
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() =>
                                                                            showDeleteDialog(user)
                                                                        }
                                                                        style={{
                                                                            borderColor: '#ff4d4f',
                                                                        }}
                                                                        title="Delete"
                                                                    />
                                                                </Space>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Card>
                                            ))
                                        ) : (
                                            <Text type="secondary" style={{ marginLeft: '16px' }}>
                                                Tidak ada karyawan yang dijadwalkan untuk shift ini.
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </Card>
        </React.Fragment>
    );
});

export default ListJadwalShift;
