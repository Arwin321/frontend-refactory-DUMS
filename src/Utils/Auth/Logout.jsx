const handleLogOut = (navigate) => {
    // Hapus semua data localStorage
    localStorage.clear();

    // Redirect ke halaman signin
    if (navigate) {
        navigate('/signin', { replace: true });
    } else {
        window.location.replace('/signin');
    }
};

export default handleLogOut;
