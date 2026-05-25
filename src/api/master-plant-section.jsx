import { SendRequest } from '../components/Global/ApiRequest';

const getAllPlantSection = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `plant-sub-section?${queryParams.toString()}`,
    });

    return response.data;
};

const getPlantSectionById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `plant-sub-section/${id}`,
    });

    return response.data;
};

const createPlantSection = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `plant-sub-section`,
        params: queryParams,
    });

    return response.data;
};

const updatePlantSection = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `plant-sub-section/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deletePlantSection = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `plant-sub-section/${id}`,
    });

    return response.data;
};

export {
    getAllPlantSection,
    getPlantSectionById,
    createPlantSection,
    updatePlantSection,
    deletePlantSection,
};
