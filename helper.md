# Frontend Developer Handbook — Coffee OOAD API

**Ngày soạn:** 19/03/2026  
**Phiên bản API:** v1 (150+ endpoints)  
**Base URL:** `http://localhost:3000/api/v1`

---

## TOC

- [1. Giới thiệu & Thiết lập ban đầu](#1-giới-thiệu--thiết-lập-ban-đầu)
- [2. Authentication & Authorization](#2-authentication--authorization)
- [3. Response Format & Error Handling](#3-response-format--error-handling)
- [4. Pagination & Query Parameters](#4-pagination--query-parameters)
- [5. Data Models & Enums](#5-data-models--enums)
- [6. Workflows & State Machines](#6-workflows--state-machines)
- [7. Module Guide](#7-module-guide)
- [8. Frontend Implementation Tips](#8-frontend-implementation-tips)

---

## 1. Giới thiệu & Thiết lập ban đầu

### 1.1. Stack Backend

- **Runtime:** Node.js (ES6+ modules)
- **Framework:** Express.js 4.x
- **Database:** MySQL (`mysql2/promise`)
- **Auth:** JWT (access token 15m + refresh token 30d)
- **Validation:** `express-validator`
- **CORS:** Bật cho tất cả origins

### 1.2. Base Configuration

```tsx
// .env.ts (hoặc config)
const API_BASE_URL = "http://localhost:3000/api/v1";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
```

### 1.3. HTTP Client Setup

```tsx
// axiosInstance.ts (hoặc fetch wrapper)
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 10000,
});

// Interceptor để thêm access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý refresh token khi hết hạn
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Thử refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://localhost:3000/api/v1/auth/refresh",
            { refreshToken },
          );
          localStorage.setItem("accessToken", res.data.data.accessToken);
          // Retry request gốc
          return apiClient.request(err.config);
        } catch {
          // Logout nếu refresh thất bại
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  },
);

export default apiClient;
```

---

## 2. Authentication & Authorization

### 2.1. Login Flow

```tsx
// POST /auth/login
const response = await apiClient.post('/auth/login', {
  email: 'admin@coffee.local',
  password: 'Password@123',
});

// Response:
{
  success: true,
  message: 'Đăng nhập thành công',
  data: {
    user: {
      id: 1,
      email: 'admin@coffee.local',
      name: 'Nguyễn Văn Admin',
      roleId: 1,
      role: { code: 'ADMIN', name: 'admin' },
      isActive: true,
    },
    accessToken: 'eyJhbGc...',      // 15 phút
    refreshToken: 'eyJhbGc...',     // 30 ngày
  }
}

// Lưu vào localStorage
localStorage.setItem('accessToken', response.data.data.accessToken);
localStorage.setItem('refreshToken', response.data.data.refreshToken);
localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
```

### 2.2. Refresh Token

```tsx
// POST /auth/refresh
const response = await axios.post("http://localhost:3000/api/v1/auth/refresh", {
  refreshToken: localStorage.getItem("refreshToken"),
});

// Response: { accessToken, refreshToken, expiresIn }
localStorage.setItem("accessToken", response.data.data.accessToken);
```

### 2.3. Logout

```tsx
// POST /auth/logout (hoặc POST /auth/logout-all)
await apiClient.post("/auth/logout", {
  refreshToken: localStorage.getItem("refreshToken"),
});

// Clear local storage
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
localStorage.removeItem("currentUser");
```

### 2.4. Roles & Permissions

| Role ID | Code      | Tên                | Quyền chính                                    |
| ------- | --------- | ------------------ | ---------------------------------------------- |
| 1       | ADMIN     | Quản lý cấp cao    | Toàn quyền hệ thống, quản lý user, cấu hình    |
| 2       | USER      | Khách hàng         | Xem sản phẩm, đặt hàng, xem đơn hàng           |
| 3       | WAREHOUSE | Nhân viên kho      | Quản lý tồn kho, nhập xuất hàng                |
| 4       | SALE      | Nhân viên bán hàng | Quản lý đơn hàng, khách hàng, coupon           |
| 5       | HRM       | Quản lý nhân sự    | Quản lý nhân viên, lương, chấm công, nghỉ phép |

**Kiểm tra quyền trong frontend:**

```tsx
// Guard helper
function hasRole(user, requiredRoles) {
  if (!user) return false;
  return requiredRoles.includes(user.role.code);
}

// Usage
if (hasRole(currentUser, ["ADMIN", "HRM"])) {
  // Hiển thị form quản lý nhân viên
}
```

---

## 3. Response Format & Error Handling

### 3.1. Success Response

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {
    "id": 1,
    "name": "Sản phẩm A",
    "price": 150000
  }
}
```

### 3.2. List Response with Pagination

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.3. Error Response

```json
{
  "success": false,
  "error": "Lỗi xác thực",
  "message": "Email hoặc mật khẩu sai",
  "details": null
}
```

### 3.4. Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 3.5. HTTP Status Codes

| Code | Ý nghĩa      | Xử lý                                                           |
| ---- | ------------ | --------------------------------------------------------------- |
| 200  | OK           | Thành công                                                      |
| 201  | Created      | Tạo mới thành công                                              |
| 400  | Bad Request  | Validation hoặc request không hợp lệ → hiện error message       |
| 401  | Unauthorized | Token hết hạn hoặc không có → refresh token hoặc redirect login |
| 403  | Forbidden    | Không có quyền → hiện "Truy cập bị từ chối"                     |
| 404  | Not Found    | Resource không tồn tại → redirect 404 page                      |
| 500  | Server Error | Lỗi backend → hiện "Đã xảy ra lỗi" + log                        |

### 3.6. Error Handling Hook (React)

```tsx
// hooks/useApi.ts
import { useState } from "react";
import apiClient from "../apiClient";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = { method, url };
      if (data) config.data = data;
      const res = await apiClient(config);
      return res.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đã xảy ra lỗi";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
}
```

---

## 4. Pagination & Query Parameters

### 4.1. Pagination Pattern

```tsx
// GET /products?page=1&limit=20
// GET /employees?page=1&limit=20&status=ACTIVE&search=nguyễn

interface PaginationParams {
  page?: number; // Mặc định: 1
  limit?: number; // Mặc định: 10-50 (tùy endpoint), max: 100-200
}

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### 4.2. Query Parameters by Module

| Module         | Query Params                                        | Ví dụ                                                     |
| -------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Products       | `page`, `limit`, `search`                           | `/product/search?keyword=cà%20phê&page=1&limit=20`        |
| Employees      | `page`, `limit`, `search`, `status`, `departmentId` | `/employees?page=1&limit=20&status=ACTIVE&departmentId=1` |
| Attendance     | `month`, `year`, `page`, `limit`, `employeeId`      | `/attendance?month=3&year=2026&page=1&limit=50`           |
| Orders         | `page`, `limit`                                     | `/orders?page=1&limit=10`                                 |
| Payments       | `page`, `limit`                                     | `/payments?page=1&limit=20`                               |
| Dashboard      | `from`, `to`, `limit`, `recentLimit`                | `/dashboard/sales?from=2026-03-01&to=2026-03-31`          |
| Leave Requests | `page`, `limit`                                     | `/leave-requests/pending?page=1&limit=20`                 |

### 4.3. Frontend Helper

```tsx
// utils/queryBuilder.ts
export function buildQuery(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
}

// Usage
const query = buildQuery({ page: 1, limit: 20, status: "ACTIVE" });
const url = `/employees?${query}`;
```

---

## 5. Data Models & Enums

### 5.1. User Model

```ts
interface User {
  id: number;
  email: string;
  username?: string;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  roleId: number;
  role: {
    id: number;
    code: "ADMIN" | "USER" | "WAREHOUSE" | "SALE" | "HRM";
    name: string;
  };
  createdAt: string; // ISO datetime
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}
```

### 5.2. Product Model

```ts
interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // VND
  imageUrl?: string;
  categoryId: number;
  supplierId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Variant {
  id: number;
  productId: number;
  name: string; // Ví dụ: "Size L", "Đá", "Sữa"
  additionalPrice: number; // Giá tăng thêm
}
```

### 5.3. Order Model

```ts
interface Order {
  id: number;
  orderDate: string; // ISO datetime
  shipAddress: string;
  status: "PENDING" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  totalAmount: number; // VND
  userId: number;
  couponId?: number;
  items: OrderItem[]; // populated khi get chi tiết
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
}
```

### 5.4. Payment Model

```ts
interface Payment {
  id: number;
  orderId: number;
  paymentMethodId: number; // 1=CASH, 2=CARD, 3=MOMO, 4=VNPAY, 5=PAYPAL
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number; // VND
  transactionId?: string;
  createdAt: string;
  updatedAt: string;

  // Payment details (tùy phương thức)
  cardDetails?: {
    cardType: string; // VISA, MASTERCARD, etc
    last4Digits: string; // "4242"
    cardHolderName: string;
    bankName: string;
  };
  ewalletDetails?: {
    provider: "MOMO" | "VNPAY" | "ZALOPAY" | "PAYPAL";
    transactionId: string;
    responseCode?: string;
  };
}

const PAYMENT_METHODS = [
  { id: 1, code: "CASH", name: "Tiền mặt" },
  { id: 2, code: "CARD", name: "Thẻ ngân hàng" },
  { id: 3, code: "MOMO", name: "Ví MoMo" },
  { id: 4, code: "VNPAY", name: "VNPay" },
  { id: 5, code: "PAYPAL", name: "PayPal" },
];
```

### 5.5. HR Models

```ts
interface Department {
  id: number;
  code: string; // "HR", "SALES", "WAREHOUSE"
  name: string;
  description?: string;
  manager_employee_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Position {
  id: number;
  code: string; // "DIRECTOR", "HR_MANAGER", "SALES_STAFF"
  name: string;
  description?: string;
  level_no: number; // 1=cao nhất, 3=thấp
  is_active: boolean;
}

interface Employee {
  id: number;
  user_id: number;
  employee_code: string; // "EMP_001"
  department_id: number;
  employment_type: "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACT";
  status: "PROBATION" | "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "TERMINATED";
  hire_date: string; // YYYY-MM-DD
  official_date?: string;
  termination_date?: string;
  base_salary: number; // VND
  allowance_amount: number; // VND
  user: User;
  department: Department;
  current_position?: Position;
}

interface EmployeePositionHistory {
  id: number;
  employee_id: number;
  position_id: number;
  department_id: number;
  effective_from: string; // ISO datetime
  effective_to?: string; // null nếu còn hiệu lực
  base_salary: number;
  allowance_amount: number;
  salary_type: "MONTHLY" | "DAILY" | "HOURLY";
  changed_reason?: string; // "Thăng chức", "Chuyển đơn vị"
}
```

### 5.6. Attendance & Leave

```ts
interface Attendance {
  id: number;
  employee_id: number;
  work_date: string; // YYYY-MM-DD
  check_in?: string; // ISO datetime
  check_out?: string;
  work_minutes: number;
  overtime_minutes: number;
  status:
    | "PRESENT"
    | "ABSENT"
    | "PAID_LEAVE"
    | "UNPAID_LEAVE"
    | "SICK_LEAVE"
    | "MATERNITY_LEAVE"
    | "HOLIDAY";
  note?: string;
}

interface LeaveType {
  id: number;
  code: string; // "ANNUAL", "SICK", "UNPAID"
  name: string;
  is_paid: boolean; // Tính lương hay không
  requires_attachment: boolean;
  max_days_per_year?: number;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  total_days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approved_by_employee_id?: number;
  rejected_reason?: string;
  created_at: string;
}

interface ResignationRequest {
  id: number;
  employee_id: number;
  desired_last_working_date: string; // YYYY-MM-DD
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approved_by_employee_id?: number;
  rejected_reason?: string;
}
```

### 5.7. Payroll

```ts
interface PayrollPeriod {
  id: number;
  code: string; // "2026-03"
  month_no: number; // 1-12
  year_no: number; // 2026
  start_date: string; // YYYY-MM-DD
  end_date: string;
  payment_date?: string;
  status: "OPEN" | "LOCKED" | "PAID";
  created_at: string;
}

interface Payroll {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  position_history_id: number;
  base_salary: number; // VND
  allowance_total: number;
  bonus_total: number;
  deduction_total: number;
  gross_salary: number; // = base + allowance + bonus - deduction
  insurance_amount: number;
  tax_amount: number;
  net_salary: number; // = gross - insurance - tax
  payable_salary: number; // thực lĩnh
  status: "DRAFT" | "FINALIZED" | "PAID";
  generated_at?: string;
  items?: PayrollItem[]; // Chi tiết lương
}

interface PayrollItem {
  id: number;
  payroll_id: number;
  item_type:
    | "BASE"
    | "ALLOWANCE"
    | "BONUS"
    | "DEDUCTION"
    | "INSURANCE"
    | "TAX"
    | "OTHER";
  item_code: string; // "BASE_SALARY", "ALLOWANCE", "BONUS"
  item_name: string;
  amount: number;
  formula_text?: string;
}
```

---

## 6. Workflows & State Machines

### 6.1. Order Workflow

```
PENDING ─→ SHIPPING ─→ COMPLETED
  ↓
  └─→ CANCELLED (bất kỳ lúc nào từ PENDING)
```

**Frontend Logic:**

- Nhân viên bán hàng: tạo order (PENDING), update status
- Khách hàng: xem order, hủy (nếu PENDING)
- Admin: xem tất cả, quản lý trạng thái

### 6.2. Payment Workflow

```
PENDING ─→ SUCCESS
  ↓
  └─→ FAILED
```

**Frontend:**

- Sau tạo order → tạo payment (PENDING)
- Nếu CASH: Payment tạo luôn SUCCESS
- Nếu CARD/MOMO/VNPAY: redirect sang cổng thanh toán → callback
- Hiển thị trạng thái payment

### 6.3. Leave Request Workflow

```
PENDING ─→ APPROVED
  ↓          ↓
  ├─→ REJECTED
  │
  └─→ CANCELLED (nhân viên tự huỷ)
```

**Trạng thái & người có quyền:**

- PENDING: nhân viên đệ trình
- APPROVED/REJECTED: HRM/ADMIN phê duyệt
- CANCELLED: nhân viên tự huỷ lúc còn PENDING

### 6.4. Resignation Request Workflow

```
PENDING ─→ APPROVED ─→ (employee status = RESIGNED)
  ↓          ↓
  ├─→ REJECTED    (employee status stays ACTIVE)
  │
  └─→ CANCELLED (nhân viên tự huỷ)
```

### 6.5. Employee Position Change

```
CREATE position_history (effective_from = ngày có hiệu lực)
  ↓
SET effective_to = null pada entry hiện tại
  ↓
Update employee.base_salary, department
```

---

## 7. Module Guide

### 7.1. Auth Module

**Endpoints:**

- POST `/auth/register` — Đăng ký (công khai)
- POST `/auth/login` — Đăng nhập
- POST `/auth/refresh` — Làm mới token
- POST `/auth/logout` — Đăng xuất 1 thiết bị
- POST `/auth/logout-all` — Đăng xuất toàn bộ
- GET `/auth/me` — Xem thông tin cá nhân
- PATCH `/auth/me/profile` — Cập nhật profile
- PATCH `/auth/me/password` — Đổi mật khẩu
- GET `/auth/sessions` — Xem các session
- DELETE `/auth/sessions/{id}` — Huỷ session

**Frontend:**

```tsx
// Login
const loginUser = async (email, password) => {
  const res = await apiClient.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", res.data.data.accessToken);
  localStorage.setItem("refreshToken", res.data.data.refreshToken);
  return res.data.data.user;
};

// Get current user
const getCurrentUser = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data.data;
};

// Logout
const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  await apiClient.post("/auth/logout", { refreshToken });
  localStorage.clear();
};
```

### 7.2. Product & Catalog

**Endpoints:**

- GET `/category` — Danh sách danh mục
- GET `/category/{id}` — Chi tiết danh mục
- POST `/category/add` — Tạo danh mục (ADMIN)
- PUT `/category/update/{id}` — Cập nhật danh mục (ADMIN)
- DELETE `/category/delete/{id}` — Xoá danh mục (ADMIN)
- GET `/product?page=1&limit=20` — Danh sách sản phẩm
- GET `/product/search?keyword=cà%20phê&page=1&limit=20` — Tìm kiếm
- GET `/product/{id}` — Chi tiết sản phẩm
- POST `/product/add` — Tạo sản phẩm (ADMIN/WAREHOUSE)
- PUT `/product/update/{id}` — Cập nhật sản phẩm (ADMIN/WAREHOUSE)
- DELETE `/product/delete/{id}` — Xoá sản phẩm (ADMIN/WAREHOUSE)
- GET `/variants/product/{productId}` — Danh sách variant
- GET `/variants/{id}` — Chi tiết variant
- POST `/variants` — Tạo variant (ADMIN)
- PUT `/variants/{id}` — Cập nhật variant (ADMIN)
- DELETE `/variants/{id}` — Xoá variant (ADMIN)

**Frontend:**

```tsx
// Hiển thị danh sách sản phẩm
const [products, setProducts] = useState([]);
const [pagination, setPagination] = useState({ page: 1, limit: 20 });

useEffect(() => {
  const fetchProducts = async () => {
    const res = await apiClient.get(
      `/product?page=${pagination.page}&limit=${pagination.limit}`,
    );
    setProducts(res.data.data);
    setPagination(res.data.pagination);
  };
  fetchProducts();
}, [pagination.page]);

// Search
const handleSearch = async (keyword) => {
  const res = await apiClient.get(
    `/product/search?keyword=${keyword}&page=1&limit=20`,
  );
  setProducts(res.data.data);
};

// Get chi tiết + variants
const getProductDetail = async (id) => {
  const [product, variants] = await Promise.all([
    apiClient.get(`/product/${id}`),
    apiClient.get(`/variants/product/${id}`),
  ]);
  return {
    ...product.data.data,
    variants: variants.data.data,
  };
};
```

### 7.3. Cart

**Endpoints:**

- GET `/cart` — Lấy giỏ hàng (USER)
- POST `/cart/add` — Thêm sản phẩm
- PUT `/cart/update/{id}` — Cập nhật số lượng
- DELETE `/cart/remove/{id}` — Xoá 1 sản phẩm
- DELETE `/cart/clear` — Xoá toàn bộ

**Body for POST /cart/add:**

```json
{
  "productId": 1,
  "quantity": 2,
  "variantId": null
}
```

**Frontend:**

```tsx
const addToCart = async (productId, quantity, variantId = null) => {
  const res = await apiClient.post("/cart/add", {
    productId,
    quantity,
    variantId,
  });
  // Cập nhật cart count, show toast
  setCartCount((prev) => prev + quantity);
};
```

### 7.4. Orders & Checkout

**Endpoints:**

- POST `/orders/add` — Tạo đơn hàng
- GET `/orders` — Lấy đơn hàng của mình
- GET `/orders/{id}` — Chi tiết đơn hàng
- PUT `/orders/{id}/cancel` — Hủy đơn hàng (PENDING → CANCELLED)
- GET `/orders/admin/all?page=1&limit=20` — Toàn bộ đơn (ADMIN/SALE)
- PUT `/orders/{id}/status` — Update status (ADMIN/SALE)

**Body for POST /orders/add:**

```json
{
  "cartItems": [{ "cartItemId": 1, "productId": 1, "quantity": 2 }],
  "shipAddress": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "couponId": null
}
```

**Frontend Checkout:**

```tsx
const checkout = async (cartItems, shipAddress, couponId) => {
  try {
    const res = await apiClient.post("/orders/add", {
      cartItems,
      shipAddress,
      couponId,
    });
    const order = res.data.data;

    // Clear cart
    await apiClient.delete("/cart/clear");

    // Redirect to payment
    navigate(`/payment/${order.id}`);
  } catch (error) {
    showError(error.response?.data?.message);
  }
};
```

### 7.5. Payments

**Endpoints:**

- GET `/payments/methods` — Danh sách phương thức thanh toán
- POST `/payments` — Tạo payment
- GET `/payments/history` — Lịch sử thanh toán của mình
- GET `/payments/order/{orderId}` — Payment của 1 order
- GET `/payments?page=1&limit=20` — Toàn bộ payment (ADMIN)
- GET `/payments/{id}` — Chi tiết payment
- POST `/payments/{id}/confirm` — Xác nhận thanh toán (ADMIN)
- POST `/payments/{id}/fail` — Đánh dấu thất bại (ADMIN)
- GET `/payments/vnpay/return` — Callback từ VNPay (redirect)
- GET `/payments/vnpay/ipn` — IPN từ VNPay

**Frontend Flow:**

```tsx
// Step 1: Create payment
const createPayment = async (orderId, paymentMethodId, details = {}) => {
  const res = await apiClient.post("/payments", {
    orderId,
    paymentMethodId,
    ...details,
  });
  return res.data.data;
};

// Step 2: Nếu CASH → hoàn tất (payment.status = SUCCESS)
// Step 3: Nếu CARD/MOMO/VNPAY → Redirect sang cổng
// Step 4: Sau IPN/callback → Backend cập nhật status
// Step 5: Frontend poll /payments/{id} hoặc WebSocket để xem status

// Poll status
const pollPaymentStatus = async (paymentId) => {
  const checkStatus = async () => {
    const res = await apiClient.get(`/payments/${paymentId}`);
    if (res.data.data.status === "SUCCESS") {
      showSuccess("Thanh toán thành công");
      navigate("/orders");
    } else if (res.data.data.status === "FAILED") {
      showError("Thanh toán thất bại");
    }
  };

  const interval = setInterval(checkStatus, 2000);
  setTimeout(() => clearInterval(interval), 60000); // 60 giây
};
```

### 7.6. HR Module

**Departments:**

- GET `/departments`
- GET `/departments/{id}`
- POST `/departments` (ADMIN/HRM)
- PATCH `/departments/{id}` (ADMIN/HRM)
- PATCH `/departments/{id}/active` (ADMIN/HRM)

**Positions:**

- GET `/positions`
- GET `/positions/{id}`
- POST `/positions` (ADMIN/HRM)
- PATCH `/positions/{id}` (ADMIN/HRM)
- PATCH `/positions/{id}/active` (ADMIN/HRM)

**Employees:**

- GET `/employees/me` (tất cả employee)
- PATCH `/employees/me` (cập nhật thông tin cá nhân)
- GET `/employees?page=1&limit=20&status=ACTIVE&departmentId=1` (ADMIN/HRM)
- GET `/employees/{id}` (ADMIN/HRM)
- POST `/employees` (ADMIN/HRM)
- PATCH `/employees/{id}` (ADMIN/HRM)
- PATCH `/employees/{id}/status` (ADMIN/HRM) — update status
- GET `/employees/{id}/position-history` — Lịch sử chức vụ/lương
- GET `/employees/{id}/current-position` — Chức vụ hiện tại
- POST `/employees/{id}/position-history` — Thêm lịch sử (đổi chức vụ/lương)

**Body for POST /employees:**

```json
{
  "name": "Trần Văn Mới",
  "email": "tranvanmoi@coffee.local",
  "password": "Password@123",
  "roleId": 4,
  "department_id": 3,
  "position_id": 5,
  "hire_date": "2026-03-14",
  "employment_type": "FULL_TIME",
  "base_salary": 12000000,
  "allowance_amount": 1000000
}
```

### 7.7. Leave & Resignation

**Leave Types:**

- GET `/leave-types`
- POST `/leave-types` (ADMIN/HRM)
- PATCH `/leave-types/{id}` (ADMIN/HRM)

**Leave Requests:**

- GET `/leave-requests/me` (nhân viên xem của mình)
- POST `/leave-requests` (tạo đơn)
- PATCH `/leave-requests/{id}/cancel` (tự huỷ)
- GET `/leave-requests/pending` (ADMIN/HRM xem đơn chờ)
- PATCH `/leave-requests/{id}/approve` (ADMIN/HRM phê duyệt)
- PATCH `/leave-requests/{id}/reject` (ADMIN/HRM từ chối + lý do)

**Body for POST /leave-requests:**

```json
{
  "leave_type_id": 1,
  "request_type": "ANNUAL_LEAVE",
  "start_date": "2026-04-01",
  "end_date": "2026-04-02",
  "total_days": 2,
  "reason": "Nghỉ phép cá nhân"
}
```

**Resignation Requests:**

- GET `/resignation-requests/me`
- POST `/resignation-requests`
- PATCH `/resignation-requests/{id}/cancel`
- GET `/resignation-requests/pending`
- PATCH `/resignation-requests/{id}/approve`
- PATCH `/resignation-requests/{id}/reject`

### 7.8. Attendance

**Endpoints:**

- POST `/attendance/check-in` (nhân viên check-in)
- POST `/attendance/check-out` (check-out)
- GET `/attendance/me?month=3&year=2026` (xem chấm công của mình)
- GET `/attendance?month=3&year=2026&page=1&limit=50` (ADMIN/HRM)
- POST `/attendance/manual` (ADMIN/HRM tạo bản ghi thủ công)
- PATCH `/attendance/{id}` (ADMIN/HRM cập nhật)

**Frontend:**

```tsx
const checkIn = async () => {
  const res = await apiClient.post("/attendance/check-in");
  showSuccess("Check-in thành công");
};

const getMyAttendance = async (month, year) => {
  const res = await apiClient.get(`/attendance/me?month=${month}&year=${year}`);
  return res.data.data; // { attendances, pagination, summary }
};
```

### 7.9. Payroll

**Payroll Periods:**

- GET `/payroll-periods`
- GET `/payroll-periods/{id}`
- POST `/payroll-periods` (ADMIN/HRM tạo kỳ lương)
- PATCH `/payroll-periods/{id}` (cập nhật thông tin kỳ)
- PATCH `/payroll-periods/{id}/lock` (khóa không cho sửa)
- PATCH `/payroll-periods/{id}/mark-paid` (đánh dấu đã thanh toán)

**Payrolls:**

- POST `/payrolls/generate` (tạo lương cho toàn bộ nhân viên trong kỳ)
- GET `/payrolls?payroll_period_id=3` (danh sách lương)
- GET `/payrolls/{id}` (chi tiết 1 phiếu lương)
- GET `/payrolls/statistics?payroll_period_id=3` (thống kê kỳ)
- PATCH `/payrolls/{id}/finalize` (hoàn thiện 1 phiếu)
- PATCH `/payrolls/{id}/mark-paid` (đánh dấu đã thanh toán 1 phiếu)
- POST `/payrolls/finalize-period` (hoàn thiện toàn bộ kỳ)
- GET `/payrolls/admin/{employeeId}/monthly-slip?month=2&year=2026` (bảng lương tháng)
- GET `/payrolls/admin/{employeeId}/yearly-summary?year=2026` (tổng hợp năm)
- GET `/payrolls/me?month=2&year=2026` (xem lương của mình)
- GET `/payrolls/me/yearly?year=2026`
- GET `/payrolls/me/monthly-slip?month=2&year=2026`
- GET `/payrolls/me/yearly-summary?year=2026`

**Frontend:**

```tsx
// Bảng lương của nhân viên
const getSalarySlip = async (month, year) => {
  const res = await apiClient.get(
    `/payrolls/me/monthly-slip?month=${month}&year=${year}`,
  );
  return res.data.data; // { payroll, items: [...] }
};
```

### 7.10. Dashboard

**Endpoints:**

- GET `/dashboard/overview` — Tổng quan (thống kê nhanh)
- GET `/dashboard/sales?from=2026-03-01&to=2026-03-31` — Thống kê bán hàng
- GET `/dashboard/orders?recentLimit=10` — Thống kê đơn hàng
- GET `/dashboard/products/top?from=2026-03-01&to=2026-03-31&limit=10` — Sản phẩm bán chạy
- GET `/dashboard/products/low-stock?threshold=10` — Sản phẩm sắp hết
- GET `/dashboard/hr` — Thống kê nhân sự
- GET `/dashboard/payroll?periodId=3` — Thống kê lương

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "totalRevenue": 45000000,
      "totalUsers": 200,
      "totalEmployees": 15
    },
    "sales": {
      "totalSales": 45000000,
      "orderCount": 150,
      "averageOrderValue": 300000
    }
  }
}
```

---

## 8. Frontend Implementation Tips

### 8.1. State Management

**Recommend: Redux Toolkit + React Query**

```tsx
// Redux slices
// slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data.data;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
    });
  },
});
```

**React Query for API calls:**

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useGetProducts = (page, limit) => {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/product?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
};

const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post("/product/add", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

### 8.2. Form Validation

**Recommend: React Hook Form + Zod/Yup**

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";

const createOrderSchema = z.object({
  shipAddress: z.string().min(5, "Địa chỉ phải từ 5 ký tự"),
  couponId: z.number().optional(),
});

const CreateOrderForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createOrderSchema),
  });

  const onSubmit = async (data) => {
    // call API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("shipAddress")} />
      {errors.shipAddress && <p>{errors.shipAddress.message}</p>}
    </form>
  );
};
```

