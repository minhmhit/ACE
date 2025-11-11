# API Client Library

Thư viện API client sử dụng Axios để gọi API backend cho hệ thống bán cà phê bột.

## Cài đặt

```bash
npm install axios
```

## Cấu hình

File `axiosConfig.js` đã được cấu hình sẵn với:

- Base URL: `http://localhost:3000/api/v1`
- Timeout: 10 giây
- Auto thêm Bearer token vào header
- Xử lý lỗi tự động (401, 403, 404, 500)

## Sử dụng

### Import API modules

```javascript
// Import riêng lẻ
import authAPI from "./api/authAPI";
import productAPI from "./api/productAPI";

// Hoặc import tất cả
import { authAPI, productAPI, cartAPI } from "./api";
```

### Ví dụ sử dụng

#### 1. Authentication

```javascript
// Đăng ký
const registerUser = async () => {
  try {
    const response = await authAPI.register({
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      password: "123456",
    });
    console.log("Đăng ký thành công:", response);
  } catch (error) {
    console.error("Đăng ký thất bại:", error);
  }
};

// Đăng nhập
const loginUser = async () => {
  try {
    const response = await authAPI.login({
      email: "nguyenvana@example.com",
      password: "123456",
    });
    console.log("Đăng nhập thành công:", response);
    // Token đã được lưu tự động vào localStorage
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
  }
};

// Lấy profile
const getProfile = async () => {
  try {
    const profile = await authAPI.getProfile();
    console.log("Profile:", profile);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 2. Products

```javascript
// Lấy tất cả sản phẩm
const fetchProducts = async () => {
  try {
    const products = await productAPI.getAllProducts();
    console.log("Danh sách sản phẩm:", products);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Tìm kiếm sản phẩm
const searchProducts = async () => {
  try {
    const results = await productAPI.searchProducts("arabica", 1, 10);
    console.log("Kết quả tìm kiếm:", results);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Thêm sản phẩm mới (Admin)
const createProduct = async () => {
  try {
    const newProduct = await productAPI.createProduct({
      name: "Cà phê Arabica Ethiopia",
      description: "Cà phê nguyên chất từ Ethiopia",
      price: 250000,
      categoryId: 1,
      supplierId: 1,
      imageUrl: "https://example.com/image.jpg",
    });
    console.log("Sản phẩm mới:", newProduct);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 3. Cart

```javascript
// Thêm vào giỏ hàng
const addToCart = async () => {
  try {
    const response = await cartAPI.addToCart({
      productId: 1,
      variantId: 2, // Optional
      quantity: 2,
    });
    console.log("Đã thêm vào giỏ:", response);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Lấy giỏ hàng
const getCart = async () => {
  try {
    const cart = await cartAPI.getCart();
    console.log("Giỏ hàng:", cart);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Cập nhật số lượng
const updateCart = async () => {
  try {
    const response = await cartAPI.updateCartItem(1, 5);
    console.log("Đã cập nhật:", response);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 4. Orders

```javascript
// Tạo đơn hàng
const createOrder = async () => {
  try {
    const order = await orderAPI.createOrder({
      cartItems: [
        {
          cartItemId: 1,
          productId: 1,
          quantity: 2,
        },
        {
          cartItemId: 3,
          productId: 4,
          quantity: 1,
        },
      ],
      couponId: 1, // Optional
    });
    console.log("Đơn hàng:", order);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Lấy danh sách đơn hàng
const getOrders = async () => {
  try {
    const orders = await orderAPI.getUserOrders(1, 10);
    console.log("Danh sách đơn hàng:", orders);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Hủy đơn hàng
const cancelOrder = async () => {
  try {
    const response = await orderAPI.cancelOrder(1);
    console.log("Đã hủy đơn hàng:", response);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 5. Admin - Quản lý đơn hàng

```javascript
// Lấy tất cả đơn hàng (Admin)
const getAllOrders = async () => {
  try {
    const orders = await orderAPI.getAllOrders(1, 10, "PENDING");
    console.log("Tất cả đơn hàng:", orders);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Cập nhật trạng thái đơn hàng (Admin)
const updateOrderStatus = async () => {
  try {
    const response = await orderAPI.updateOrderStatus(1, "COMPLETED");
    console.log("Đã cập nhật:", response);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 6. Suppliers (Warehouse)

```javascript
// Lấy danh sách nhà cung cấp
const getSuppliers = async () => {
  try {
    const suppliers = await supplierAPI.getAllSuppliers(1, 10);
    console.log("Nhà cung cấp:", suppliers);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Thêm nhà cung cấp mới
const createSupplier = async () => {
  try {
    const supplier = await supplierAPI.createSupplier({
      name: "Công ty TNHH Cà phê Việt Nam",
      code: "CPVN-001",
      address: "123 Đường ABC, TP.HCM",
      contactInfo: "Phone: 028-1234567",
    });
    console.log("Nhà cung cấp mới:", supplier);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 7. Imports (Warehouse)

```javascript
// Tạo phiếu nhập hàng
const createImport = async () => {
  try {
    const importData = await importAPI.createImport({
      importData: {
        supplier_id: 1,
        payment_status: "pending",
      },
      details: [
        {
          product_id: 1,
          quantity: 20,
          unit_price: 200000,
        },
        {
          product_id: 2,
          quantity: 15,
          unit_price: 180000,
        },
      ],
    });
    console.log("Phiếu nhập:", importData);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

// Cập nhật trạng thái thanh toán
const updatePayment = async () => {
  try {
    const response = await importAPI.updatePaymentStatus(1, "paid");
    console.log("Đã cập nhật:", response);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

#### 8. Coupons

```javascript
// Áp dụng mã giảm giá
const validateCoupon = async () => {
  try {
    const coupon = await couponAPI.validateCoupon("DISCOUNT50");
    console.log("Mã giảm giá:", coupon);
  } catch (error) {
    console.error("Mã không hợp lệ:", error);
  }
};

// Tạo mã giảm giá mới (Admin)
const createCoupon = async () => {
  try {
    const coupon = await couponAPI.createCoupon({
      code: "NEWYEAR2026",
      discountPercent: 30,
      validFrom: "2026-01-01T00:00:00",
      validUntil: "2026-01-31T23:59:59",
    });
    console.log("Mã giảm giá mới:", coupon);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

## Xử lý lỗi

Tất cả API calls đều trả về Promise. Nên sử dụng try-catch để xử lý lỗi:

```javascript
const handleAPICall = async () => {
  try {
    const data = await productAPI.getAllProducts();
    // Xử lý dữ liệu thành công
  } catch (error) {
    // Xử lý lỗi
    if (error.message) {
      console.error("Lỗi:", error.message);
    } else {
      console.error("Lỗi không xác định:", error);
    }
  }
};
```

## Token Management

- Token được lưu tự động vào `localStorage` khi đăng nhập thành công
- Token được tự động thêm vào header của mọi request
- Khi token hết hạn (401), user sẽ được redirect về trang login

## Các API có sẵn

1. **authAPI**: Xác thực, đăng ký, đăng nhập, profile
2. **productAPI**: Quản lý sản phẩm
3. **categoryAPI**: Quản lý danh mục
4. **cartAPI**: Giỏ hàng
5. **orderAPI**: Đơn hàng
6. **supplierAPI**: Nhà cung cấp
7. **couponAPI**: Mã giảm giá
8. **variantAPI**: Biến thể sản phẩm
9. **importAPI**: Nhập hàng
10. **inventoryAPI**: Tồn kho
11. **receiptAPI**: Hóa đơn
