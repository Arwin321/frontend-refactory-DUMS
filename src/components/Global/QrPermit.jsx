import { Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import ImgPIU from '../../assets/freepik/LOGOPIU.png';

const { Title, Text } = Typography;

function QrPermit() {
    const [searchParams] = useSearchParams();
    const selectedRole = searchParams.get('role');
    const selectedName = searchParams.get('name');
    const selectedTime = searchParams.get('time');

    const formattedTime = selectedTime
        ? new Date(selectedTime).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '-';

    const userApproval = {
        role: ['Performing Authority', 'Permit Control', 'Site Authority', 'Area Authority'],
        roleCode: ['PA', 'PC', 'SA', 'AA'],
    };

    const filteredRoles = userApproval.role.filter((role, index) => {
        const code = userApproval.roleCode[index];
        return !selectedRole || selectedRole === code;
    });

    const isMobile = window.innerWidth <= 768;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
                textAlign: 'center',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '3rem',
                boxSizing: 'border-box',
            }}
        >
            <img
                src={ImgPIU}
                alt="Logo PIU"
                style={{
                    width: isMobile ? '100%' : '100%',
                    maxWidth: isMobile ? '300px' : '30%',
                    height: 'auto',
                    marginBottom: isMobile ? '1.5rem' : '2vh',
                    marginTop: isMobile ? '-1rem' : '-75px',
                }}
            />
            {filteredRoles.map((role, index) => (
                <div key={index} style={{ width: '100%' }}>
                    <Title
                        strong
                        level={1}
                        style={{
                            marginTop: isMobile ? '-2rem' : '-75px',
                            fontWeight: 600,
                            color: '#004D80',
                            textAlign: 'center',
                            fontSize: isMobile ? '6vw' : '2.5rem',
                        }}
                    >
                        Validasi Dokumen <br /> Pupuk Indonesia Utilitas
                    </Title>
                    <Title
                        level={2}
                        style={{
                            marginTop: isMobile ? '1rem' : '-5px',
                            fontWeight: 600,
                            color: '#141414',
                            textAlign: 'center',
                            fontSize: isMobile ? '6vw' : '2.5rem',
                        }}
                    >
                        {role}
                    </Title>
                    <div
                        style={{
                            fontSize: isMobile ? '4.5vw' : '25px',
                            lineHeight: isMobile ? 1.5 : 1.8,
                            marginTop: isMobile ? '1rem' : '1.5rem',
                        }}
                    >
                        <Text strong style={{ fontSize: isMobile ? '4.5vw' : 25 }}>
                            Nama:
                        </Text>{' '}
                        {selectedName ?? '-'}
                        <br />
                        <Text strong style={{ fontSize: isMobile ? '4.5vw' : 25 }}>
                            {formattedTime}
                        </Text>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default QrPermit;
