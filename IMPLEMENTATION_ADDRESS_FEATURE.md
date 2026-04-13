# Hướng dẫn implement: Quản lý địa chỉ giao hàng

## 📋 Tổng quan các thay đổi

Đã implement chức năng cho phép khách hàng:
- Chọn từ danh sách địa chỉ đã lưu hoặc thêm địa chỉ mới
- Phân loại địa chỉ thành 2 loại: **Nhà riêng** (home) và **Văn phòng** (office)
- Lưu địa chỉ vào bảng `addresses` để tái sử dụng

## 🗄️ Database Changes

### 1. Thêm cột `address_id` vào bảng `orders`

**Chạy script migration:**
```bash
# Copy đoạn SQL sau vào MySQL client hoặc chạy file:
# d:\Prj\ACE\alter_orders_add_address_id.sql
```

```sql
ALTER TABLE `orders` 
ADD COLUMN `address_id` INT(11) DEFAULT NULL AFTER `shipAddress`,
ADD CONSTRAINT `fk_orders_addresses` 
  FOREIGN KEY (`address_id`) 
  REFERENCES `addresses` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
```

## 🔙 Backend Changes

### 1. **AddressController** - Thêm endpoint lấy địa chỉ mặc định
- ✅ Thêm function `getDefaultAddress()`
- Route: `GET /address/default`

### 2. **AddressService** - Thêm hàm lấy địa chỉ mặc định
- ✅ Thêm function `getDefaultAddress(userId)`
- Sử dụng `UserModel.getDefaultAddressByUserId()` (đã tồn tại)

### 3. **AddressRoutes** - Đăng ký route mới
- ✅ Thêm: `router.get("/default", authenticate, AddressController.getDefaultAddress);`
- **Important:** Route này PHẢI được đặt trước route `/:id` để tránh conflict

### 4. **OrderModel** - Lưu `address_id`
- ✅ Câu INSERT thêm cột `address_id`
- Dữ liệu: `orderData.addressId`

### 5. **OrderService** - Xử lý addressId hoặc newAddress
- ✅ Import `AddressService` và `UserModel`
- Logic:
  - Nếu `orderData.addressId`: Lấy từ DB, validate thuộc user
  - Nếu `orderData.newAddress`: Tạo address mới rồi lấy ID
  - Nếu cả đôi không có: Lỗi

### 6. **OrderController** - Truyền dữ liệu mới
- ✅ Thêm `addressId` và `newAddress` vào `orderData`

## 🎨 Frontend Changes

### 1. **addressAPI.js** - Tạo API service mới
- ✅ Tạo file: `src/services/addressAPI.js`
- Exports:
  - `getMyAddresses()` - Lấy danh sách địa chỉ user
  - `getDefaultAddress()` - Lấy địa chỉ mặc định
  - `createAddress(data)` - Tạo địa chỉ mới
  - `updateAddress(id, data)` - Cập nhật địa chỉ
  - `deleteAddress(id)` - Xóa địa chỉ
  - `setDefaultAddress(id)` - Đặt làm mặc định

### 2. **index.js** - Export addressAPI
- ✅ Thêm import và export `addressAPI`

### 3. **CheckoutPage.jsx** - Redesign chức năng địa chỉ
- ✅ Thêm state:
  - `addressMode` - "existing" hoặc "new"
  - `savedAddresses` - Danh sách địa chỉ lưu
  - `selectedAddressId` - ID địa chỉ đã chọn
  - `newAddressType` - "home" hoặc "office"

- ✅ Thêm useEffect fetch danh sách địa chỉ
- ✅ Sửa handleSubmit:
  - Gửi `addressId` nếu chọn cũ
  - Gửi `newAddress` object nếu thêm mới

- ✅ Redesign UI phần địa chỉ:
  - Radio button chọn "Sử dụng địa chỉ có sẵn" vs "Thêm địa chỉ mới"
  - Hiển thị danh sách địa chỉ với badge loại (home/office) và mặc định
  - Form thêm mới với các trường địa chỉ
  - Radio button chọn loại địa chỉ (home/office)

## 📝 Dữ liệu gửi từ Frontend 

### Scenario 1: Chọn địa chỉ cũ
```javascript
const orderData = {
  cartItems: [...],
  couponId: null,
  paymentMethodCode: "COD",
  addressId: 5  // ID của địa chỉ đã lưu
};
```

