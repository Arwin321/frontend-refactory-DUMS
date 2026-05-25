const formatIDR = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatCurrencyUSD = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9.]/g, ''); // Hanya angka dan titik
    const parts = numericValue.split('.'); // Pisahkan bagian desimal
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Tambahkan koma
    return `${parts.join('.')}`; // Gabungkan kembali dengan simbol $
};

const formatCurrencyIDR = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const toApiNumberFormatter = (value) => {
    if (!value) return '';
    const formattedValue = value.replace(/[.,]/g, ''); // Hapus semua titik
    return Number(formattedValue);
};

const toAppDateFormatter = (value) => {
    const date = new Date(value);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
};

const toAppDateFormatterTwoDigit = (value) => {
    const date = new Date(value);

    // Pastikan validitas tanggal
    if (isNaN(date.getTime())) {
        return 'Invalid Date'; // Handle nilai tidak valid
    }

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Tambahkan 1 ke bulan karena bulan dimulai dari 0
    const year = date.getUTCFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
};

const toApiDateFormatter = (value) => {
    const parts = value.split('-');
    if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }

    return '';
};

const toAppDateTimezoneFormatter = (value) => {
    const jakartaTimezone = 'Asia/Jakarta';
    const date = new Date(value);

    const formatterDay = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        day: '2-digit',
    });
    const formatterMonth = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        month: 'short',
    });
    const formatterYear = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        year: 'numeric',
    });

    const day = formatterDay.format(date);
    const month = formatterMonth.format(date);
    const year = formatterYear.format(date);

    return `${day} ${month} ${year}`;
};

const toApiDateTimezoneFormatter = (value) => {
    const jakartaTimezone = 'Asia/Jakarta';
    const date = new Date(value);

    const formatterDay = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        day: '2-digit',
    });
    const formatterMonth = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        month: '2-digit',
    });
    const formatterYear = new Intl.DateTimeFormat('en-US', {
        timeZone: jakartaTimezone,
        year: 'numeric',
    });

    const day = formatterDay.format(date);
    const month = formatterMonth.format(date);
    const year = formatterYear.format(date);

    return `${year}-${month}-${day}`;
};

import { message } from 'antd';
// cryptoHelper.js
import CryptoJS from 'crypto-js';

const secretKey = `${import.meta.env.VITE_KEY_SESSION}`; // Ganti dengan kunci rahasia kamu

// Fungsi untuk mengenkripsi data
const encryptData = (data) => {
    try {
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
        return ciphertext;
    } catch (error) {
        console.error('Encrypt Error:', error);
        return null;
    }
};

// Fungsi untuk mendekripsi data
const decryptData = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if (decrypted?.error) {
            decrypted.error = false;
        }
        return decrypted;
    } catch (error) {
        // console.error('Decrypt Error:', error);
        return { error: true, message: `Decrypt Error: ${error}` };
    }
};

const getSessionData = () => {
    try {
        const ciphertext = localStorage.getItem('session');

        if (!ciphertext) {
            return {
                error: true,
            };
        }
        const result = decryptData(ciphertext);
        return result;
    } catch (error) {
        // console.error('Decrypt Error:', error);
        return { error: true, message: error };
    }
};

export {
    formatIDR,
    formatCurrencyUSD,
    formatCurrencyIDR,
    toApiNumberFormatter,
    toAppDateFormatter,
    toApiDateFormatter,
    toAppDateTimezoneFormatter,
    toAppDateFormatterTwoDigit,
    toApiDateTimezoneFormatter,
    encryptData,
    getSessionData,
    decryptData,
};
