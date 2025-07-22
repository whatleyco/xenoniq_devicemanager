import React from "react";
import {
  IResourceComponentsProps,
  BaseRecord,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Typography } from "antd";
import { OrderDeleteButton } from "./components/OrderDeleteButton";

const { Text } = Typography;

export const OrdersList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "order_date",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="order_name"
          title="Order Name"
          sorter
        />
        <Table.Column
          dataIndex="customer"
          title="Customer"
          sorter
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="order_date"
          title="Order Date"
          render={(value: any) => {
            if (!value || value === null || value === undefined) return "-";
            try {
              return <DateField value={value} format="MM/DD/YYYY" />;
            } catch (error) {
              console.error("Date parsing error:", error, "value:", value);
              return value.toString();
            }
          }}
          sorter
        />
        <Table.Column
          dataIndex="ship_date"
          title="Ship Date"
          render={(value: any) => {
            if (!value || value === null || value === undefined) return "-";
            try {
              return <DateField value={value} format="MM/DD/YYYY" />;
            } catch (error) {
              console.error("Date parsing error:", error, "value:", value);
              return value.toString();
            }
          }}
          sorter
        />
        <Table.Column
          dataIndex="carrier"
          title="Carrier"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="tracking_number"
          title="Tracking"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="line_items"
          title="Line Items"
          render={(value: any) => {
            if (!value || !Array.isArray(value)) return "0";
            return (
              <Text>
                {value.length} item{value.length !== 1 ? 's' : ''}
              </Text>
            );
          }}
        />
        <Table.Column
          dataIndex="location"
          title="Location"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id as string} />
              <ShowButton hideText size="small" recordItemId={record.id as string} />
              <OrderDeleteButton hideText size="small" recordItemId={record.id as string} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}; 