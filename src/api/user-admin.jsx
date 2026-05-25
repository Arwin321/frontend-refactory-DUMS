import { SendRequest } from '../components/Global/ApiRequest';

const getAllUser = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `admin-user?${queryParams.toString()}`,
    });
    return response.data;
};

const getUserDetail = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `admin-user/${id}`,
    });
    return response.data;
};

const updateUser = async (id, data) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `admin-user/${id}`,
        params: data,
    });
    return response.data;
};

const deleteUser = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `admin-user/${id}`,
    });
    return response.data;
};

const approvalUser = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `admin-user/approve/${id}`,
        params: queryParams,
    });
    return response.data;
};

export { getAllUser, getUserDetail, updateUser, deleteUser, approvalUser };
