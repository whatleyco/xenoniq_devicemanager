import React from "react";
import {
  IResourceComponentsProps,
  BaseRecord,
  useTranslate,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const SerialManifestList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();

  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="serial">
        <Table.Column
          dataIndex="serial"
          title="Serial Number"
          sorter
        />
        <Table.Column
          dataIndex="sku"
          title="SKU"
          sorter
        />
        <Table.Column
          dataIndex="mac"
          title="MAC Address"
          sorter
          render={(value: any) => (
            <Tag color="blue">{value}</Tag>
          )}
        />
        <Table.Column
          dataIndex="ssid"
          title="SSID"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="imei"
          title="IMEI"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="provider"
          title="Provider"
          render={(value: any) => value || "-"}
        />
        <Table.Column
          dataIndex="batch"
          title="Batch"
          sorter
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
          sorter
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