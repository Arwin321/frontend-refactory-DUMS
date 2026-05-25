import { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const JamRealtimeAntd = () => {
    const [waktu, setWaktu] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setWaktu(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format custom manual untuk konsistensi
    const formatWaktuLengkap = (date) => {
        const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const namaHari = hari[date.getDay()];
        const tanggal = date.getDate().toString().padStart(2, '0');
        const namaBulan = bulan[date.getMonth()];
        const tahun = date.getFullYear();
        
        const jam = date.getHours().toString().padStart(2, '0');
        const menit = date.getMinutes().toString().padStart(2, '0');
        const detik = date.getSeconds().toString().padStart(2, '0');

        return `${namaHari}, ${tanggal} ${namaBulan} ${tahun} ${jam}:${menit}:${detik}`;
    };

    return (
        <Text style={{ 
            fontSize: '25px', 
            // fontWeight: 'bold',
            color: '#1BAA56'
        }}>
            {formatWaktuLengkap(waktu)}
        </Text>
    );
};

export default JamRealtimeAntd;