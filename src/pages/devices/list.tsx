import React from "react";
import {
  IResourceComponentsProps,
  BaseRecord,
  useList,
} from "@refinedev/core";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tag, Typography } from "antd";

const { Text } = Typography;

export const DevicesList: React.FC<IResourceComponentsProps> = () => {
  // Custom query to join devices with serial_manifest data
  const { data: devicesData, isLoading } = useList({
    resource: "devices",
  });

  const { data: manifestData } = useList({
    resource: "serial_manifest",
  });

  // Create a joined dataset
  const joinedData = React.useMemo(() => {
    if (!devicesData?.data || !manifestData?.data) return [];
    
    return devicesData.data.map(device => {
      const manifest = manifestData.data.find(m => m.serial === device.serial);
      return {
        ...device,
        sku: manifest?.sku || '-',
        mac: manifest?.mac || '-',
        batch: manifest?.batch || '-',
      };
    });
  }, [devicesData?.data, manifestData?.data]);

  return (
    <List>
      <Table 
        dataSource={joinedData} 
        rowKey="serial" 
        loading={isLoading}
      >
        <Table.Column
          dataIndex="serial"
          title="Serial Number"
          sorter={(a, b) => a.serial.localeCompare(b.serial)}
        />
        <Table.Column
          dataIndex="customer"
          title="Customer"
          render={(value: any) => value || "-"}
          sorter={(a, b) => (a.customer || '').localeCompare(b.customer || '')}
        />
        <Table.Column
          dataIndex="order_name"
          title="Order Name"
          render={(value: any) => value || "-"}
          sorter={(a, b) => (a.order_name || '').localeCompare(b.order_name || '')}
        />
        <Table.Column
          dataIndex="sku"
          title="SKU"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="mac"
          title="MAC Address"
          render={(value: any) => 
            value && value !== '-' ? <Tag color="blue">{value}</Tag> : "-"
          }
        />
        <Table.Column
          dataIndex="batch"
          title="Batch"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex={["created_at"]}
          title="Created"
          render={(value: any) => {
            if (!value || value === null || value === undefined) return "-";
            try {
              return <DateField value={value} />;
            } catch (error) {
              console.error("Date parsing error:", error, "value:", value);
              return value.toString();
            }
          }}
          sorter={(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}; 