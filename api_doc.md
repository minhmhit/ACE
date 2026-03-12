# API Documentation — Hệ thống quản lý bán hàng cà phê bột

> Tài liệu liệt kê đầy đủ các API backend cần thiết cho frontend.
> Base URL: `/api/v1`

## Quy ước ký hiệu trạng thái

| Ký hiệu | Ý nghĩa |
|----------|---------|
| ✅ | API đã tồn tại, hoạt động đúng với DB mới |
| ⚠️ | API đã tồn tại nhưng **cần sửa** (authorize dùng role ID thay vì code, hoặc thiếu field mới) |
| 🆕 | API **mới cần thêm** |

## Roles hệ thống

| ID | Code | Mô tả |
|----|------|--------|
| 1 | ADMIN | Quản trị viên |
| 2 | USER | Khách hàng |
| 3 | WAREHOUSE | Kho / nhập hàng |
| 4 | SALE | Bán hàng |
| 5 | HRM | Quản lý nhân sự |

> **Lưu ý:** Các module cũ (product, category, cart, order, coupon, variant, inventory, supplier, import) vẫn dùng `authorize(1,3)` hoặc `authorize(1,4)` với **role ID số**. Các module mới (auth, employee, HR, payroll, payment, receipt) dùng `authorize("ADMIN", "HRM")` với **role code chuỗi**. Cần chuẩn hoá dần sang role code.

---

## Bảng tổng hợp database

### Bảng DB mới (33 bảng)

| Nhóm | Bảng |
|------|------|
| Auth | `users`, `roles`, `sessions` |
| Catalog | `products`, `categories`, `variants` |
| Cart | `carts`, `cart_items` |
| Order | `orders`, `order_items`, `coupons` |
| Payment | `payments`, `payment_methods`, `payment_bank_transfer_details`, `payment_card_details`, `payment_ewallet_details` |
| Receipt | `receipts` |
| Inventory | `inventories`, `imports`, `import_details`, `suppliers` |
| HR | `departments`, `positions`, `employees`, `employee_position_history` |
| Leave/Resign | `leave_types`, `leave_requests`, `resignation_requests` |
| Attendance | `attendance` |
| Payroll | `payroll_periods`, `payrolls`, `payroll_items` |

### Bảng mới so với DB cũ

`sessions`, `departments`, `positions`, `employees`, `employee_position_history`, `leave_types`, `leave_requests`, `resignation_requests`, `attendance`, `payroll_periods`, `payrolls`, `payroll_items`

---

# Module 1: Auth / Account

> Bảng: `users`, `roles`, `sessions`

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 1 | ✅ | POST | `/auth/register` | Đăng ký tài khoản | Public | users, roles |
| 2 | ✅ | POST | `/auth/login` | Đăng nhập (trả access + refresh token) | Public | users, roles, sessions |
| 3 | ✅ | POST | `/auth/refresh` | Refresh access token (rotate refresh) | Public | sessions |
| 4 | ✅ | POST | `/auth/logout` | Đăng xuất thiết bị hiện tại | Authenticated | sessions |
| 5 | ✅ | POST | `/auth/logout-all` | Đăng xuất tất cả thiết bị | Authenticated | sessions |
| 6 | ✅ | GET | `/auth/me` | Xem profile bản thân | Authenticated | users, roles |
| 7 | ✅ | PATCH | `/auth/me/profile` | Cập nhật profile (name, avatar...) | Authenticated | users |
| 8 | ✅ | PATCH | `/auth/me/password` | Đổi mật khẩu | Authenticated | users |
| 9 | ✅ | GET | `/auth/sessions` | Xem danh sách phiên đăng nhập | Authenticated | sessions |
| 10 | ✅ | DELETE | `/auth/sessions/:sessionId` | Revoke 1 phiên đăng nhập | Authenticated | sessions |

