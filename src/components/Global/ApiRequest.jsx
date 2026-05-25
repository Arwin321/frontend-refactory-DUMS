import axios from 'axios';
import Swal from 'sweetalert2';

const baseURL = import.meta.env.VITE_API_SERVER;

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

// axios khusus refresh
const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.error('🚨 Response Error Interceptor:', {
            status: error.response?.status,
            url: originalRequest.url,
            message: error.response?.data?.message,
            hasRetried: originalRequest._retry,
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // console.log('🔄 Refresh token dipanggil...');
                const refreshRes = await refreshApi.post('/auth/refresh-token');

                const newAccessToken = refreshRes.data.data.accessToken;
                localStorage.setItem('token', newAccessToken);
                // console.log('✅ Token refreshed successfully');

                // update token di header
                instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // console.log('🔁 Retrying original request...');
                return instance(originalRequest);
            } catch (refreshError) {
                console.error(
                    '❌ Refresh token gagal:',
                    refreshError.response?.data || refreshError.message
                );
                localStorage.clear();
                window.location.href = '/signin';
            }
        }

        return Promise.reject(error);
    }
);

async function ApiRequest({ method = 'GET', params = {}, prefix = '/', token = true } = {}) {
    const isFormData = params instanceof FormData;

    const request = {
        method,
        url: prefix,
        data: params,
        headers: {
            'Accept-Language': 'en_US',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
    };

    const tokenRedirect = sessionStorage.getItem('token_redirect');

    let rawToken = '';

    if (tokenRedirect !== null) {
        rawToken = tokenRedirect;
        // console.log(`sessionStorage: ${tokenRedirect}`);
    } else {
        rawToken = localStorage.getItem('token');
        // console.log(`localStorage: ${rawToken}`);
    }

    if (token && rawToken) {
        const cleanToken = rawToken.replace(/"/g, '');
        request.headers['Authorization'] = `Bearer ${cleanToken}`;
        // console.log('🔐 Sending request with token:', cleanToken.substring(0, 20) + '...');
    } else {
        console.warn('⚠️ No token found in localStorage');
    }

    // console.log('📤 API Request:', { method, url: prefix, hasToken: !!rawToken });

    try {
        const response = await instance(request);
        // console.log('✅ API Response:', {
        //     url: prefix,
        //     status: response.status,
        //     statusCode: response.data?.statusCode,
        // });
        return { ...response, error: false };
    } catch (error) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || error.message || 'Something Wrong';
        console.error('❌ API Error:', {
            url: prefix,
            status,
            message,
            fullError: error?.response?.data,
        });

        if (status !== 401) {
            await cekError(status, message);
        }

        return { ...error.response, error: true };
    }
}

async function cekError(status, message = '') {
    if (status === 403) {
        await Swal.fire({
            icon: 'warning',
            title: 'Forbidden',
            text: message,
        });
    } else if (status >= 500) {
        await Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: message,
        });
    } else {
        await Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: message,
        });
    }
}

const SendRequest = async (queryParams) => {
    try {
        const response = await ApiRequest(queryParams);

        // If ApiRequest returned error flag, return error structure
        if (response.error) {
            const errorMsg = response.data?.message || response.statusText || 'Request failed';

            // Return consistent error structure instead of empty array
            return {
                statusCode: response.status || 500,
                message: errorMsg,
                data: null,
                error: true,
            };
        }

        return response || { statusCode: 200, data: [], message: 'Success' };
    } catch (error) {
        console.error('❌ SendRequest catch error:', error);

        // Don't show Swal here, let the calling code handle it
        // This allows better error handling in each API call
        return {
            statusCode: 500,
            message: error.message || 'Something went wrong',
            data: null,
            error: true,
        };
    }
};

export { ApiRequest, SendRequest };
