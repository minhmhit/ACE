import axiosInstance from "./axiosConfig";

const authAPI = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    return await axiosInstance.post("/auth/register", userData);
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem("accessToken", response.token);
    }
    return response;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  },

  // Lấy thông tin profile
  getProfile: async () => {
    return await axiosInstance.get("/auth/users/profile");
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    return await axiosInstance.put("/users/profile", profileData);
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axiosInstance.put("/auth/users/password", passwordData);
  },

  // Admin: Lấy danh sách users
  getAllUsers: async () => {
    return await axiosInstance.get("/auth/users/");
  },

  // Admin: Cập nhật trạng thái user
  updateUserStatus: async (userId, isActive) => {
    return await axiosInstance.put(`/auth/users/${userId}/status`, {
      isActive,
    });
  },
};

export default authAPI;