### Scenario 2: Thêm địa chỉ mới
```javascript
const orderData = {
  cartItems: [...],
  couponId: null,
  paymentMethodCode: "COD",
  newAddress: {
    receiverName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    fullAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
    addressType: "home", // hoặc "office"
    isDefault: false
  }
};
```

## 🚀 Các bước triển khai

### 1. Database
```bash
# Chạy migration thêm cột address_id
# Cách 1: Dùng MySQL client
mysql -u root -p ecommerce_coffee < alter_orders_add_address_id.sql

# Cách 2: Dùng MySQL GUI (Workbench, phpMyAdmin)
# Copy-paste SQL từ file vào
```

### 2. Backend
- Các file đã sửa:
  - ✅ `src/controllers/AddressController.js`
  - ✅ `src/services/AddressService.js`
  - ✅ `src/routes/address.routes.js`
  - ✅ `src/models/OrderModel.js` (chỉ insert query)
  - ✅ `src/services/OrderService.js`
  - ✅ `src/controllers/OrderController.js`
- Restart server Node.js

### 3. Frontend
- Các file được tạo/sửa:
  - ✅ `src/services/addressAPI.js` (NEW)
  - ✅ `src/services/index.js` (sửa)
  - ✅ `src/pages/customer/CheckoutPage.jsx` (sửa)

## ✅ Testing Checklist

1. **API endpoint mới**
   - [ ] `GET /address/` - Lấy danh sách địa chỉ
   - [ ] `GET /address/default` - Lấy địa chỉ mặc định
   - [ ] `POST /address/` - Tạo địa chỉ mới

2. **CheckoutPage UI**
   - [ ] Hiển thị danh sách địa chỉ cũ (nếu có)
   - [ ] Toggle chọn "Sử dụng địa chỉ cũ" vs "Thêm mới"
   - [ ] Khi chọn địa chỉ cũ: form ẩn, address hiển thị
   - [ ] Khi chọn thêm mới: form hiển thị, radio type (home/office) visible
   - [ ] Địa chỉ hiển thị badge loại (home/office) và "Mặc định"

3. **Order flow**
   - [ ] Chọn địa chỉ cũ → Tạo order → record có `address_id`
   - [ ] Thêm địa chỉ mới → Tạo order → Address được lưu + order có `address_id`
   - [ ] Verify `shipAddress` trong orders (nên có full address)
   - [ ] Verify `address_id` foreign key hoạt động

4. **Edge cases**
   - [ ] User không có địa chỉ lưu → Mode "thêm mới" được chọn mặc định
   - [ ] Thêm địa chỉ mới → Lần order sau, địa chỉ mới xuất hiện trong danh sách

## 📌 Ghi chú quan trọng

1. **Order Query trong DB:** Có thể cả `shipAddress` (text) và `address_id` (FK) đều có giá trị
   - `shipAddress`: được lấy từ `addresses.full_address`
   - `address_id`: tham chiếu trực tiếp

2. **Kiểm tra Validation:** AddressService validate `addressId` thuộc user
   - Người dùng không thể chọn địa chỉ của user khác

3. **Tự động tạo address:** Khi thêm mới, logic tự động:
   - Tạo record trong bảng `addresses`
   - Lấy ID và lưu vào `orders.address_id`
   - Lưu full address vào `orders.shipAddress` (cho backup)

## 🔗 API Endpoints

### Address Management
```
GET    /address/              # Danh sách địa chỉ của user
GET    /address/default       # Địa chỉ mặc định
POST   /address/              # Tạo địa chỉ mới
PUT    /address/:id           # Cập nhật địa chỉ
DELETE /address/:id           # Xóa địa chỉ
```

### Order Creation
```
POST   /order/                # Tạo đơn (có thể truyền addressId hoặc newAddress)
```

## ❓ Troubleshooting

### "Không tìm thấy addressAPI"
→ Kiểm tra `src/services/addressAPI.js` có tồn tại không
→ Verify import trong `CheckoutPage.jsx`

### "addressId" không được lưu vào orders
→ Kiểm tra migration đã chạy (cột `address_id` tồn tại)
→ Verify `OrderModel.createOrder()` có truyền `addressId`

### Danh sách địa chỉ không hiển thị
→ Kiểm tra API `GET /address/` có trả dữ liệu
→ Verify `addressAPI.getMyAddresses()` được call trong useEffect
→ Check browser console cho errors

---
**Version:** v1.0  
**Date:** April 2026  
**Status:** ✅ Ready to test
