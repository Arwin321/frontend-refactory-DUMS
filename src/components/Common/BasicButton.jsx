import React from "react";
import { Button, ConfigProvider } from 'antd';
import propTypes from 'prop-types';

const BasicButton = ({
  // color,
  text,
  size,
  block,
  clickTheButton
}) => {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            // colorBgContainer: '#23A55A',
            colorText: 'white',
            colorBgContainer: 'purple',
            // Seed Token
          //   colorPrimary: '#23A55A',
          //   // colorPrimary: `${color}`,
          //   borderRadius: 8,
            

          //   // Alias Token
          //   // colorBgContainer: '#f6ffed',
          //   // colorBgContainer: {color},
          },
          components: {
            Button: {
              defaultBg: '#23A55A',
              defaultColor: 'white',
            }
          },
        }}
      >
        <Button
          type=""
          block={block}
          size={size}
          onClick={() => clickTheButton(block)}
        // style={{
        //   background: "#23A55A",
        //   borderColor: "#23A55A",
        //   color: "white",
        // }}
        >
          {text}
        </Button>
      </ConfigProvider>
    </>
  );
}

BasicButton.propTypes = {
  // color: propTypes.string,
  text: propTypes.string,
  size: propTypes.string,
  block: propTypes.bool,
  clickTheButton: propTypes.any
}

export default BasicButton;