import React from "react";
import { IResourceComponentsProps, useCreate, useList, useDelete, useOne } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Col, Row, DatePicker, Button, Card, InputNumber, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import dayjs from "dayjs";
import { supabaseClient } from "../../utils/supabase";

export const OrdersEdit: React.FC<IResourceComponentsProps> = () => {
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
      navigate(`/orders/edit/${foundOrder.id}`, { replace: true });
    }
  }, [orderByName, isNumericId, navigate]);
  
  // Use the numeric ID for the form
  const actualId = isNumericId ? id : (orderByName?.data && orderByName.data.length > 0 ? (orderByName.data[0] as any).id : undefined);
  
  const { formProps, saveButtonProps, formLoading, onFinish, queryResult } = useForm({
    id: actualId,
  });
  
  // Transform date fields for the form
  React.useEffect(() => {
    if (queryResult?.data?.data) {
      const data = queryResult.data.data;
      formProps.form?.setFieldsValue({
        ...data,
        order_date: data.order_date ? dayjs(data.order_date) : undefined,
        ship_date: data.ship_date ? dayjs(data.ship_date) : undefined,
      });
    }
  }, [queryResult?.data?.data, formProps.form]);
  const { mutate: createDevice } = useCreate();
  const { mutate: deleteDevice } = useDelete();
  
  // Determine what content to show
  const isLookingUpOrder = !isNumericId && !orderByName?.data && id;
  const isOrderNotFound = !isNumericId && orderByName?.data && orderByName.data.length === 0;
  
  // Get existing devices for this order
  const { data: existingDevicesData } = useList({
    resource: "devices",
    filters: [
      {
        field: "order_id",
        operator: "eq",
        value: queryResult?.data?.data?.id,
      },
    ],
    queryOptions: {
      enabled: !!queryResult?.data?.data?.id,
    },
  });
  
  // Get all serial manifest data to validate serials exist
  const { data: serialManifestData } = useList({
    resource: "serial_manifest",
    pagination: { mode: "off" },
  });

  // Get all existing orders to check for duplicate order names
  const { data: existingOrdersData } = useList({
    resource: "orders",
    pagination: { mode: "off" },
  });

  // Custom form submission to manage device records
  const handleFinish = async (values: any) => {
    try {
      // Check for duplicate order name (excluding current order)
      const currentOrderName = queryResult?.data?.data?.order_name;
      const existingOrderNames = new Set((existingOrdersData?.data || [])
        .filter((order: any) => order.order_name !== currentOrderName)
        .map((order: any) => order.order_name));
      
      if (values.order_name !== currentOrderName && existingOrderNames.has(values.order_name)) {
        message.error(`❌ Order name "${values.order_name}" already exists! Please choose a different order name.`);
        throw new Error("Duplicate order name");
      }

      // Transform dates back to strings for submission
      const transformedValues = {
        ...values,
        order_date: values.order_date ? dayjs(values.order_date).format("YYYY-MM-DD") : null,
        ship_date: values.ship_date ? dayjs(values.ship_date).format("YYYY-MM-DD") : null,
      };
      
      // Update the order first
      const orderResult = await onFinish(transformedValues);
      
      // Get existing device records for this order
      const existingDevices = existingDevicesData?.data || [];
      const existingSerials = new Set(existingDevices.map((d: any) => d.serial));
      
             // Get all existing devices to check for duplicates
       const manifestSerials = new Set((serialManifestData?.data || []).map((item: any) => item.serial));
       const allDeviceSerials = new Set((await supabaseClient.from("devices").select("serial")).data?.map((item: any) => item.serial) || []);
       
       // Collect all serials from current line items
       const currentSerials = new Set<string>();
       const missingFromManifest: string[] = [];
       
       if (values.line_items && Array.isArray(values.line_items)) {
         values.line_items.forEach((lineItem: any) => {
           if (lineItem.serials) {
             const serials = lineItem.serials
               .split('\n')
               .map((s: string) => s.trim())
               .filter((s: string) => s.length > 0);
             
             serials.forEach((serial: string) => {
               currentSerials.add(serial);
               if (!manifestSerials.has(serial)) {
                 missingFromManifest.push(serial);
               }
             });
           }
         });
       }
       
       // Find serials to add (in current but not in existing for this order)
       const serialsToAdd = Array.from(currentSerials).filter(serial => !existingSerials.has(serial));
       
       // Find serials to remove (in existing but not in current)
       const serialsToRemove = Array.from(existingSerials).filter(serial => !currentSerials.has(serial));
       
       // Check for duplicates in serials to add (excluding ones we already own for this order)
       const duplicatesInNewSerials = serialsToAdd.filter(serial => allDeviceSerials.has(serial));
       
       // FAIL if any new serials would create duplicates
       if (duplicatesInNewSerials.length > 0) {
         message.error(
           `❌ Order cannot be saved! ${duplicatesInNewSerials.length} serial(s) already exist as devices: ${duplicatesInNewSerials.join(', ')}`
         );
         throw new Error("Duplicate serials found");
       }
       
       // Show notification for missing serials but continue
       if (missingFromManifest.length > 0) {
         message.warning(
           `⚠️ ${missingFromManifest.length} serial(s) not found in Serial Manifest: ${missingFromManifest.join(', ')}. Device records will still be created.`
         );
       }
      
             // Delete removed device records
       if (serialsToRemove.length > 0) {
         const deletePromises = serialsToRemove.map((serial: string) =>
           new Promise((resolve, reject) => {
             deleteDevice({
               resource: "devices",
               id: serial,
             }, {
               onSuccess: resolve,
               onError: reject,
             });
           })
         );
        
        await Promise.all(deletePromises);
        message.success(`Removed ${serialsToRemove.length} device records`);
      }
      
                    // Create new device records (for ALL serials, including those not in manifest)
       if (serialsToAdd.length > 0) {
         const createPromises = serialsToAdd.map((serial: string) =>
           new Promise((resolve, reject) => {
             createDevice({
               resource: "devices",
               values: {
                 serial: serial,
                 customer: values.customer,
                 order_id: queryResult?.data?.data?.id,
               },
             }, {
               onSuccess: resolve,
               onError: reject,
             });
           })
         );
         
         await Promise.all(createPromises);
         
         let successMessage = `Added ${serialsToAdd.length} new device records`;
         if (missingFromManifest.length > 0) {
           successMessage += ` (${missingFromManifest.length} not in manifest)`;
         }
         message.success(successMessage);
       }
       
       if (serialsToAdd.length === 0 && serialsToRemove.length === 0) {
         let successMessage = "Order updated successfully - no device changes needed";
         if (missingFromManifest.length > 0) {
           successMessage = `Order updated successfully (${missingFromManifest.length} serials not in manifest)`;
         }
         message.success(successMessage);
       }
      
      return orderResult;
    } catch (error) {
      console.error("Error updating order and devices:", error);
      message.error("Error updating order. Please try again.");
      throw error;
    }
  };

  return (
    <Edit 
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => {
          formProps.form?.submit();
        }
      }} 
      isLoading={formLoading || Boolean(isLookingUpOrder)}
    >
      {isOrderNotFound ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Order not found</h3>
          <p>No order found with name "{id}"</p>
        </div>
      ) : (
        <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        {/* Order Basic Info */}
        <Card title="Order Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Order Name"
                name={["order_name"]}
                validateTrigger={["onBlur", "onChange"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please enter order name",
                  },
                  {
                    pattern: /^[A-Z]{1,2}\d{4,5}$/,
                    message: "Order name must be 1-2 uppercase letters followed by 4-5 digits (e.g., X1001, SF14440)",
                  },
                  {
                    validator: async (_, value) => {
                      if (value) {
                        const currentOrderName = queryResult?.data?.data?.order_name;
                        const existingOrderNames = new Set((existingOrdersData?.data || [])
                          .filter((order: any) => order.order_name !== currentOrderName)
                          .map((order: any) => order.order_name));
                        
                        if (value !== currentOrderName && existingOrderNames.has(value)) {
                          throw new Error(`Order name "${value}" already exists`);
                        }
                      }
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Shopify Order ID"
                name={["order_id"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Order Date"
                name={["order_date"]}
              >
                <DatePicker style={{ width: '100%' }} format="MM/DD/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ship Date"
                name={["ship_date"]}
              >
                <DatePicker style={{ width: '100%' }} format="MM/DD/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Customer"
                name={["customer"]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ordered By"
                name={["ordered_by"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Shipping Information */}
        <Card title="Shipping Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Location (Warehouse)"
                name={["location"]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Carrier"
                name={["carrier"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Address 1"
                name={["address_1"]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Address 2"
                name={["address_2"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="City"
                name={["city"]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="State"
                name={["state"]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ZIP Code"
                name={["zip"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tracking Number"
                name={["tracking_number"]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Line Items */}
        <Card title="Line Items">
          <Form.List name={["line_items"]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    variant="outlined"
                    title={`Line Item ${name + 1}`}
                    extra={
                      <Button 
                        type="link" 
                        onClick={() => remove(name)}
                        icon={<MinusCircleOutlined />}
                      >
                        Remove
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="SKU"
                          name={[name, 'sku']}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter SKU',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="Quantity"
                          name={[name, 'quantity']}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter quantity',
                            },
                          ]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      {...restField}
                      label="Serial Numbers (one per line)"
                      name={[name, 'serials']}
                      extra="Device records will be automatically updated based on changes"
                    >
                      <Input.TextArea 
                        rows={4}
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Line Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
      )}
    </Edit>
  );
}; 