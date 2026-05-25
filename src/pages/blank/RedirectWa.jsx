import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyRedirect } from '../../api/auth';
import { encryptData } from '../../components/Global/Formatter';
import NotFound from './NotFound';
import Waiting from './Waiting';
import NotificationDetailTab from '../notificationDetail/IndexNotificationDetail';

export default function RedirectWa() {
    const [idData, setIdData] = useState(0);
    const [ready, setReady] = useState(0);

    const location = useLocation();

    // URLSearchParams untuk ambil query
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const handleInitForm = async (encodedToken) => {
        const originalToken = decodeURIComponent(encodedToken);
        // console.log(originalToken);

        const response = await verifyRedirect({
            tokenRedirect: originalToken,
        });

        console.log('tes', response);

        const tokenResult = JSON.stringify(response.data?.data?.accessToken);

        sessionStorage.setItem('token_redirect', tokenResult);
        response.data.auth = true;
        sessionStorage.setItem('session', encryptData(response?.data));

        setIdData(response.data.data.idData);

        setReady(1);
    };

    useEffect(() => {
        handleInitForm(token);
    }, [idData]);

    if (ready == 0) return <Waiting />;

    if (idData === 0) return <NotFound />;

    return <NotificationDetailTab id={idData} />;
}
