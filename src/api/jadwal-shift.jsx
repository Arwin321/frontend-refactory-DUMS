import { SendRequest } from '../components/Global/ApiRequest';

const getAllJadwalShift = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `user-schedule?${queryParams.toString()}`,
    });

    return response.data;
};

const getJadwalShiftById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `user-schedule/${id}`,
    });

    return response.data;
};

const createJadwalShift = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `user-schedule`,
        params: queryParams,
    });

    return response.data;
};

const updateJadwalShift = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `user-schedule/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteJadwalShift = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `user-schedule/${id}`,
    });
    return response.data;
};

export {
    getAllJadwalShift,
    getJadwalShiftById,
    createJadwalShift,
    updateJadwalShift,
    deleteJadwalShift,
};
