import { login } from '../../api/auth';
import { encryptData } from '../../components/Global/Formatter';
import { NotifAlert } from '../../components/Global/ToastNotif';

const handleSignIn = async (values) => {

    const response = await login(values);

    // return false
    if (response?.status == 200) {
        let token = JSON.stringify(response.data?.token);

        localStorage.setItem('token', token);
        response.data.auth = true;
        localStorage.setItem('session', encryptData(response?.data));

        // langsung redirect ke dashboard utama
        window.location.replace('/dashboard/home');
    } else {
        NotifAlert({
            icon: 'error',
            title: 'Gagal',
            message: response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
        });
    }
};

export default handleSignIn;
