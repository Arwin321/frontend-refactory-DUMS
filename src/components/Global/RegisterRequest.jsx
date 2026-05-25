import axios from 'axios';

const RegistrationRequest = async ({ method, prefix, params, headers = {} }) => {
    const baseURL = `${import.meta.env.VITE_API_SERVER}`;

    try {
        const response = await axios({
            method: method,
            url: `${baseURL}/${prefix}`,
            data: params,
            headers: {
                'Accept-Language': 'en_US',
                ...headers,
            },
            withCredentials: true,
        });

        return response.data || {};
    } catch (error) {
        console.error(`Error saat ${prefix}:`, error.response?.data || error.message);
        throw error.response?.data || { message: 'Terjadi kesalahan pada server' };
    }
};

export default RegistrationRequest;
