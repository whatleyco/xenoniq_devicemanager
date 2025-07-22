import React from "react";
import { IResourceComponentsProps, useShow, useList } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/antd";
import { Typography, Row, Col, Card, Table, Tag } from "antd";
import { useParams, useNavigate } from "react-router";

const { Title, Text } = Typography;

export const OrdersShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Check if the ID is numeric or an order name
  const isNumericId = id && !isNaN(Number(id));
  
  // If it's not numeric, we need to look up the order by order_name
  const { data: orderByName } = useList({
    resource: "orders",
    filters: [
      {
        field: "order_name",
        operator: "eq",
        value: id,
      },
    ],
    pagination: { pageSize: 1 },
    queryOptions: {
      enabled: !isNumericId && !!id,
      retry: false,
    },
  });
  
  // If we found an order by name, redirect to the numeric ID URL
  React.useEffect(() => {
    if (!isNumericId && orderByName?.data && orderByName.data.length > 0) {
      const foundOrder = orderByName.data[0] as any;
      navigate(`/orders/show/${foundOrder.id}`, { replace: true });
    }
  }, [orderByName, isNumericId, navigate]);
  
  // Use the numeric ID for the show
  const actualId = isNumericId ? id : (orderByName?.data && orderByName.data.length > 0 ? (orderByName.data[0] as any).id : undefined);
  
  const { queryResult } = useShow({
    id: actualId,
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;
  
  // Show loading when looking up order by name
  if (!isNumericId && !orderByName?.data && id) {
    return <Show isLoading={true} />;
  }
  
  // Show error if order name not found
  if (!isNumericId && orderByName?.data && orderByName.data.length === 0) {
    return (
      <Show>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Order not found</h3>
          <p>No order found with name "{id}"</p>
        </div>
      </Show>
    );
  }

  const lineItemColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Serial Numbers',
      dataIndex: 'serials',
      key: 'serials',
      render: (serials: string[]) => {
        if (!serials || !Array.isArray(serials)) return '-';
        return (
          <div>
            {serials.map((serial, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {serial}
              </Tag>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <Show isLoading={isLoading}>
      {/* Order Information */}
      <Card title="Order Information" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Order Name:</Text>
            <br />
            <TextField value={record?.order_name} />
          </Col>
          
          <Col span={12}>
            <Text strong>Order ID (Shopify):</Text>
            <br />
            <TextField value={record?.order_id || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Order Date:</Text>
            <br />
            {record?.order_date ? (
              (() => {
                try {
                  return <DateField value={record.order_date} format="MM/DD/YYYY" />;
                } catch (error) {
                  console.error("Date parsing error:", error, "value:", record.order_date);
                  return record.order_date.toString();
                }
              })()
            ) : "-"}
          </Col>
          
          <Col span={12}>
            <Text strong>Ship Date:</Text>
            <br />
            {record?.ship_date ? (
              (() => {
                try {
                  return <DateField value={record.ship_date} format="MM/DD/YYYY" />;
                } catch (error) {
                  console.error("Date parsing error:", error, "value:", record.ship_date);
                  return record.ship_date.toString();
                }
              })()
            ) : "-"}
          </Col>
          
          <Col span={12}>
            <Text strong>Customer:</Text>
            <br />
            <TextField value={record?.customer || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Ordered By:</Text>
            <br />
            <TextField value={record?.ordered_by || "-"} />
          </Col>
        </Row>
      </Card>

      {/* Shipping Information */}
      <Card title="Shipping Information" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Location (Warehouse):</Text>
            <br />
            <TextField value={record?.location || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Carrier:</Text>
            <br />
            <TextField value={record?.carrier || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Address 1:</Text>
            <br />
            <TextField value={record?.address_1 || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Address 2:</Text>
            <br />
            <TextField value={record?.address_2 || "-"} />
          </Col>
          
          <Col span={8}>
            <Text strong>City:</Text>
            <br />
            <TextField value={record?.city || "-"} />
          </Col>
          
          <Col span={8}>
            <Text strong>State:</Text>
            <br />
            <TextField value={record?.state || "-"} />
          </Col>
          
          <Col span={8}>
            <Text strong>ZIP Code:</Text>
            <br />
            <TextField value={record?.zip || "-"} />
          </Col>
          
          <Col span={12}>
            <Text strong>Tracking Number:</Text>
            <br />
            <TextField value={record?.tracking_number || "-"} />
          </Col>
        </Row>
      </Card>

      {/* Line Items */}
      <Card title="Line Items" style={{ marginBottom: 16 }}>
        <Table
          dataSource={record?.line_items || []}
          columns={lineItemColumns}
          pagination={false}
          rowKey={(record, index) => index?.toString() || '0'}
        />
      </Card>

      {/* Timestamps */}
      <Card title="System Information">
        <Row gutter={[16, 16]}>
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