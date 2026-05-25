const SvgTemplate = ({ children }) => {
    return (
        <div
            style={{
                height: '80vh', // penuh 1 layar
                width: '80vw', // penuh 1 layar lebar
                overflow: 'hidden', // hilangkan scroll
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff', // opsional
            }}
        >
            {children}
        </div>
    );
};

export default SvgTemplate;
