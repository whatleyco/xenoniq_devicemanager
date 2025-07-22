import React from "react";
import { IResourceComponentsProps, useCreate, useList } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Col, Row, DatePicker, Button, Card, InputNumber, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const OrdersCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, formLoading, onFinish } = useForm();
  const { mutate: createDevice } = useCreate();
  
  // Get all serial manifest data to validate serials exist
  const { data: serialManifestData } = useList({
    resource: "serial_manifest",
    pagination: { mode: "off" },
  });
  
  // Get all existing devices to check for duplicates
  const { data: existingDevicesData } = useList({
    resource: "devices",
    pagination: { mode: "off" },
  });

  // Get all existing orders to check for duplicate order names
  const { data: existingOrdersData } = useList({
    resource: "orders",
    pagination: { mode: "off" },
  });

  // Custom form submission to create devices for each serial
  const handleFinish = async (values: any) => {
    try {
      // Check for duplicate order name first
      const existingOrderNames = new Set((existingOrdersData?.data || []).map((order: any) => order.order_name));
      if (existingOrderNames.has(values.order_name)) {
        message.error(`❌ Order name "${values.order_name}" already exists! Please choose a different order name.`);
        throw new Error("Duplicate order name");
      }

      // Extract serials from line items and validate BEFORE saving order
      const allSerials: string[] = [];
      const missingFromManifest: string[] = [];
      const duplicateSerials: string[] = [];
      
      if (values.line_items && Array.isArray(values.line_items)) {
        const manifestSerials = new Set((serialManifestData?.data || []).map((item: any) => item.serial));
        const existingDeviceSerials = new Set((existingDevicesData?.data || []).map((item: any) => item.serial));
        
        // Collect all serials from line items
        values.line_items.forEach((lineItem: any) => {
          if (lineItem.serials) {
            const serials = lineItem.serials
              .split('\n')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
            
            serials.forEach((serial: string) => {
              allSerials.push(serial);
              if (!manifestSerials.has(serial)) {
                missingFromManifest.push(serial);
              }
              if (existingDeviceSerials.has(serial)) {
                duplicateSerials.push(serial);
              }
            });
          }
        });
        
        // FAIL if any duplicates exist - don't save order at all
        if (duplicateSerials.length > 0) {
          message.error(
            `❌ Order cannot be saved! ${duplicateSerials.length} serial(s) already exist as devices: ${duplicateSerials.join(', ')}`
          );
          throw new Error("Duplicate serials found");
        }
        
        // Show notification for missing serials but continue
        if (missingFromManifest.length > 0) {
          message.warning(
            `⚠️ ${missingFromManifest.length} serial(s) not found in Serial Manifest: ${missingFromManifest.join(', ')}. Device records will still be created.`
          );
        }
      }

      // Transform dates back to strings for submission
      const transformedValues = {
        ...values,
        order_date: values.order_date ? dayjs(values.order_date).format("YYYY-MM-DD") : null,
        ship_date: values.ship_date ? dayjs(values.ship_date).format("YYYY-MM-DD") : null,
      };
      
      // Create the order ONCE after all validation passes
      const orderResult = await onFinish(transformedValues);
      
      // Create device records for ALL serials (including those not in manifest)
      if (allSerials.length > 0) {
        // Remove duplicates from allSerials array
        const uniqueSerials = [...new Set(allSerials)];
        
        const devicePromises = uniqueSerials.map((serial: string) =>
          new Promise((resolve, reject) => {
            createDevice({
              resource: "devices",
              values: {
                serial: serial,
                customer: values.customer,
                order_id: (orderResult as any)?.data?.id,
              },
            }, {
              onSuccess: resolve,
              onError: reject,
            });
          })
        );
        
        await Promise.all(devicePromises);
        
        let successMessage = `Order created! ${uniqueSerials.length} device records created`;
        if (missingFromManifest.length > 0) {
          successMessage += ` (${missingFromManifest.length} not in manifest)`;
        }
        
        message.success(successMessage);
      }
      
      return orderResult;
    } catch (error) {
      console.error("Error creating order and devices:", error);
      message.error("Error creating order. Please try again.");
      throw error;
    }
  };

  return (
    <Create 
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => {
          formProps.form?.submit();
        }
      }} 
      isLoading={formLoading}
    >
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
                        const existingOrderNames = new Set((existingOrdersData?.data || []).map((order: any) => order.order_name));
                        if (existingOrderNames.has(value)) {
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
          <Form.List name={["line_items"]} initialValue={[{}]}>
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
                      extra="Each serial will automatically create a device record"
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
    </Create>
  );
}; 