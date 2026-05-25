import React, { useState, useEffect } from 'react';
import {
    Modal,
    Input,
    Select,
    Divider,
    Typography,
    Button,
    ConfigProvider,
    Upload,
    Row,
    Col,
    Image,
} from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { createSparepart, updateSparepart } from '../../../../api/sparepart';
import { uploadFile } from '../../../../api/file-uploads';
import { validateRun } from '../../../../Utils/validate';

const { Text } = Typography;
const { TextArea } = Input;

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const DetailSparepart = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const defaultData = {
        sparepart_id: '',
        sparepart_name: '',
        sparepart_description: '',
        sparepart_model: '',
        sparepart_item_type: null,
        sparepart_qty: 0,
        sparepart_unit: '',
        sparepart_merk: '',
        sparepart_stok: 'Not Available',
        sparepart_foto: '',
    };

    const [formData, setFormData] = useState(defaultData);

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
        setFileList([]);
    };

    const handlePreviewCancel = () => setPreviewOpen(false);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const handleRemove = () => {
        setFileList([]);
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        const validationRules = [
            { field: 'sparepart_name', label: 'Sparepart Name', required: true },
        ];

        if (
            validateRun(formData, validationRules, (errorMessages) => {
                NotifOk({ icon: 'warning', title: 'Peringatan', message: errorMessages });
                setConfirmLoading(false);
            })
        )
            return;

        try {
            let imageUrl = formData.sparepart_foto;
            const newFile = fileList.length > 0 ? fileList[0] : null;

            if (newFile && newFile.originFileObj) {
                // console.log('Uploading file:', newFile.originFileObj);
                const uploadResponse = await uploadFile(newFile.originFileObj, 'images');

                // Log untuk debugging
                // console.log('Upload response:', uploadResponse);

                // Cek berbagai kemungkinan struktur respons dari API
                let uploadedUrl = null;

                // Cek berbagai kemungkinan struktur respons dari API
                // Cek langsung properti file_url atau url
                if (uploadResponse && typeof uploadResponse === 'object') {
                    // Cek jika uploadResponse langsung memiliki file_url
                    if (uploadResponse.file_url) {
                        uploadedUrl = uploadResponse.file_url;
                    }
                    // Cek jika uploadResponse memiliki data yang berisi file_url
                    else if (uploadResponse.data && uploadResponse.data.file_url) {
                        uploadedUrl = uploadResponse.data.file_url;
                    }
                    // Cek jika uploadResponse memiliki data yang berisi url
                    else if (uploadResponse.data && uploadResponse.data.url) {
                        uploadedUrl = uploadResponse.data.url;
                    }
                    // Cek jika uploadResponse langsung memiliki url
                    else if (uploadResponse.url) {
                        uploadedUrl = uploadResponse.url;
                    }
                    // Cek jika uploadResponse.data adalah string URL
                    else if (uploadResponse.data && typeof uploadResponse.data === 'string') {
                        uploadedUrl = uploadResponse.data;
                    }
                    // Cek jika uploadResponse.data adalah objek yang berisi file URL dalam format berbeda
                    else if (uploadResponse.data && typeof uploadResponse.data === 'object') {
                        // Cek kemungkinan nama field lain
                        if (uploadResponse.data.file) {
                            uploadedUrl = uploadResponse.data.file;
                        } else if (uploadResponse.data.filename) {
                            // Jika hanya nama file dikembalikan, bangun URL
                            const baseUrl = import.meta.env.VITE_API_SERVER || '';
                            uploadedUrl = `${baseUrl}/uploads/images/${uploadResponse.data.filename}`;
                        } else if (uploadResponse.data.path) {
                            uploadedUrl = uploadResponse.data.path;
                        } else if (uploadResponse.data.location) {
                            uploadedUrl = uploadResponse.data.location;
                        }
                        // Tambahkan kemungkinan lain berdasarkan struktur respons umum
                        else if (uploadResponse.data.filePath) {
                            uploadedUrl = uploadResponse.data.filePath;
                        } else if (uploadResponse.data.file_path) {
                            uploadedUrl = uploadResponse.data.file_path;
                        } else if (uploadResponse.data.publicUrl) {
                            uploadedUrl = uploadResponse.data.publicUrl;
                        } else if (uploadResponse.data.public_url) {
                            uploadedUrl = uploadResponse.data.public_url;
                        }
                        // Berdasarkan log yang ditampilkan, API mengembalikan path_document atau path_solution
                        else if (uploadResponse.data.path_document) {
                            uploadedUrl = uploadResponse.data.path_document;
                        } else if (uploadResponse.data.path_solution) {
                            uploadedUrl = uploadResponse.data.path_solution;
                        } else if (uploadResponse.data.file_upload_name) {
                            // Jika hanya nama file dikembalikan, bangun URL
                            const baseUrl = import.meta.env.VITE_API_SERVER || '';
                            uploadedUrl = `${baseUrl}/uploads/images/${uploadResponse.data.file_upload_name}`;
                        }
                    }
                }
                // Jika respons adalah string, mungkin itu adalah URL
                else if (uploadResponse && typeof uploadResponse === 'string') {
                    uploadedUrl = uploadResponse;
                }

                if (uploadedUrl) {
                    // console.log('Successfully extracted image URL:', uploadedUrl);
                    imageUrl = uploadedUrl;
                } else {
                    console.error('Upload response structure:', uploadResponse);
                    console.error('Available properties:', Object.keys(uploadResponse || {}));
                    console.error('Response type:', typeof uploadResponse);
                    console.error(
                        'Is response an object?',
                        uploadResponse && typeof uploadResponse === 'object'
                    );
                    if (uploadResponse && typeof uploadResponse === 'object') {
                        console.error('Response keys:', Object.keys(uploadResponse));
                        console.error(
                            'Response data keys:',
                            uploadResponse.data
                                ? Object.keys(uploadResponse.data)
                                : 'No data property'
                        );
                    }

                    // Tampilkan notifikasi bahwa upload gagal tapi lanjutkan penyimpanan
                    NotifOk({
                        icon: 'warning',
                        title: 'Peringatan',
                        message: 'Upload gambar gagal. Data akan disimpan tanpa gambar.',
                    });

                    // Gunakan URL gambar yang sebelumnya jika ada, atau kosongkan
                    imageUrl = formData.sparepart_foto || '';
                }
            } else if (fileList.length === 0) {
                // Jika tidak ada file di fileList (termasuk saat user menghapus file), gunakan gambar default
                imageUrl = '/assets/defaultSparepartImg.jpg';
            }

            // Payload hanya berisi field yang tidak kosong untuk menghindari error validasi
            const payload = {
                sparepart_name: formData.sparepart_name, // Wajib
            };

            payload.sparepart_description =
                formData.sparepart_description && formData.sparepart_description.trim() !== ''
                    ? formData.sparepart_description
                    : ' ';
            if (formData.sparepart_model && formData.sparepart_model.trim() !== '') {
                payload.sparepart_model = formData.sparepart_model;
            }
            if (formData.sparepart_item_type && formData.sparepart_item_type.trim() !== '') {
                payload.sparepart_item_type = formData.sparepart_item_type;
            }
            if (formData.sparepart_unit && formData.sparepart_unit.trim() !== '') {
                payload.sparepart_unit = formData.sparepart_unit;
            }
            if (formData.sparepart_merk && formData.sparepart_merk.trim() !== '') {
                payload.sparepart_merk = formData.sparepart_merk;
            }
            // sparepart_qty disimpan sebagai angka kuantitas
            const qty = parseInt(formData.sparepart_qty) || 0;
            payload.sparepart_qty = qty;

            // sparepart_stok ditentukan otomatis berdasarkan qty sebenarnya
            payload.sparepart_stok = qty > 0 ? 'Available' : 'Not Available';
            // Sertakan sparepart_foto hanya jika nilainya tidak kosong, agar tidak memicu validasi
            if (imageUrl && imageUrl.trim() !== '') {
                payload.sparepart_foto = imageUrl;
            }

            // console.log('Sending payload:', payload);

            const response = formData.sparepart_id
                ? await updateSparepart(formData.sparepart_id, payload)
                : await createSparepart(payload);

            // console.log('API response:', response);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Sparepart berhasil ${
                        formData.sparepart_id ? 'diubah' : 'ditambahkan'
                    }.`,
                });
                props.setActionMode('list');
                setFileList([]);
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat menyimpan data.',
                });
            }
        } catch (error) {
            console.error('Save Sparepart Error:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Terjadi kesalahan pada server. Coba lagi nanti.',
            });
        }

        setConfirmLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        if (props.selectedData) {
            setFormData(props.selectedData);
            if (props.selectedData.sparepart_foto) {
                let displayUrl = props.selectedData.sparepart_foto;

                // Jika URL bukan full URL (tidak mengandung http/https), bangun URL lokal
                if (!props.selectedData.sparepart_foto.startsWith('http')) {
                    const fileName = props.selectedData.sparepart_foto.split('/').pop();

                    // Cek apakah ini file default
                    if (fileName === 'defaultSparepartImg.jpg') {
                        displayUrl = '/assets/defaultSparepartImg.jpg';
                    } else {
                        // Gunakan format file URL seperti di brandDevice
                        const token = localStorage.getItem('token');
                        const baseURL = import.meta.env.VITE_API_SERVER || '';
                        displayUrl = `${baseURL}/file-uploads/images/${encodeURIComponent(
                            fileName
                        )}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                    }
                }

                const fileName = props.selectedData.sparepart_foto.split('/').pop();

                setFileList([
                    {
                        uid: '-1',
                        name: fileName,
                        status: 'done',
                        url: displayUrl,
                    },
                ]);
            } else {
                setFileList([]);
            }
        } else {
            setFormData(defaultData);
            setFileList([]);
        }
    }, [props.showModal, props.selectedData, props.actionMode]);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Modal
            title={`${
                props.actionMode === 'add'
                    ? 'Tambah'
                    : props.actionMode === 'preview'
                    ? 'Preview'
                    : 'Edit'
            } Sparepart`}
            open={props.showModal}
            onCancel={handleCancel}
            footer={[
                <React.Fragment key="modal-footer">
                    <ConfigProvider
                        theme={{
                            token: { colorBgContainer: '#E9F6EF' },
                            components: {
                                Button: {
                                    defaultBg: 'white',
                                    defaultColor: '#23A55A',
                                    defaultBorderColor: '#23A55A',
                                    defaultHoverColor: '#23A55A',
                                    defaultHoverBorderColor: '#23A55A',
                                },
                            },
                        }}
                    >
                        <Button onClick={handleCancel}>Batal</Button>
                    </ConfigProvider>
                    <ConfigProvider
                        theme={{
                            token: { colorBgContainer: '#209652' },
                            components: {
                                Button: {
                                    defaultBg: '#23a55a',
                                    defaultColor: '#FFFFFF',
                                    defaultBorderColor: '#23a55a',
                                    defaultHoverColor: '#FFFFFF',
                                    defaultHoverBorderColor: '#23a55a',
                                },
                            },
                        }}
                    >
                        {!props.readOnly && (
                            <Button loading={confirmLoading} onClick={handleSave}>
                                Simpan
                            </Button>
                        )}
                    </ConfigProvider>
                </React.Fragment>,
            ]}
        >
            {formData && (
                <div>
                    <Row gutter={[16, 16]}>
                        {/* Kolom untuk foto */}
                        <Col span={10} style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong>Foto</Text>
                            <div
                                style={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                }}
                            >
                                {fileList.length > 0 ? (
                                    <div
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        style={{
                                            position: 'relative',
                                            width: '180px', // Fixed width for square
                                            height: '180px', // Fixed height
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Image
                                            src={fileList[0].url || fileList[0].thumbUrl}
                                            alt="preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                            }}
                                            preview={false} // Disable default preview
                                        />
                                        {isHovering && !props.readOnly && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    color: 'white',
                                                    gap: '16px',
                                                    fontSize: '20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <EyeOutlined
                                                    onClick={() => handlePreview(fileList[0])}
                                                />
                                                <DeleteOutlined onClick={handleRemove} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Upload
                                        name="file"
                                        multiple={false}
                                        fileList={fileList}
                                        onChange={handleChange}
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        disabled={props.readOnly}
                                        showUploadList={false}
                                    >
                                        <div
                                            style={{
                                                width: '180px', // Fixed width for square
                                                height: '180px',
                                                border: '1px dashed #d9d9d9',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                gap: '8px',
                                            }}
                                        >
                                            <PlusOutlined />
                                            <div>Upload</div>
                                        </div>
                                    </Upload>
                                )}
                            </div>
                        </Col>

                        {/* Kolom untuk field lainnya */}
                        <Col span={14}>
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Text strong>Sparepart Name</Text>
                                    <Text style={{ color: 'red' }}> *</Text>
                                    <Input
                                        name="sparepart_name"
                                        value={formData.sparepart_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter Sparepart Name"
                                        readOnly={props.readOnly}
                                    />
                                </Col>
                                <Col span={24}>
                                    <Text strong>Item Type</Text>
                                    <Select
                                        name="sparepart_item_type"
                                        value={formData.sparepart_item_type}
                                        onChange={(value) =>
                                            handleSelectChange('sparepart_item_type', value)
                                        }
                                        placeholder="Enter Item Type"
                                        disabled={props.readOnly}
                                        style={{ width: '100%' }}
                                    >
                                        <Select.Option value="Air Dryer">Air Dryer</Select.Option>
                                        <Select.Option value="Compressor">Compressor</Select.Option>
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Qty</Text>
                                    <Input
                                        name="sparepart_qty"
                                        value={formData.sparepart_qty}
                                        onChange={handleInputChange}
                                        placeholder="Enter quantity"
                                        readOnly={props.readOnly}
                                        type="number"
                                        min="0"
                                    />
                                </Col>
                                <Col span={12}>
                                    <Text strong>Unit</Text>
                                    <Input
                                        name="sparepart_unit"
                                        value={formData.sparepart_unit}
                                        onChange={handleInputChange}
                                        placeholder="e.g., pcs"
                                        readOnly={props.readOnly}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                            <Text strong>Brand</Text>
                            <Input
                                name="sparepart_merk"
                                value={formData.sparepart_merk}
                                onChange={handleInputChange}
                                placeholder="Enter Brand (Optional)"
                                readOnly={props.readOnly}
                            />
                        </Col>
                        <Col span={12}>
                            <Text strong>Model</Text>
                            <Input
                                name="sparepart_model"
                                value={formData.sparepart_model}
                                onChange={handleInputChange}
                                placeholder="Enter Model (Optional)"
                                readOnly={props.readOnly}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Text strong>Description</Text>
                            <TextArea
                                name="sparepart_description"
                                value={formData.sparepart_description}
                                onChange={handleInputChange}
                                placeholder="Enter Description (Optional)"
                                readOnly={props.readOnly}
                                rows={3}
                            />
                        </Col>
                    </Row>
                </div>
            )}
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handlePreviewCancel}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Modal>
    );
};

export default DetailSparepart;
