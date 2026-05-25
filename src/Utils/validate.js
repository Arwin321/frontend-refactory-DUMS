// utils/validate.js

// Daftar aturan validasi
const validationRules = [
    { field: 'name', label: 'Nama', required: true },
    {
        field: 'email',
        label: 'Email',
        required: true,
        pattern: /\S+@\S+\.\S+/,
        patternMessage: 'Format email tidak valid',
    },
    {
        field: 'age',
        label: 'Umur',
        required: true,
        validator: (v) => !isNaN(v) && Number(v) >= 18,
        message: 'Umur harus angka dan minimal 18 tahun',
    },
];

/**
 * Fungsi validasi dinamis berbasis array objek aturan.
 * @param {Object} data - data form (misal { name: '', email: '' })
 * @param {Array} rules - array aturan validasi
 * @returns {Object} errors - object berisi pesan error per field
 */

export const validateRun = (data, rules, onError) => {
    const errors = {};
    const messages = [];

    const ipRegex = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;

    rules.forEach((rule) => {
        const value = data[rule.field]?.toString().trim();
        const fieldErrors = [];

        if (rule.required && !value) {
            fieldErrors.push(`${rule.label} wajib diisi`);
        }

        // ✅ IP Address check
        if (rule.ip && value && !ipRegex.test(value)) {
            fieldErrors.push(`${rule.label} harus berupa alamat IP yang valid`);
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
            fieldErrors.push(rule.patternMessage || `${rule.label} tidak valid`);
        }

        if (rule.validator && value && !rule.validator(value)) {
            fieldErrors.push(rule.message || `${rule.label} tidak valid`);
        }

        // Gabungkan error satu field jadi satu string (pisah baris)
        if (fieldErrors.length > 0) {
            errors[rule.field] = fieldErrors.join("\n");
            messages.push(...fieldErrors);
        }
    });

    // Jika ada error total, tampilkan callback dan return false

    if (messages.length > 0) {
        if (onError) onError(messages.join("\n"));
        return true;
    }
    return false

};