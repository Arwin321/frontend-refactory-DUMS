import { SendRequest } from '../components/Global/ApiRequest';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_SERVER;

// Get file from uploads directory
const getFile = async (folder, filename) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await axios.get(`${API_BASE_URL}/file-uploads/${folder}/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${token.replace(/"/g, '')}`
    }
  });

  return response.data;
};

// Download file as blob with proper handling
const downloadFile = async (folder, filename) => {
  try {
    const response = await getFile(folder, filename);

    const blob = new Blob([response], {
      type: 'application/octet-stream'
    });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Get file info (metadata)
const getFileInfo = async (folder, filename) => {
  const response = await SendRequest({
    method: 'head',
    prefix: `file-uploads/${folder}/${encodeURIComponent(filename)}`
  });

  if (response.error) {
    throw new Error(response.message);
  }

  return {
    contentType: response.headers?.['content-type'],
    contentLength: response.headers?.['content-length'],
    lastModified: response.headers?.['last-modified'],
    filename: filename,
    folder: folder
  };
};

// Get file URL for iframe
const getFileUrl = (folder, filename) => {
  const token = localStorage.getItem('token');
  if (token) {
    return `${API_BASE_URL}/file-uploads/${folder}/${encodeURIComponent(filename)}?token=${encodeURIComponent(token)}`;
  }
  return `${API_BASE_URL}/file-uploads/${folder}/${encodeURIComponent(filename)}`;
};

// Check if file exists
const checkFileExists = async (folder, filename) => {
  const response = await SendRequest({
    method: 'head',
    prefix: `file-uploads/${folder}/${encodeURIComponent(filename)}`
  });

  if (response.error && response.statusCode === 404) {
    return false;
  } else if (response.error) {
    throw new Error(response.message);
  }

  return true;
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const pdfExtensions = ['pdf'];

  if (imageExtensions.includes(ext)) {
    return 'image';
  } else if (pdfExtensions.includes(ext)) {
    return 'pdf';
  }
  return 'unknown';
};

// Upload file to server
const uploadFile = async (file, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await SendRequest({
    method: 'post',
    prefix: 'file-uploads',
    params: formData
  });

  return response.data;
};

const getFolderFromFileType = (fileType) => {
  return fileType === 'pdf' ? 'pdf' : 'images';
};

export {
  getFile,
  downloadFile,
  getFileInfo,
  getFileUrl,
  checkFileExists,
  getFileType,
  getFolderFromFileType,
  uploadFile
};