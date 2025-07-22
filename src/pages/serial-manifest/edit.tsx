import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Col, Row } from "antd";
import { validateSerialNumber, getSerialExample } from "../../utils/serialValidation";

export const SerialManifestEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, formLoading } = useForm();
  const [currentSku, setCurrentSku] = React.useState<string>("");

  // Watch SKU field to update serial validation
  const skuValue = Form.useWatch('sku', formProps.form);
  React.useEffect(() => {
    if (skuValue !== currentSku) {
      setCurrentSku(skuValue || "");
    }
  }, [skuValue, currentSku]);

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Serial Number"
              name={["serial"]}
              rules={[
                {
                  required: true,
                  message: "Please enter serial number",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    
                    const validation = validateSerialNumber(value, currentSku);
                    if (!validation.isValid) {
                      return Promise.reject(new Error(validation.message));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              help={currentSku ? `Format for ${currentSku}: ${getSerialExample(currentSku)}` : undefined}
            >
              <Input placeholder={getSerialExample(currentSku)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SKU"
              name={["sku"]}
              rules={[
                {
                  required: true,
                  message: "Please enter SKU",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="MAC Address"
              name={["mac"]}
              rules={[
                {
                  required: true,
                  message: "Please enter MAC address",
                },
                {
                  pattern: /^[0-9A-Fa-f]{12}$/,
                  message: "Please enter a valid MAC address (12 hexadecimal characters)",
                },
              ]}
            >
              <Input maxLength={12} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SSID"
              name={["ssid"]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="WiFi Password"
              name={["wifi_pw"]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="IMEI"
              name={["imei"]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ICCID"
              name={["iccid"]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Provider"
              name={["provider"]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Batch"
              name={["batch"]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
}; 