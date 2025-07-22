import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Col, Row } from "antd";

export const DevicesEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, formLoading } = useForm();

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
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Customer"
              name={["customer"]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Order ID"
              name={["order_id"]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
}; 