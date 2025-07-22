// Serial number validation rules based on SKU
export const validateSerialNumber = (serial: string, sku: string): { isValid: boolean; message?: string } => {
  if (!serial || !sku) {
    return { isValid: false, message: "Serial number and SKU are required" };
  }

  const trimmedSerial = serial.trim();
  const trimmedSku = sku.trim();

  switch (trimmedSku) {
    case "E550-US-MC":
      // Must be 8 digit numerals starting with "920"
      const e550Pattern = /^920\d{5}$/;
      if (!e550Pattern.test(trimmedSerial)) {
        return {
          isValid: false,
          message: "For SKU E550-US-MC, serial must be 8 digits starting with '920' (e.g., 92012345)"
        };
      }
      break;

    case "VistaCam-1203-US":
      // Must be "FMOBI" followed by 10 numerals
      const vistaPattern = /^FMOBI\d{10}$/;
      if (!vistaPattern.test(trimmedSerial)) {
        return {
          isValid: false,
          message: "For SKU VistaCam-1203-US, serial must be 'FMOBI' followed by 10 digits (e.g., FMOBI2503003092)"
        };
      }
      break;

    default:
      // For unknown SKUs, just check that serial is not empty
      if (trimmedSerial.length === 0) {
        return {
          isValid: false,
          message: "Serial number cannot be empty"
        };
      }
      // Allow any format for unknown SKUs (future-proofing)
      break;
  }

  return { isValid: true };
};

// Helper function to get example serial for a given SKU
export const getSerialExample = (sku: string): string => {
  switch (sku.trim()) {
    case "E550-US-MC":
      return "92012345";
    case "VistaCam-1203-US":
      return "FMOBI2503003092";
    default:
      return "Enter serial number";
  }
};

// Get all supported SKUs with their validation rules
export const getSupportedSkus = () => [
  {
    sku: "E550-US-MC",
    format: "8 digits starting with '920'",
    example: "92012345"
  },
  {
    sku: "VistaCam-1203-US", 
    format: "'FMOBI' + 10 digits",
    example: "FMOBI2503003092"
  }
]; 