### 8.3. Error Handling & Toast Notifications

```tsx
// Create toast service
import { toast } from "react-toastify";

export const showError = (message) => {
  toast.error(message, { position: "top-right", autoClose: 3000 });
};

export const showSuccess = (message) => {
  toast.success(message, { autoClose: 2000 });
};

// Use in components
try {
  await checkIn();
  showSuccess("Check-in thành công");
} catch (error) {
  showError(error.response?.data?.message || "Lỗi hệ thống");
}
```

### 8.4. Private Routes & Role-Based Access

```tsx
// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role.code)) {
    return <Navigate to="/forbidden" />;
  }

  return children;
};

// Usage
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute requiredRoles={["ADMIN", "HRM"]}>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>;
```

### 8.5. Date/Time Formatting

```tsx
// utils/dateHelper.ts
export const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');
export const formatDateTime = (date) =>
  new Date(date).toLocaleString('vi-VN');
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

// Usage
<span>{formatCurrency(product.price)}</span>
<span>{formatDate(order.orderDate)}</span>
```

### 8.6. Data Mapping & Enums

```tsx
// constants/enums.ts
export const ORDER_STATUS = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  SHIPPING: { label: "Đang giao", color: "info" },
  COMPLETED: { label: "Hoàn tất", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "danger" },
};

export const LEAVE_STATUS = {
  PENDING: { label: "Chờ phê duyệt", color: "warning" },
  APPROVED: { label: "Được phê duyệt", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "danger" },
  CANCELLED: { label: "Đã huỷ", color: "secondary" },
};

// Usage
<Badge color={ORDER_STATUS[order.status].color}>
  {ORDER_STATUS[order.status].label}
</Badge>;
```

