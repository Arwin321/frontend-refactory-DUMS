import { SendRequest } from '../components/Global/ApiRequest';

const getAllUser = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `user?${queryParams.toString()}`,
    });

    return response.data;
};

const getUserById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `user/${id}`,
    });

    return response.data;
};

const createUser = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `user`,
        params: queryParams,
    });

    return response.data;
};

const updateUser = async (user_id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user/${user_id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteUser = async (queryParams) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `user/${queryParams}`,
    });

    return response.data;
};

const approveUser = async (user_id) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user/${user_id}/approve`,
    });

    return response.data;
};

const rejectUser = async (user_id) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user/${user_id}/reject`,
    });

    return response.data;
};

const toggleActiveUser = async (user_id, is_active) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user/${user_id}`,
        params: {
            is_active: is_active,
        },
    });

    return response.data;
};

const changePassword = async (user_id, new_password) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user/change-password/${user_id}`,
        params: {
            new_password: new_password,
        },
    });

    return response.data;
};

export {
    getAllUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    toggleActiveUser,
    changePassword,
};