### Quản lý User (Admin)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 11 | ✅ | GET | `/users/me` | User xem profile | Authenticated | users |
| 12 | ✅ | PATCH | `/users/me` | User cập nhật profile | Authenticated | users |
| 13 | ✅ | GET | `/admin/users` | DS users (phân trang) | ADMIN, HRM | users, roles |
| 14 | ✅ | GET | `/admin/users/:id` | Chi tiết user | ADMIN, HRM | users, roles |
| 15 | ✅ | POST | `/admin/users` | Tạo user | ADMIN | users, roles |
| 16 | ✅ | PATCH | `/admin/users/:id` | Cập nhật user | ADMIN | users |
| 17 | ✅ | DELETE | `/admin/users/:id` | Soft delete user | ADMIN | users |
| 18 | ✅ | PATCH | `/admin/users/:id/active` | Kích hoạt / vô hiệu hóa | ADMIN | users |

---

# Module 2: Catalog / Sản phẩm / Danh mục

> Bảng: `products`, `categories`, `variants`

### Danh mục (Categories)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 19 | ✅ | GET | `/category` | DS danh mục | Public | categories |
| 20 | ✅ | GET | `/category/:id` | Chi tiết danh mục | Public | categories |
| 21 | ⚠️ | POST | `/category/add` | Tạo danh mục | ADMIN, WAREHOUSE → `authorize(1,3)` | categories |
| 22 | ⚠️ | PUT | `/category/update/:id` | Cập nhật danh mục | ADMIN, WAREHOUSE → `authorize(1,3)` | categories |
| 23 | ⚠️ | DELETE | `/category/delete/:id` | Xóa danh mục | ADMIN, WAREHOUSE → `authorize(1,3)` | categories |

> ⚠️ Cần sửa: `authorize(1,3)` → `authorize("ADMIN","WAREHOUSE")`

### Sản phẩm (Products)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 24 | ✅ | GET | `/product` | DS sản phẩm (phân trang) | Public | products, categories |
| 25 | ✅ | GET | `/product/search` | Tìm kiếm sản phẩm | Public | products |
| 26 | ✅ | GET | `/product/:id` | Chi tiết sản phẩm | Public | products, variants |
| 27 | ⚠️ | POST | `/product/add` | Tạo sản phẩm | ADMIN, WAREHOUSE → `authorize(1,3)` | products |
| 28 | ⚠️ | PUT | `/product/update/:id` | Cập nhật sản phẩm | ADMIN, WAREHOUSE → `authorize(1,3)` | products |
| 29 | ⚠️ | DELETE | `/product/delete/:id` | Xóa sản phẩm | ADMIN, WAREHOUSE → `authorize(1,3)` | products |

