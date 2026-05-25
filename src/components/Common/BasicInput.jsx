import { theme } from "antd";
import React from "react";
// import packageJson from "../../../package.json";

const BasicInput = () => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  
  return (
    <div
      data-testid="versionContainer"
      className="cursor-default fixed top-1 right-1 z-20 m-1"
      style={{ color: colorPrimary }}
    >
      
    </div>
  );
};

export default BasicInput;