### 8.7. Performance Optimization

**Memo & useMemo:**

```tsx
const ProductCard = memo(
  ({ product, onAddCart }) => {
    return (
      <div>
        <h3>{product.name}</h3>
        <p>{formatCurrency(product.price)}</p>
        <button onClick={() => onAddCart(product.id)}>Thêm vào giỏ</button>
      </div>
    );
  },
  (prev, next) => prev.product.id === next.product.id,
);
```

**Lazy Loading:**

```tsx
import { lazy, Suspense } from "react";

const AdminPanel = lazy(() => import("./AdminPanel"));

<Routes>
  <Route
    path="/admin"
    element={
      <Suspense fallback={<Loading />}>
        <AdminPanel />
      </Suspense>
    }
  />
</Routes>;
```

**Virtual Lists for Long Lists:**

```tsx
// Use react-window for large lists
import { FixedSizeList as List } from "react-window";

<List height={600} itemCount={employees.length} itemSize={80} width="100%">
  {({ index, style }) => <div style={style}>{employees[index].name}</div>}
</List>;
```

### 8.8. API Caching Strategy

```tsx
// Cache user data for 5 minutes
const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/me");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};
```

### 8.9. WebSocket for Real-time Updates (Optional)

```tsx
// services/socket.ts
import io from "socket.io-client";

export const socket = io("http://localhost:3000");

// Usage: Listen for attendance check-in updates
socket.on("attendance:checked_in", (data) => {
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
});
```