### Biến thể (Variants)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 30 | ✅ | GET | `/variants/product/:productId` | DS biến thể theo SP | Public | variants |
| 31 | ✅ | GET | `/variants/:id` | Chi tiết biến thể | Public | variants |
| 32 | ⚠️ | POST | `/variants` | Tạo biến thể | ADMIN → `authorize(1)` | variants |
| 33 | ⚠️ | PUT | `/variants/:id` | Cập nhật biến thể | ADMIN → `authorize(1)` | variants |
| 34 | ⚠️ | DELETE | `/variants/:id` | Xóa biến thể | ADMIN → `authorize(1)` | variants |
| 35 | ⚠️ | POST | `/product/products/:id/variants` | Tạo biến thể (trùng #32) | ADMIN, WAREHOUSE → `authorize(1,3)` | variants |
| 36 | ⚠️ | PUT | `/product/variants/:id` | Cập nhật biến thể (trùng #33) | ADMIN, WAREHOUSE → `authorize(1,3)` | variants |
| 37 | ⚠️ | DELETE | `/product/variants/:id` | Xóa biến thể (trùng #34) | ADMIN, WAREHOUSE → `authorize(1,3)` | variants |

> ⚠️ Cần sửa: authorize ID → code. Ngoài ra routes variant bị **duplicate** (cả `/variants/` và `/product/variants/`), nên gỡ bỏ 1 trong 2.

### Mã giảm giá (Coupons)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 38 | ✅ | GET | `/coupons` | DS coupon | Public | coupons |
| 39 | ✅ | POST | `/coupons/verify` | Kiểm tra mã giảm giá | Public | coupons |
| 40 | ⚠️ | POST | `/coupons/add` | Tạo coupon | ADMIN, SALE → `authorize(1,4)` | coupons |
| 41 | ⚠️ | PUT | `/coupons/update/:id` | Cập nhật coupon | ADMIN, SALE → `authorize(1,4)` | coupons |
| 42 | ⚠️ | DELETE | `/coupons/delete/:id` | Xóa coupon | ADMIN, SALE → `authorize(1,4)` | coupons |

---

# Module 3: Cart (Giỏ hàng)

> Bảng: `carts`, `cart_items`

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 43 | ✅ | GET | `/cart` | Xem giỏ hàng | Authenticated | carts, cart_items, products, variants |
| 44 | ✅ | POST | `/cart/add` | Thêm SP vào giỏ | Authenticated | cart_items |
| 45 | ✅ | PUT | `/cart/update/:id` | Cập nhật số lượng | Authenticated | cart_items |
| 46 | ✅ | DELETE | `/cart/remove/:id` | Xóa 1 item | Authenticated | cart_items |
| 47 | ✅ | DELETE | `/cart/clear` | Xóa toàn bộ giỏ | Authenticated | cart_items |

---

# Module 4: Order (Đơn hàng)

> Bảng: `orders`, `order_items`, `coupons`

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 48 | ✅ | POST | `/orders/add` | Tạo đơn hàng | Authenticated | orders, order_items, cart_items, inventories, coupons |
| 49 | ✅ | GET | `/orders` | DS đơn hàng của user | Authenticated | orders, order_items |
| 50 | ✅ | GET | `/orders/:id` | Chi tiết đơn hàng | Authenticated | orders, order_items |
| 51 | ✅ | PUT | `/orders/:id/cancel` | Hủy đơn hàng | Authenticated | orders, inventories |
| 52 | ⚠️ | GET | `/orders/admin/all` | DS tất cả đơn hàng | ADMIN, SALE → `authorize(1,4)` | orders |
| 53 | ⚠️ | PUT | `/orders/:id/status` | Cập nhật trạng thái đơn | ADMIN, SALE → `authorize(1,4)` | orders |

> ⚠️ Cần sửa authorize ID → code.

---

# Module 5: Payment (Thanh toán)

> Bảng: `payments`, `payment_methods`, `payment_bank_transfer_details`, `payment_card_details`, `payment_ewallet_details`

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 54 | ✅ | GET | `/payments/methods` | DS phương thức thanh toán | Authenticated | payment_methods |
| 55 | ✅ | POST | `/payments` | Tạo thanh toán (CASH/CARD/MOMO/VNPAY/PAYPAL) | Authenticated | payments, payment_*_details, orders |
| 56 | ✅ | GET | `/payments/history` | Lịch sử thanh toán user | Authenticated | payments, orders |
| 57 | ✅ | GET | `/payments/order/:orderId` | Payment của đơn hàng | Authenticated (chủ đơn / ADMIN / SALE) | payments |
| 58 | ✅ | GET | `/payments/:id` | Chi tiết payment | Authenticated | payments, payment_*_details |
| 59 | ✅ | GET | `/payments` | DS payments (admin) | ADMIN, SALE | payments, payment_methods |
| 60 | ✅ | POST | `/payments/:id/confirm` | Xác nhận thanh toán (COD, bank) | ADMIN, SALE | payments, orders, receipts |
| 61 | ✅ | POST | `/payments/:id/fail` | Đánh dấu thất bại | ADMIN, SALE | payments |

### VNPay

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 62 | ✅ | GET | `/payments/vnpay/return` | VNPay return callback | Public | payments, orders, receipts, payment_ewallet_details |
| 63 | ✅ | GET | `/payments/vnpay/ipn` | VNPay IPN callback | Public | payments, orders, receipts |
| 64 | ✅ | GET | `/payments/vnpay/query/:orderId` | Query giao dịch VNPay | ADMIN, SALE | payment_ewallet_details |

---

# Module 6: Receipt (Biên nhận)

> Bảng: `receipts`
> Receipt tự động sinh khi payment confirmed/success, linked qua `payment_id`.

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 65 | ✅ | GET | `/receipts/:id` | Chi tiết biên nhận | Authenticated | receipts, payments, orders |
| 66 | ✅ | GET | `/receipts/order/:orderId` | Biên nhận của đơn hàng | Authenticated | receipts |
| 67 | ✅ | GET | `/receipts` | DS biên nhận (admin) | ADMIN, SALE | receipts, orders |

---

# Module 7: Inventory / Kho / Nhập hàng

> Bảng: `inventories`, `imports`, `import_details`, `suppliers`

### Tồn kho (Inventory)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 68 | ⚠️ | GET | `/inventory` | DS tồn kho | ADMIN, WAREHOUSE → `authorize(1,3)` | inventories, products |
| 69 | ⚠️ | GET | `/inventory/low-stock` | SP sắp hết hàng | ADMIN, WAREHOUSE → `authorize(1,3)` | inventories |
| 70 | ⚠️ | GET | `/inventory/:productId` | Tồn kho theo SP | ADMIN, WAREHOUSE → `authorize(1,3)` | inventories |
| 71 | ⚠️ | PUT | `/inventory/:productId` | Cập nhật tồn kho | ADMIN, WAREHOUSE → `authorize(1,3)` | inventories |
| 72 | ⚠️ | POST | `/inventory/check` | Kiểm tra tồn kho | ADMIN, WAREHOUSE → `authorize(1,3)` | inventories |

### Nhà cung cấp (Suppliers)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 73 | ⚠️ | GET | `/suppliers` | DS nhà cung cấp | ADMIN, WAREHOUSE → `authorize(1,3)` | suppliers |
| 74 | ⚠️ | GET | `/suppliers/:id` | Chi tiết NCC | ADMIN, WAREHOUSE → `authorize(1,3)` | suppliers |
| 75 | ⚠️ | POST | `/suppliers/add` | Tạo NCC | ADMIN, WAREHOUSE → `authorize(1,3)` | suppliers |
| 76 | ⚠️ | PUT | `/suppliers/update/:id` | Cập nhật NCC | ADMIN, WAREHOUSE → `authorize(1,3)` | suppliers |
| 77 | ⚠️ | DELETE | `/suppliers/delete/:id` | Xóa NCC | ADMIN, WAREHOUSE → `authorize(1,3)` | suppliers |

### Nhập hàng (Imports)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 78 | ⚠️ | GET | `/imports` | DS phiếu nhập | ADMIN, WAREHOUSE → `authorize(1,3)` | imports, import_details |
| 79 | ⚠️ | GET | `/imports/:id` | Chi tiết phiếu nhập | ADMIN, WAREHOUSE → `authorize(1,3)` | imports, import_details |
| 80 | ⚠️ | POST | `/imports/add` | Tạo phiếu nhập | ADMIN, WAREHOUSE → `authorize(1,3)` | imports, import_details, inventories |
| 81 | ⚠️ | PATCH | `/imports/:id/status` | Cập nhật trạng thái thanh toán | ADMIN, WAREHOUSE → `authorize(1,3)` | imports |
| 82 | ⚠️ | DELETE | `/imports/:id` | Xóa phiếu nhập | ADMIN, WAREHOUSE → `authorize(1,3)` | imports, import_details |

### Upload

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 83 | ✅ | POST | `/uploads/upload-image` | Upload ảnh sản phẩm | Public (multer) | — |

---

# Module 8: Employee / HRM (Nhân sự)

> Bảng: `departments`, `positions`, `employees`, `employee_position_history`

### Phòng ban (Departments)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 84 | ✅ | GET | `/departments` | DS phòng ban | ADMIN, HRM | departments |
| 85 | ✅ | GET | `/departments/:id` | Chi tiết phòng ban | ADMIN, HRM | departments |
| 86 | ✅ | POST | `/departments` | Tạo phòng ban | ADMIN | departments |
| 87 | ✅ | PATCH | `/departments/:id` | Cập nhật phòng ban | ADMIN | departments |
| 88 | ✅ | PATCH | `/departments/:id/active` | Bật/tắt phòng ban | ADMIN | departments, employees |

### Chức vụ (Positions)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 89 | ✅ | GET | `/positions` | DS chức vụ | ADMIN, HRM | positions |
| 90 | ✅ | GET | `/positions/:id` | Chi tiết chức vụ | ADMIN, HRM | positions |
| 91 | ✅ | POST | `/positions` | Tạo chức vụ | ADMIN | positions |
| 92 | ✅ | PATCH | `/positions/:id` | Cập nhật chức vụ | ADMIN | positions |
| 93 | ✅ | PATCH | `/positions/:id/active` | Bật/tắt chức vụ | ADMIN | positions, employee_position_history |

### Nhân viên (Employees)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 94 | ✅ | GET | `/employees/me` | NV xem profile cá nhân | Authenticated | employees, users |
| 95 | ✅ | PATCH | `/employees/me` | NV cập nhật info cá nhân | Authenticated | employees |
| 96 | ✅ | GET | `/employees` | DS nhân viên (phân trang, filter) | ADMIN, HRM | employees, departments, positions |
| 97 | ✅ | GET | `/employees/:id` | Chi tiết nhân viên | ADMIN, HRM | employees, users, employee_position_history |
| 98 | ✅ | POST | `/employees` | Tạo NV (transaction 3 bảng) | ADMIN, HRM | users, employees, employee_position_history |
| 99 | ✅ | PATCH | `/employees/:id` | Cập nhật NV | ADMIN, HRM | employees |
| 100 | ✅ | PATCH | `/employees/:id/status` | Chuyển trạng thái NV | ADMIN, HRM | employees |

### Lịch sử chức vụ / lương

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 101 | ✅ | GET | `/employees/:id/position-history` | Lịch sử chức vụ/lương | ADMIN, HRM | employee_position_history, positions |
| 102 | ✅ | GET | `/employees/:id/current-position` | Chức vụ hiện tại | ADMIN, HRM | employee_position_history, positions |
| 103 | ✅ | POST | `/employees/:id/position-history` | Thêm bản ghi đổi chức vụ/lương | ADMIN, HRM | employee_position_history |

---

# Module 9: Leave / Resignation (Nghỉ phép / Nghỉ việc)

> Bảng: `leave_types`, `leave_requests`, `resignation_requests`

### Loại nghỉ phép (Leave Types)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 104 | ✅ | GET | `/leave-types` | DS loại nghỉ | ADMIN, HRM | leave_types |
| 105 | ✅ | POST | `/leave-types` | Tạo loại nghỉ | ADMIN | leave_types |
| 106 | ✅ | PATCH | `/leave-types/:id` | Cập nhật loại nghỉ | ADMIN | leave_types |

### Đơn nghỉ phép (Leave Requests)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 107 | ✅ | GET | `/leave-requests/me` | DS đơn nghỉ của mình | Authenticated | leave_requests, leave_types |
| 108 | ✅ | POST | `/leave-requests` | Tạo đơn nghỉ | Authenticated | leave_requests |
| 109 | ✅ | PATCH | `/leave-requests/:id/cancel` | Hủy đơn (chỉ PENDING) | Authenticated | leave_requests |
| 110 | ✅ | GET | `/leave-requests/pending` | DS đơn chờ duyệt | ADMIN, HRM | leave_requests, employees |
| 111 | ✅ | PATCH | `/leave-requests/:id/approve` | Duyệt đơn nghỉ | ADMIN, HRM | leave_requests |
| 112 | ✅ | PATCH | `/leave-requests/:id/reject` | Từ chối đơn nghỉ | ADMIN, HRM | leave_requests |

### Đơn nghỉ việc (Resignation Requests)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 113 | ✅ | GET | `/resignation-requests/me` | DS đơn nghỉ việc của mình | Authenticated | resignation_requests |
| 114 | ✅ | POST | `/resignation-requests` | Tạo đơn nghỉ việc | Authenticated | resignation_requests |
| 115 | ✅ | PATCH | `/resignation-requests/:id/cancel` | Hủy đơn (chỉ PENDING) | Authenticated | resignation_requests |
| 116 | ✅ | GET | `/resignation-requests/pending` | DS đơn chờ duyệt | ADMIN, HRM | resignation_requests, employees |
| 117 | ✅ | PATCH | `/resignation-requests/:id/approve` | Duyệt (transaction: NV nghỉ việc + vô hiệu hóa user + revoke sessions) | ADMIN, HRM | resignation_requests, employees, users, sessions |
| 118 | ✅ | PATCH | `/resignation-requests/:id/reject` | Từ chối đơn | ADMIN, HRM | resignation_requests |

---

# Module 10: Attendance (Chấm công)

> Bảng: `attendance`

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 119 | ✅ | POST | `/attendance/check-in` | NV check-in | Authenticated | attendance, employees |
| 120 | ✅ | POST | `/attendance/check-out` | NV check-out | Authenticated | attendance |
| 121 | ✅ | GET | `/attendance/me` | Chấm công cá nhân (tháng) | Authenticated | attendance |
| 122 | ✅ | GET | `/attendance` | DS chấm công (admin, phân trang) | ADMIN, HRM | attendance, employees |
| 123 | ✅ | POST | `/attendance/manual` | Tạo chấm công thủ công | ADMIN, HRM | attendance |
| 124 | ✅ | PATCH | `/attendance/:id` | Sửa bản ghi chấm công | ADMIN, HRM | attendance |

---

# Module 11: Payroll (Lương)

> Bảng: `payroll_periods`, `payrolls`, `payroll_items`

### Kỳ lương (Payroll Periods)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 125 | ✅ | GET | `/payroll-periods` | DS kỳ lương | ADMIN, HRM | payroll_periods |
| 126 | ✅ | GET | `/payroll-periods/:id` | Chi tiết kỳ lương | ADMIN, HRM | payroll_periods |
| 127 | ✅ | POST | `/payroll-periods` | Tạo kỳ lương | ADMIN, HRM | payroll_periods |
| 128 | ✅ | PATCH | `/payroll-periods/:id` | Cập nhật kỳ lương (chỉ OPEN) | ADMIN, HRM | payroll_periods |
| 129 | ✅ | PATCH | `/payroll-periods/:id/lock` | Khoá sổ (OPEN → LOCKED) | ADMIN, HRM | payroll_periods |
| 130 | ✅ | PATCH | `/payroll-periods/:id/mark-paid` | Đánh dấu trả lương (LOCKED → PAID) | ADMIN, HRM | payroll_periods |

### Bảng lương (Payrolls — Admin)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 131 | ✅ | POST | `/payrolls/generate` | Generate bảng lương (batch/đơn) | ADMIN, HRM | payrolls, payroll_items, employee_position_history, attendance |
| 132 | ✅ | GET | `/payrolls` | DS bảng lương theo kỳ | ADMIN, HRM | payrolls, employees |
| 133 | ✅ | GET | `/payrolls/:id` | Chi tiết bảng lương + items | ADMIN, HRM | payrolls, payroll_items |
| 134 | ✅ | PATCH | `/payrolls/:id/finalize` | Chốt bảng lương (DRAFT → FINALIZED) | ADMIN, HRM | payrolls |
| 135 | ✅ | PATCH | `/payrolls/:id/mark-paid` | Đánh dấu trả (FINALIZED → PAID) | ADMIN, HRM | payrolls |
| 136 | ✅ | POST | `/payrolls/finalize-period` | Chốt toàn bộ DRAFT trong kỳ | ADMIN, HRM | payrolls |
| 137 | ✅ | GET | `/payrolls/statistics` | Thống kê lương theo kỳ | ADMIN, HRM | payrolls |
| 138 | ✅ | GET | `/payrolls/admin/:employeeId/monthly-slip` | Phiếu lương NV (admin xem) | ADMIN, HRM | payrolls, payroll_items |
| 139 | ✅ | GET | `/payrolls/admin/:employeeId/yearly-summary` | Tổng hợp năm NV (admin xem) | ADMIN, HRM | payrolls, payroll_items |

### Bảng lương (Payrolls — Self-service)

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 140 | ✅ | GET | `/payrolls/me` | NV xem lương tháng | Authenticated | payrolls, employees |
| 141 | ✅ | GET | `/payrolls/me/yearly` | NV xem tổng hợp năm | Authenticated | payrolls |
| 142 | ✅ | GET | `/payrolls/me/monthly-slip` | NV xem phiếu lương chi tiết | Authenticated | payrolls, payroll_items |
| 143 | ✅ | GET | `/payrolls/me/yearly-summary` | NV xem tổng hợp năm chi tiết | Authenticated | payrolls, payroll_items |

---

# Module 12: Admin Dashboard / Statistics

> 🆕 **Chưa có API riêng** — hiện frontend phải gọi nhiều API để tổng hợp.

### Đề xuất API mới cho Dashboard

| # | Trạng thái | Method | Path | Mục đích | Role | Bảng liên quan |
|---|-----------|--------|------|----------|------|----------------|
| 144 | 🆕 | GET | `/dashboard/sales` | Thống kê doanh thu (hôm nay / tuần / tháng / năm, so sánh kỳ trước) | ADMIN, SALE | orders, payments |
| 145 | 🆕 | GET | `/dashboard/orders` | Thống kê đơn hàng (theo trạng thái, xu hướng) | ADMIN, SALE | orders |
| 146 | 🆕 | GET | `/dashboard/products/top` | Top sản phẩm bán chạy | ADMIN, SALE, WAREHOUSE | order_items, products |
| 147 | 🆕 | GET | `/dashboard/products/low-stock` | SP sắp hết hàng (tổng quan) | ADMIN, WAREHOUSE | inventories, products |
| 148 | 🆕 | GET | `/dashboard/hr` | Thống kê nhân sự (tổng NV theo trạng thái, phòng ban, đơn chờ duyệt) | ADMIN, HRM | employees, departments, leave_requests, resignation_requests |
| 149 | 🆕 | GET | `/dashboard/payroll` | Tổng chi lương kỳ hiện tại + so sánh | ADMIN, HRM | payrolls, payroll_periods |
| 150 | 🆕 | GET | `/dashboard/overview` | Tổng quan toàn hệ thống (revenue, orders, users, employees — compact) | ADMIN | orders, users, employees, payrolls |

---

# Tổng hợp trạng thái

| Trạng thái | Số lượng | Chi tiết |
|-----------|----------|---------|
| ✅ Đã có, OK | **104** | Auth, HR, Leave, Attendance, Payroll, Payment, Receipt |
| ⚠️ Cần sửa authorize | **39** | Product, Category, Variant, Coupon, Order, Inventory, Supplier, Import (dùng role ID thay code) |
| 🆕 Cần thêm mới | **7** | Dashboard / Statistics (chưa implement) |
| **Tổng** | **150** | |

---

# Thứ tự ưu tiên triển khai

## Phía Backend

| Ưu tiên | Công việc | Lý do |
|---------|-----------|-------|
| **P0** | Sửa authorize các module cũ (ID → code) | Đang dùng sai pattern, có thể break khi role thay đổi |
| **P1** | Gỡ duplicate variant routes | `/variants/` và `/product/variants/` trùng nhau |
| **P2** | Implement Dashboard APIs (7 endpoint mới) | Frontend cần cho trang admin overview |
| **P3** | Chuẩn hóa RESTful path naming | Một số path dùng `/add`, `/update/:id`, `/delete/:id` (legacy) thay vì REST thuần |

### Chi tiết P0: Sửa authorize

| File | Hiện tại | Cần sửa thành |
|------|----------|---------------|
| `category.routes.js` | `authorize(1,3)` | `authorize("ADMIN","WAREHOUSE")` |
| `product.routes.js` | `authorize(1,3)` | `authorize("ADMIN","WAREHOUSE")` |
| `variant.routes.js` | `authorize(1)` | `authorize("ADMIN")` |
| `coupon.routes.js` | `authorize(1,4)` | `authorize("ADMIN","SALE")` |
| `order.routes.js` | `authorize(1,4)` | `authorize("ADMIN","SALE")` |
| `inventory.routes.js` | `authorize(1,3)` | `authorize("ADMIN","WAREHOUSE")` |
| `supplier.routes.js` | `authorize(1,3)` | `authorize("ADMIN","WAREHOUSE")` |
| `import.routes.js` | `authorize(1,3)` | `authorize("ADMIN","WAREHOUSE")` |

### Chi tiết P3: Chuẩn hóa path (tùy chọn, không bắt buộc)

| Hiện tại | Chuẩn REST |
|----------|-----------|
| `POST /product/add` | `POST /products` |
| `PUT /product/update/:id` | `PUT /products/:id` |
| `DELETE /product/delete/:id` | `DELETE /products/:id` |
| `POST /category/add` | `POST /categories` |
| `POST /suppliers/add` | `POST /suppliers` |
| `POST /imports/add` | `POST /imports` |
| `POST /coupons/add` | `POST /coupons` |

> ⚠️ Chuẩn hóa path sẽ **breaking change** cho frontend hiện tại. Chỉ thực hiện khi frontend sẵn sàng migrate.

## Phía Frontend

| Ưu tiên | Màn hình | API modules cần |
|---------|----------|----------------|
| **P0** | Đăng nhập / Đăng ký | Auth (#1-#10) |
| **P1** | Catalog + Chi tiết SP | Category (#19-#23), Product (#24-#29), Variant (#30-#34) |
| **P1** | Giỏ hàng + Đặt hàng | Cart (#43-#47), Order (#48-#53) |
| **P1** | Thanh toán | Payment (#54-#64), Receipt (#65-#67) |
| **P2** | Quản lý kho | Inventory (#68-#72), Supplier (#73-#77), Import (#78-#82) |
| **P2** | Quản lý nhân viên | Department (#84-#88), Position (#89-#93), Employee (#94-#103) |
| **P3** | Nghỉ phép / Nghỉ việc | LeaveType (#104-#106), LeaveRequest (#107-#112), Resignation (#113-#118) |
| **P3** | Chấm công | Attendance (#119-#124) |
| **P4** | Bảng lương | PayrollPeriod (#125-#130), Payroll (#131-#143) |
| **P5** | Dashboard thống kê | Dashboard (#144-#150) — cần backend implement trước |

---

# State Machines tham khảo

### Employee Status
```
PROBATION → ACTIVE | TERMINATED
ACTIVE    → ON_LEAVE | RESIGNED | TERMINATED
ON_LEAVE  → ACTIVE | RESIGNED | TERMINATED
```

### Leave / Resignation Request
```
PENDING → APPROVED | REJECTED | CANCELLED (terminal)
```

### Payroll Period
```
OPEN → LOCKED → PAID
```

### Payroll
```
DRAFT → FINALIZED → PAID
```

### Payment
```
PENDING → SUCCESS → (auto-create receipt)
PENDING → FAILED
PENDING → REFUNDED (future)
```

### Order
```
PENDING → COMPLETED (khi payment SUCCESS)
PENDING → CANCELLED (user hoặc admin)
PENDING → SHIPPING → COMPLETED
```
