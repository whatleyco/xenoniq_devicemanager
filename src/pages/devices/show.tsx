import React from "react";
import { IResourceComponentsProps, useShow, useOne } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/antd";
import { Typography, Row, Col, Card, Tag } from "antd";

const { Title, Text } = Typography;

export const DevicesShow: React.FC<IResourceComponentsProps> = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  // Get manifest data for this serial
  const { data: manifestData } = useOne({
    resource: "serial_manifest",
    id: record?.serial,
    queryOptions: {
      enabled: !!record?.serial,
    },
  });

  const manifest = manifestData?.data;

  return (
    <Show isLoading={isLoading}>
      {/* Device Information */}
      <Card title="Device Information" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Serial Number:</Text>
            <br />
            <TextField value={record?.serial} />
          </Col>
          
          <Col span={12}>
            <Text strong>Customer:</Text>
            <br />
            <TextField value={record?.customer || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Order Name:</Text>
            <br />
            <TextField value={record?.order_name || "-"} />
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
        </Row>
      </Card>

      {/* Manifest Information */}
      <Card title="Device Specifications (from Serial Manifest)" style={{ marginBottom: 16 }}>
        {manifest ? (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>SKU:</Text>
              <br />
              <TextField value={manifest.sku} />
            </Col>
            
            <Col span={12}>
              <Text strong>MAC Address:</Text>
              <br />
              <Tag color="blue">{manifest.mac}</Tag>
            </Col>
            
            <Col span={12}>
              <Text strong>SSID:</Text>
              <br />
              <TextField value={manifest.ssid || "-"} />
            </Col>
            
            <Col span={12}>
              <Text strong>WiFi Password:</Text>
              <br />
              <Text>{manifest.wifi_pw ? "••••••••" : "-"}</Text>
            </Col>
            
            <Col span={12}>
              <Text strong>IMEI:</Text>
              <br />
              <TextField value={manifest.imei || "-"} />
            </Col>
            
            <Col span={12}>
              <Text strong>ICCID:</Text>
              <br />
              <TextField value={manifest.iccid || "-"} />
            </Col>
            
            <Col span={12}>
              <Text strong>Provider:</Text>
              <br />
              <TextField value={manifest.provider || "-"} />
            </Col>
            
            <Col span={12}>
              <Text strong>Batch:</Text>
              <br />
              <TextField value={manifest.batch || "-"} />
            </Col>
          </Row>
        ) : (
          <Text type="warning">
            No manifest data found for this serial number.
          </Text>
        )}
      </Card>
    </Show>
  );
}; 