### 8.10. Testing

```tsx
// __tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";

describe("LoginPage", () => {
  it("should display error on invalid credentials", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", /login/i));

    await waitFor(() => {
      expect(screen.getByText(/email hoặc mật khẩu sai/i)).toBeInTheDocument();
    });
  });
});
```

---

## 9. Quick Reference

### API Call Examples

```tsx
// Products
GET /product?page=1&limit=20
GET /product/search?keyword=cà+phê
POST /product/add { name, price, categoryId, supplierId }

// Orders
POST /orders/add { cartItems, shipAddress, couponId }
GET /orders
GET /orders/1

// Employees (HRM only)
GET /employees?page=1&limit=20&status=ACTIVE
POST /employees { name, email, roleId, departmentId, position_id, base_salary }
POST /employees/1/position-history { position_id, base_salary, effective_from }

// Payroll
POST /payrolls/generate { payroll_period_id }
GET /payrolls/me/monthly-slip?month=3&year=2026

// Dashboard
GET /dashboard/overview
GET /dashboard/sales?from=2026-03-01&to=2026-03-31
GET /dashboard/products/top?limit=10
```

### Common Headers

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Postman Collection

Import file `ooad.postman_collection.json` đã có đầy đủ 150+ requests.

---

## 10. Support & Debugging

