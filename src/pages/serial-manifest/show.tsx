import React from "react";
import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/antd";
import { Typography, Row, Col, Card, Tag } from "antd";

const { Title, Text } = Typography;

export const SerialManifestShow: React.FC<IResourceComponentsProps> = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={4}>Device Information</Title>
          </Col>
          
          <Col span={12}>
            <Text strong>Serial Number:</Text>
            <br />
            <TextField value={record?.serial} />
          </Col>
          
          <Col span={12}>
            <Text strong>SKU:</Text>
            <br />
            <TextField value={record?.sku} />
          </Col>
          
          <Col span={12}>
            <Text strong>MAC Address:</Text>
            <br />
            {record?.mac ? <Tag color="blue">{record.mac}</Tag> : "-"}
          </Col>
          
          <Col span={12}>
            <Text strong>SSID:</Text>
            <br />
            <TextField value={record?.ssid || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>WiFi Password:</Text>
            <br />
            <Text>{record?.wifi_pw ? "••••••••" : "-"}</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>IMEI:</Text>
            <br />
            <TextField value={record?.imei || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>ICCID:</Text>
            <br />
            <TextField value={record?.iccid || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Provider:</Text>
            <br />
            <TextField value={record?.provider || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Batch:</Text>
            <br />
            <TextField value={record?.batch || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Created:</Text>
            <br />
            {record?.created_at ? (
              (() => {
                try {
                  return <DateField value={record.created_at} />;
                } catch (error) {
                  console.error("Date parsing error:", error, "value:", record.created_at);
                  return record.created_at.toString();
                }
              })()
            ) : "-"}
          </Col>
          
          <Col span={12}>
            <Text strong>Last Updated:</Text>
            <br />
            {record?.updated_at ? (
              (() => {
                try {
                  return <DateField value={record.updated_at} />;
                } catch (error) {
                  console.error("Date parsing error:", error, "value:", record.updated_at);
                  return record.updated_at.toString();
                }
              })()
            ) : "-"}
          </Col>
        </Row>
      </Card>
    </Show>
  );
}; 