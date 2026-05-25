import { SendRequest } from '../components/Global/ApiRequest';

const getAllHistoryAlarm = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `history/alarm?${queryParams.toString()}`,
    });

    return response.data;
};

const getAllHistoryEvent = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `history/event?${queryParams.toString()}`,
    });

    return response.data;
};

const getAllHistoryValueReport = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `history/value-report?${queryParams.toString()}`,
    });

    return response.data;
};

const getAllHistoryValueReportPivot = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `history/value-report-pivot?${queryParams.toString()}`,
    });

    return response.data;
};

const getAllHistoryValueTrendingPivot = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `history/value-trending?${queryParams.toString()}`,
    });

    return response.data;
};

export {
    getAllHistoryAlarm,
    getAllHistoryEvent,
    getAllHistoryValueReport,
    getAllHistoryValueReportPivot,
    getAllHistoryValueTrendingPivot,
};
