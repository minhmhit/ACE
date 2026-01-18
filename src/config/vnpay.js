import dotenv from "dotenv";

dotenv.config();


export const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "",
  vnp_Url:
    process.env.VNPAY_URL,
  vnp_Api:
    process.env.VNPAY_API_URL,
  vnp_ReturnUrl:
    process.env.VNPAY_RETURN_URL,
};

// Validate config
export const validateVnpayConfig = () => {
  if (!vnpayConfig.vnp_TmnCode) {
    throw new Error("VNPAY_TMN_CODE không được để trống trong file .env");
  }
  if (!vnpayConfig.vnp_HashSecret) {
    throw new Error("VNPAY_HASH_SECRET không được để trống trong file .env");
  }
  return true;
};
