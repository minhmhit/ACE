import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:3000/api/v1";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Lỗi từ server
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Token hết hạn hoặc không hợp lệ
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else if (status === 403) {
        // Forbidden - Không có quyền truy cập
        console.error("Bạn không có quyền thực hiện thao tác này");
      } else if (status === 404) {
        // Not Found
        console.error("Không tìm thấy tài nguyên");
      } else if (status === 500) {
        // Server Error
        console.error("Lỗi server, vui lòng thử lại sau");
      }

      return Promise.reject(data || error.message);
    } else if (error.request) {
      // Không nhận được response từ server
      console.error("Không thể kết nối đến server");
      return Promise.reject("Không thể kết nối đến server");
    } else {
      // Lỗi khác
      console.error("Đã xảy ra lỗi:", error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosInstance;
