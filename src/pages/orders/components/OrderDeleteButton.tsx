import React, { useState } from "react";
import { Button, Modal, Input, message, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDelete, useList } from "@refinedev/core";
import { supabaseClient } from "../../../utils/supabase";

const { Text } = Typography;

interface OrderDeleteButtonProps {
  recordItemId: string | number;
  hideText?: boolean;
  size?: "small" | "middle" | "large";
}

export const OrderDeleteButton: React.FC<OrderDeleteButtonProps> = ({
  recordItemId,
  hideText = false,
  size = "middle",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteDevice } = useDelete();

  // Fetch devices associated with this order
  const { data: devicesData, refetch: refetchDevices } = useList({
    resource: "devices",
    filters: [{ field: "order_id", operator: "eq", value: recordItemId }],
    queryOptions: {
      enabled: !!recordItemId, // Only fetch when recordItemId is available
    },
  });

  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setConfirmText("");
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== "DELETE") {
      message.error("You must type 'DELETE' to confirm");
      return;
    }

    setIsDeleting(true);

    try {
      // Refresh devices data
      await refetchDevices();
      const associatedDevices = devicesData?.data || [];

      // Delete all associated device records first
      if (associatedDevices.length > 0) {
        const deviceDeletePromises = associatedDevices
          .filter((device) => device.id !== undefined) // Only include devices with valid IDs
          .map((device) =>
            new Promise((resolve, reject) => {
              deleteDevice({ resource: "devices", id: device.id! }, { onSuccess: resolve, onError: reject });
            })
          );
        await Promise.all(deviceDeletePromises);
        message.success(`Deleted ${associatedDevices.length} associated device records`);
      }

      // Delete the order using the id
      const { error: orderDeleteError } = await supabaseClient
        .from("orders")
        .delete()
        .eq("id", recordItemId);

      if (orderDeleteError) {
        console.error("Error deleting order:", orderDeleteError);
        message.error("Failed to delete order");
        setIsDeleting(false);
        return;
      }

      message.success("Order and associated devices deleted successfully!");
      setIsModalVisible(false);
      setConfirmText("");
      setIsDeleting(false);
      
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error in delete process:", error);
      message.error("Failed to delete order and associated devices");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined />}
        size={size}
        onClick={showDeleteModal}
      >
        {!hideText && "Delete"}
      </Button>

      <Modal
        title="Delete Order & Associated Devices"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Delete Order & Devices
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>
            This will permanently delete the order and all {devicesData?.data?.length || 0} associated device records.
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text>
            <strong>1</strong> order and <strong>{devicesData?.data?.length || 0}</strong> device records are selected for deletion.
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">
            Type <strong>DELETE</strong> to confirm:
          </Text>
        </div>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          disabled={isDeleting}
        />
      </Modal>
    </>
  );
}; 