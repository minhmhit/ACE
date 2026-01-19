/**
 * Helper functions cho VNPay
 */

/**
 * Format date theo định dạng VNPay yêu cầu: yyyyMMddHHmmss
 */
export function formatVnpayDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Lấy message từ VNPay response code
 */
export function getVnpayResponseMessage(responseCode) {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
    10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
    12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
    13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
    24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
    65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
    75: "Ngân hàng thanh toán đang bảo trì",
    79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
    99: "Các lỗi khác",
  };

  return messages[responseCode] || "Lỗi không xác định";
}

/**
 * Tạo transaction reference unique
 */
export function generateVnpayTxnRef(orderId) {
  return `${orderId}_${Date.now()}`;
}
