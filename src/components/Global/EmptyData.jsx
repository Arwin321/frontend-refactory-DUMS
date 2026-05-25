import { Empty, Col, Row, Typography } from "antd";
const {Text} = Typography;

const EmptyData = ({
    titleButton,
    titlePositionButton
})=>{
    return(
        <Empty
            description={
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Row justify="center" align="middle" style={{ height: "100%" }}>
                        <Text style={{fontSize:'22px', fontWeight:'bold'}}>Data Kosong</Text>
                    </Row>
                    <Row justify="center" align="middle" style={{ height: "100%"}}>
                        <Text style={{width:'20%', fontSize:'20px'}}>Untuk menampilkan data silahkan klik tombol <Text strong style={{fontSize:'20px'}}>{titleButton}</Text> {titlePositionButton}</Text>
                    </Row>
                </Col>
            }
        />
    );
};

export default EmptyData;