import { Row, Col, Button, ConfigProvider, Divider, Typography } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';

const {Text} = Typography;

const HeaderReport = ({
    title,
    loadingPilihDataStep1,
    handleSelectData,
    step
})=>{
    return(
        <>
            <Row style={{ justifyContent: "space-between" }}>
                <Col>
                    <Row>
                        <Text style={{fontSize:'18px'}} strong>{title}</Text>
                        <div style={{width:'20px'}}></div>
                        <div style={{
                            width:'95px',
                            border:'1px solid #e9f6ef',
                            borderRadius:'5px',
                            backgroundColor:'#e9f6ef',
                            color:'#23a55a',
                            padding:'3px',
                            fontSize:'16px',
                            fontWeight:'bold'
                        }}>
                            {step}
                        </div>
                    </Row>
                </Col>
                <Col>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorBgContainer: "#eff0f5",
                            },
                            components: {
                                Button: {
                                    defaultBg: "white",
                                    defaultColor: "#000000",
                                    defaultBorderColor: "#000000",
                                    defaultHoverColor: "#000000",
                                    defaultHoverBorderColor: "#000000",
                                    defaultHoverColor: "#000000",
                                },
                            },
                        }}
                    >
                        <Button icon={<ArrowLeftOutlined />}>Batal</Button>
                    </ConfigProvider>
                </Col>
            </Row>
            <Divider/>
            <Row style={{ justifyContent: "space-between" }}>
                <Col>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorBgContainer: "#209652",
                            },
                            components: {
                                Button: {
                                    defaultBg: "#23a55a",
                                    defaultColor: "#FFFFFF",
                                    defaultBorderColor: "#23a55a",
                                    defaultHoverColor: "#FFFFFF",
                                    defaultHoverBorderColor: "#209652",
                                },
                            },
                        }}
                    >
                        <Button loading={loadingPilihDataStep1} onClick={handleSelectData}><SearchOutlined /> Pilih Data</Button>
                    </ConfigProvider>
                </Col>
            </Row>
        </>
    );
};
export default HeaderReport;