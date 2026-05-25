import { SendRequest } from '../components/Global/ApiRequest';
import RegistrationRequest from '../components/Global/RegisterRequest';

const login = async (params) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `auth/login`,
        params: params,
    });
    return response || [];
};

const register = async (params) => {
    const response = await RegistrationRequest({
        method: 'post',
        prefix: 'auth/register',
        params: params,
        headers: { 'Content-Type': 'application/json' },
    });
    return response || {};
};

const verifyRedirect = async (params) => {
    const response = await SendRequest({
        method: 'post',
        prefix: 'auth/verify-redirect',
        params: params,
        token: false,
    });
    return response || {};
};

const checkUsername = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `register/check-username?${queryParams.toString()}`,
    });
    return response || {};
};


export { login, register, verifyRedirect, checkUsername };