### Check Backend Logs

```bash
# Terminal backend
npm run dev
# Xem console log chi tiết
```

### Common Issues

| Vấn đề           | Nguyên nhân                  | Giải pháp                       |
| ---------------- | ---------------------------- | ------------------------------- |
| 401 Unauthorized | Token hết hạn                | Refresh token hoặc re-login     |
| 403 Forbidden    | Không có quyền               | Kiểm tra role của user          |
| 400 Bad Request  | Validation fail              | Kiểm tra request body theo docs |
| 500 Server Error | Backend crash                | Kiểm tra backend logs           |
| CORS error       | Frontend URL không được phép | Kiểm tra CORS config backend    |

### Test API Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Postman hoặc curl
curl -X GET http://localhost:3000/api/v1/category

# Hoặc dùng Postman collection
```

---

**Chúc các bạn phát triển frontend thành công! 🚀**

---

## 11. Update Nghiệp Vụ COD/VNPAY (06/04/2026)

Phần này mô tả đúng các thay đổi backend đã áp dụng để sửa sai nghiệp vụ thanh toán.

### 11.1. Các thay đổi chính

- API tạo đơn `POST /orders/add` nhận thêm field optional `paymentMethodCode` với 2 giá trị: `COD` hoặc `VNPAY`.
- Mặc định nếu không truyền `paymentMethodCode` thì backend xử lý như `COD` để không làm gãy flow cũ.
- Với `VNPAY`, tạo đơn xong sẽ trả thêm thông tin payment (`paymentId`, `paymentUrl`, ...).

### 11.2. Flow COD sau sửa

Khi `paymentMethodCode = COD`:

1. Tạo order.
2. Tạo order items từ cart items được chọn.
3. Trừ inventory ngay.
4. Xóa/giảm item trong cart ngay.
5. Commit.

Lưu ý:

- Đây là flow finalize ngay (giữ gần như logic cũ).
- Order vẫn ở status `PENDING` theo enum hiện tại của DB.

### 11.3. Flow VNPAY create order sau sửa

Khi `paymentMethodCode = VNPAY`:

1. Tạo order (`PENDING` - dùng như trạng thái chờ thanh toán).
2. Tạo order items.
3. Tạo payment transaction VNPAY (`PENDING`).
4. Trả về `paymentUrl` để frontend redirect sang VNPay.

Điểm quan trọng:

- Chưa trừ inventory ở bước này.
- Chưa xóa cart ở bước này.
- Chưa finalize bán hàng ở bước này.

### 11.4. Flow return URL sau sửa

Endpoint: `GET /payments/vnpay/return`

- Chỉ verify chữ ký/thông tin trả về và trả trạng thái để UI hiển thị.
- Không update final payment/order tại đây.
- Không trừ kho, không xóa cart tại đây.

Frontend nên hiểu:

- Return URL chỉ là màn hình kết quả trung gian.
- Trạng thái cuối cùng phải dựa vào IPN hoặc gọi lại API lấy payment/order.

### 11.5. Flow IPN success/fail sau sửa

Endpoint: `GET /payments/vnpay/ipn`

IPN success (`vnp_ResponseCode = 00`):

1. Update payment -> `SUCCESS`.
2. Finalize order:
   - Trừ inventory theo `order_items`.
   - Giảm/xóa cart item tương ứng.
   - Chuyển order -> `COMPLETED`.
3. Tạo receipt nếu chưa có.
4. Commit transaction.

IPN fail/cancel/timeout:

1. Update payment -> `FAILED`.
2. Chuyển order -> `CANCELLED`.
3. Không trừ inventory.
4. Không xóa cart.

### 11.6. Idempotency (tránh trừ kho 2 lần)

- Backend đã chặn xử lý trùng callback theo trạng thái payment/order:
  - Nếu payment đã `SUCCESS` thì IPN lặp không finalize lại.
  - Finalize order có check trạng thái `COMPLETED` để bỏ qua xử lý lặp.

### 11.7. Request/Response mẫu cho frontend

Request tạo đơn COD:

```json
{
  "cartItems": [{ "cartItemId": 1, "productId": 10, "quantity": 2 }],
  "shipAddress": "123 Nguyen Hue",
  "couponId": null,
  "paymentMethodCode": "COD"
}
```

Request tạo đơn VNPAY:

```json
{
  "cartItems": [{ "cartItemId": 1, "productId": 10, "quantity": 2 }],
  "shipAddress": "123 Nguyen Hue",
  "couponId": null,
  "paymentMethodCode": "VNPAY"
}
```

Response tạo đơn VNPAY (rút gọn):

```json
{
  "success": true,
  "message": "Đặt hàng thành công",
  "data": {
    "id": 123,
    "status": "PENDING",
    "payment": {
      "paymentId": 456,
      "paymentUrl": "https://sandbox.vnpayment.vn/...",
      "orderId": 123,
      "amount": 250000
    }
  }
}
```
