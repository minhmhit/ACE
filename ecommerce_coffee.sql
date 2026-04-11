-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 11, 2026 lúc 04:16 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ecommerce_coffee`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `full_address` text NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `address_type` enum('home','office') DEFAULT 'home',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `work_date` date NOT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `work_minutes` int(11) NOT NULL DEFAULT 0,
  `overtime_minutes` int(11) NOT NULL DEFAULT 0,
  `status` enum('PRESENT','ABSENT','PAID_LEAVE','UNPAID_LEAVE','SICK_LEAVE','MATERNITY_LEAVE','HOLIDAY') NOT NULL,
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `work_date`, `check_in`, `check_out`, `work_minutes`, `overtime_minutes`, `status`, `note`) VALUES
(1, 3, '2026-03-01', '2026-03-01 08:00:00', '2026-03-01 17:00:00', 540, 0, 'PRESENT', NULL),
(2, 5, '2026-03-01', '2026-03-01 08:15:00', '2026-03-01 17:30:00', 555, 30, 'PRESENT', NULL),
(3, 6, '2026-03-01', '2026-03-01 08:00:00', '2026-03-01 18:00:00', 600, 60, 'PRESENT', NULL),
(4, 5, '2026-03-02', NULL, NULL, 0, 0, 'PAID_LEAVE', 'Nghỉ phép năm'),
(5, 3, '2026-03-02', '2026-03-02 08:05:00', '2026-03-02 17:00:00', 535, 0, 'PRESENT', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `userId`, `createdAt`) VALUES
(1, 1, '2026-03-14 14:55:33.162');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cartId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `variantId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `cartId`, `productId`, `variantId`, `quantity`, `unitPrice`) VALUES
(4, 1, 20, NULL, 2, 700000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `parentId`, `isActive`) VALUES
(1, 'Robusta', 'Chuyên robusta ', NULL, 1),
(3, 'Robusta Lam Dong', 'Mui huong em nong say', 1, 1),
(4, 'Robusta Dak Lak', 'Dac san ca phe cao nguyen', 1, 1),
(5, 'Robusta Ban Me', 'Thu phu ca phe viet nam', 1, 1),
(7, 'Arabica', 'Chua nhe cho buoi sang', NULL, 1),
(8, 'Arabica Lam Dong', 'Uong it thoi die som day', 7, 1),
(9, 'Arabica Gia Lai', 'Dang nhe cho buoi sang', 7, 1),
(10, 'Culi', 'Ca phe hau vi hoi dang', NULL, 1),
(11, 'Ca phe rang xay (updated)', 'Cac loai ca phe rang xay thu cong', NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `validFrom` datetime(3) NOT NULL,
  `validUntil` datetime(3) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `discountPercent`, `validFrom`, `validUntil`, `isActive`) VALUES
(1, 'SUMMER25', 25, '2026-03-01 07:00:00.000', '2026-07-01 06:59:59.000', 1),
(2, 'VACATION26', 10, '2026-03-01 07:00:00.000', '2026-07-01 06:59:59.000', 1),
(3, 'KID', 30, '2026-03-01 07:00:00.000', '2026-07-01 06:59:59.000', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `manager_employee_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `manager_employee_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BOD', 'Ban giám đốc', 'Bộ phận điều hành doanh nghiệp', 1, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(2, 'HR', 'Nhân sự', 'Quản lý hồ sơ nhân sự, nghỉ phép, lương thưởng', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(3, 'SALES', 'Kinh doanh', 'Bán hàng và chăm sóc khách hàng', 4, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(4, 'WAREHOUSE', 'Kho vận', 'Quản lý kho, nhập xuất hàng', 6, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(5, 'ACCOUNT', 'Kế toán', 'Quản lý thu chi, đối soát thanh toán', 7, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `direct_manager_employee_id` int(11) DEFAULT NULL,
  `employment_type` enum('FULL_TIME','PART_TIME','INTERN','CONTRACT') NOT NULL DEFAULT 'FULL_TIME',
  `status` enum('PROBATION','ACTIVE','ON_LEAVE','RESIGNED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `hire_date` date NOT NULL,
  `official_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `national_id` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `bank_account_no` varchar(50) DEFAULT NULL,
  `bank_account_name` varchar(150) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `employee_code`, `department_id`, `direct_manager_employee_id`, `employment_type`, `status`, `hire_date`, `official_date`, `termination_date`, `date_of_birth`, `gender`, `national_id`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `bank_account_no`, `bank_account_name`, `bank_name`, `created_at`, `updated_at`) VALUES
(1, 1, 'EMP0001', 1, NULL, 'FULL_TIME', 'ACTIVE', '2024-01-01', '2024-01-01', NULL, '1988-05-10', 'MALE', '012345678901', '123 Le Loi, Q.1, TP.HCM', 'Nguyễn Thị A', '0911111111', '1000000001', 'NGUYEN VAN ADMIN', 'VCB', '2026-03-10 07:47:19', '2026-03-16 08:06:36'),
(2, 2, 'EMP0002', 2, 1, 'FULL_TIME', 'ACTIVE', '2024-01-10', '2024-02-10', NULL, '1990-03-15', 'FEMALE', '012345678902', 'TP.HCM', 'Trần Văn B', '0911111112', '1000000002', 'TRAN THI HR MANAGER', 'ACB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(3, 3, 'EMP0003', 2, 2, 'FULL_TIME', 'ACTIVE', '2024-02-01', '2024-03-01', NULL, '1996-07-21', 'MALE', '012345678903', 'TP.HCM', 'Lê Thị C', '0911111113', '1000000003', 'LE VAN HR STAFF', 'TCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(4, 4, 'EMP0004', 3, 1, 'FULL_TIME', 'ACTIVE', '2024-01-15', '2024-02-15', NULL, '1989-10-01', 'MALE', '012345678904', 'TP.HCM', 'Phạm Thị D', '0911111114', '1000000004', 'PHAM VAN SALES MGR', 'VCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(5, 5, 'EMP0005', 3, 4, 'FULL_TIME', 'ACTIVE', '2024-03-01', '2024-04-01', NULL, '1998-09-12', 'FEMALE', '012345678905', 'TP.HCM', 'Hoàng Văn E', '0911111115', '1000000005', 'HOANG THI SALES', 'MBB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(6, 6, 'EMP0006', 4, 1, 'FULL_TIME', 'RESIGNED', '2024-02-20', '2024-03-20', '2026-04-15', '1994-12-09', 'MALE', '012345678906', 'TP.HCM', 'Đỗ Thị F', '0911111116', '1000000006', 'DO VAN KHO', 'BIDV', '2026-03-10 07:47:19', '2026-03-16 08:41:09'),
(7, 7, 'EMP0007', 5, 1, 'FULL_TIME', 'ACTIVE', '2024-02-25', '2024-03-25', NULL, '1993-11-11', 'FEMALE', '012345678907', 'TP.HCM', 'Ngô Văn G', '0911111117', '1000000007', 'NGO THI KE TOAN', 'VCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(8, 10, 'EMP0008', 1, 1, 'FULL_TIME', 'ON_LEAVE', '2026-03-14', NULL, NULL, NULL, 'OTHER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-16 08:10:30', '2026-03-16 08:17:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employee_position_history`
--

CREATE TABLE `employee_position_history` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `effective_from` datetime NOT NULL,
  `effective_to` datetime DEFAULT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `allowance_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `salary_type` enum('MONTHLY','DAILY','HOURLY') NOT NULL DEFAULT 'MONTHLY',
  `note` varchar(255) DEFAULT NULL,
  `changed_reason` varchar(255) DEFAULT NULL,
  `changed_by_user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `employee_position_history`
--

INSERT INTO `employee_position_history` (`id`, `employee_id`, `position_id`, `department_id`, `effective_from`, `effective_to`, `base_salary`, `allowance_amount`, `salary_type`, `note`, `changed_reason`, `changed_by_user_id`, `created_at`) VALUES
(1, 1, 1, 1, '2024-01-01 00:00:00', NULL, 40000000.00, 5000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 1, '2026-03-10 07:47:19'),
(2, 2, 2, 2, '2024-01-10 00:00:00', NULL, 22000000.00, 3000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 1, '2026-03-10 07:47:19'),
(3, 3, 3, 2, '2024-02-01 00:00:00', NULL, 12000000.00, 1000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 2, '2026-03-10 07:47:19'),
(4, 4, 4, 3, '2024-01-15 00:00:00', NULL, 25000000.00, 4000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 1, '2026-03-10 07:47:19'),
(5, 5, 5, 3, '2024-03-01 00:00:00', NULL, 11000000.00, 1000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 4, '2026-03-10 07:47:19'),
(6, 6, 7, 4, '2024-02-20 00:00:00', NULL, 10000000.00, 1000000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 1, '2026-03-10 07:47:19'),
(7, 7, 8, 5, '2024-02-25 00:00:00', NULL, 14000000.00, 1500000.00, 'MONTHLY', 'Bổ nhiệm ban đầu', 'Khởi tạo hệ thống', 1, '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `imports`
--

CREATE TABLE `imports` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `import_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `import_details`
--

CREATE TABLE `import_details` (
  `id` int(11) NOT NULL,
  `import_id` int(11) NOT NULL,
  `product_id_imports` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`quantity` * `unit_price`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventories`
--

CREATE TABLE `inventories` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `productId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventories`
--

INSERT INTO `inventories` (`id`, `quantity`, `productId`) VALUES
(1, 46, 1),
(2, 50, 2),
(3, 50, 3),
(4, 50, 4),
(5, 50, 5),
(6, 50, 6),
(7, 50, 7),
(8, 50, 8),
(9, 50, 9),
(10, 50, 10),
(11, 50, 11),
(12, 50, 12),
(13, 50, 13),
(14, 50, 14),
(15, 50, 15),
(16, 50, 16),
(17, 50, 17),
(18, 50, 18),
(19, 50, 19),
(20, 48, 20),
(21, 50, 21),
(22, 50, 22),
(23, 50, 23);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `request_type` enum('ANNUAL_LEAVE','SICK_LEAVE','MATERNITY_LEAVE','UNPAID_LEAVE','OTHER') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(6,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `approved_by_employee_id` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `request_type`, `start_date`, `end_date`, `total_days`, `reason`, `attachment_url`, `status`, `approved_by_employee_id`, `approved_at`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'ANNUAL_LEAVE', '2026-03-02', '2026-03-02', 1.00, 'Nghỉ phép cá nhân', NULL, 'APPROVED', 4, '2026-02-28 15:00:00', NULL, '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(2, 3, 2, 'SICK_LEAVE', '2026-03-05', '2026-03-05', 1.00, 'Sốt cao, xin nghỉ 1 ngày', '/uploads/medical-note-emp0003.pdf', 'PENDING', NULL, NULL, NULL, '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(3, 8, 1, 'ANNUAL_LEAVE', '2026-04-01', '2026-04-02', 2.00, 'Nghi phep ca nhan', NULL, 'APPROVED', 1, '2026-03-16 08:24:24', NULL, '2026-03-16 08:23:55', '2026-03-16 08:24:24'),
(4, 5, 3, 'MATERNITY_LEAVE', '2026-04-06', '2026-04-08', 3.00, 'Nghi de', NULL, 'PENDING', NULL, NULL, NULL, '2026-04-06 07:36:54', '2026-04-06 07:36:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `requires_attachment` tinyint(1) NOT NULL DEFAULT 0,
  `max_days_per_year` decimal(6,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `leave_types`
--

INSERT INTO `leave_types` (`id`, `code`, `name`, `is_paid`, `requires_attachment`, `max_days_per_year`, `is_active`) VALUES
(1, 'ANNUAL', 'Nghỉ phép năm', 1, 0, 12.00, 1),
(2, 'SICK', 'Nghỉ ốm', 1, 1, NULL, 1),
(3, 'MATERNITY', 'Nghỉ thai sản', 1, 1, NULL, 1),
(4, 'UNPAID', 'Nghỉ không lương', 0, 0, NULL, 1),
(5, 'OTHER', 'Khác', 0, 0, NULL, 1),
(6, 'ANNUAL_LEAVE', 'Thích thì nghỉ - Genz', 0, 0, NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `shipAddress` varchar(250) DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','SHIPPING') NOT NULL DEFAULT 'PENDING',
  `totalAmount` decimal(65,2) NOT NULL,
  `userId` int(11) NOT NULL,
  `couponId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `orderDate`, `shipAddress`, `status`, `totalAmount`, `userId`, `couponId`) VALUES
(2, '2026-03-15 16:35:44.000', '123 Nguyen Hue, Q.1, TP.HCM', 'PENDING', 640000.00, 1, NULL),
(3, '2026-03-15 16:45:50.000', '123 Nguyen Hue, Q.1, TP.HCM', 'COMPLETED', 1050000.00, 1, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL,
  `variantId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `quantity`, `orderId`, `productId`, `unitPrice`, `variantId`) VALUES
(1, 4, 2, 1, 160000.00, 1),
(2, 2, 3, 20, 700000.00, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `payment_id` bigint(20) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'VND',
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method_id`, `amount`, `currency`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 640000.00, 'VND', 'PENDING', '2026-03-15 09:45:08', '2026-03-15 09:45:08'),
(8, 3, 4, 1050000.00, 'VND', 'SUCCESS', '2026-03-18 03:09:32', '2026-03-18 03:10:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_bank_transfer_details`
--

CREATE TABLE `payment_bank_transfer_details` (
  `payment_id` bigint(20) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `transfer_reference` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_card_details`
--

CREATE TABLE `payment_card_details` (
  `payment_id` bigint(20) NOT NULL,
  `card_type` enum('VISA','MASTERCARD') DEFAULT NULL,
  `last_4_digits` char(4) DEFAULT NULL,
  `card_holder_name` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_ewallet_details`
--

CREATE TABLE `payment_ewallet_details` (
  `payment_id` bigint(20) NOT NULL,
  `provider` enum('MOMO','VNPAY','ZALOPAY','PAYPAL') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `response_code` varchar(50) DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_ewallet_details`
--

INSERT INTO `payment_ewallet_details` (`payment_id`, `provider`, `transaction_id`, `response_code`, `paid_at`) VALUES
(8, 'VNPAY', '15455429', '00', '2026-03-18 03:10:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_methods`
--

CREATE TABLE `payment_methods` (
  `payment_method_id` int(11) NOT NULL,
  `code` enum('CASH','CARD','MOMO','VNPAY','PAYPAL') NOT NULL DEFAULT 'CASH',
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_methods`
--

INSERT INTO `payment_methods` (`payment_method_id`, `code`, `name`, `is_active`, `created_at`) VALUES
(1, 'CASH', 'Tiền mặt', 1, '2026-03-10 00:46:55'),
(2, 'CARD', 'Thẻ ngân hàng', 1, '2026-03-10 00:46:55'),
(3, 'MOMO', 'Ví MoMo', 1, '2026-03-10 00:46:55'),
(4, 'VNPAY', 'VNPay', 1, '2026-03-10 00:46:55'),
(5, 'PAYPAL', 'PayPal', 1, '2026-03-10 00:46:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payrolls`
--

CREATE TABLE `payrolls` (
  `id` int(11) NOT NULL,
  `payroll_period_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `position_history_id` int(11) DEFAULT NULL,
  `base_salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `allowance_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `bonus_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `deduction_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `gross_salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `insurance_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payable_salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `calculation_note` text DEFAULT NULL,
  `status` enum('DRAFT','FINALIZED','PAID') NOT NULL DEFAULT 'DRAFT',
  `generated_at` datetime DEFAULT NULL,
  `generated_by_user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payrolls`
--

INSERT INTO `payrolls` (`id`, `payroll_period_id`, `employee_id`, `position_history_id`, `base_salary`, `allowance_total`, `bonus_total`, `deduction_total`, `gross_salary`, `insurance_amount`, `tax_amount`, `net_salary`, `payable_salary`, `calculation_note`, `status`, `generated_at`, `generated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 3, 12000000.00, 1000000.00, 500000.00, 0.00, 13500000.00, 1260000.00, 0.00, 12240000.00, 12240000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(2, 2, 5, 5, 11000000.00, 1000000.00, 300000.00, 0.00, 12300000.00, 1155000.00, 0.00, 11145000.00, 11145000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(3, 2, 6, 6, 10000000.00, 1000000.00, 200000.00, 0.00, 11200000.00, 1050000.00, 0.00, 10150000.00, 10150000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payroll_items`
--

CREATE TABLE `payroll_items` (
  `id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `item_type` enum('BASE','ALLOWANCE','BONUS','DEDUCTION','INSURANCE','TAX','OTHER') NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `formula_text` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payroll_items`
--

INSERT INTO `payroll_items` (`id`, `payroll_id`, `item_type`, `item_code`, `item_name`, `amount`, `formula_text`, `note`, `created_at`) VALUES
(1, 1, 'BASE', 'BASE_SALARY', 'Lương cơ bản', 12000000.00, 'Theo lịch sử chức vụ', NULL, '2026-03-10 07:47:20'),
(2, 1, 'ALLOWANCE', 'ALLOWANCE', 'Phụ cấp', 1000000.00, 'Theo chính sách vị trí', NULL, '2026-03-10 07:47:20'),
(3, 1, 'BONUS', 'BONUS', 'Thưởng', 500000.00, 'Thưởng hiệu suất', NULL, '2026-03-10 07:47:20'),
(4, 1, 'INSURANCE', 'INSURANCE', 'Bảo hiểm', 1260000.00, 'Tỷ lệ doanh nghiệp áp dụng', NULL, '2026-03-10 07:47:20'),
(5, 2, 'BASE', 'BASE_SALARY', 'Lương cơ bản', 11000000.00, 'Theo lịch sử chức vụ', NULL, '2026-03-10 07:47:20'),
(6, 2, 'ALLOWANCE', 'ALLOWANCE', 'Phụ cấp', 1000000.00, 'Theo chính sách vị trí', NULL, '2026-03-10 07:47:20'),
(7, 2, 'BONUS', 'BONUS', 'Thưởng', 300000.00, 'Thưởng hiệu suất', NULL, '2026-03-10 07:47:20'),
(8, 2, 'INSURANCE', 'INSURANCE', 'Bảo hiểm', 1155000.00, 'Tỷ lệ doanh nghiệp áp dụng', NULL, '2026-03-10 07:47:20'),
(9, 3, 'BASE', 'BASE_SALARY', 'Lương cơ bản', 10000000.00, 'Theo lịch sử chức vụ', NULL, '2026-03-10 07:47:20'),
(10, 3, 'ALLOWANCE', 'ALLOWANCE', 'Phụ cấp', 1000000.00, 'Theo chính sách vị trí', NULL, '2026-03-10 07:47:20'),
(11, 3, 'BONUS', 'BONUS', 'Thưởng', 200000.00, 'Thưởng hiệu suất', NULL, '2026-03-10 07:47:20'),
(12, 3, 'INSURANCE', 'INSURANCE', 'Bảo hiểm', 1050000.00, 'Tỷ lệ doanh nghiệp áp dụng', NULL, '2026-03-10 07:47:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payroll_periods`
--

CREATE TABLE `payroll_periods` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `month_no` tinyint(4) NOT NULL,
  `year_no` smallint(6) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('OPEN','LOCKED','PAID') NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `payroll_periods`
--

INSERT INTO `payroll_periods` (`id`, `code`, `month_no`, `year_no`, `start_date`, `end_date`, `payment_date`, `status`, `created_at`, `updated_at`) VALUES
(1, '2026-01', 1, 2026, '2026-01-01', '2026-01-31', '2026-02-05', 'PAID', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(2, '2026-02', 2, 2026, '2026-02-01', '2026-02-28', '2026-03-05', 'PAID', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(3, '2026-03', 3, 2026, '2026-03-01', '2026-03-31', NULL, 'OPEN', '2026-03-10 07:47:19', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `level_no` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `positions`
--

INSERT INTO `positions` (`id`, `code`, `name`, `description`, `level_no`, `is_active`, `created_at`, `updated_at`, `end_date`) VALUES
(1, 'DIRECTOR', 'Giám đốc', 'Điều hành doanh nghiệp', 1, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(2, 'HR_MANAGER', 'Trưởng phòng nhân sự', 'Quản lý bộ phận nhân sự', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(3, 'HR_STAFF', 'Nhân viên nhân sự', 'Thao tác nhân sự, hồ sơ, nghỉ phép, lương', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(4, 'SALES_MANAGER', 'Trưởng phòng kinh doanh', 'Quản lý bộ phận kinh doanh', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(5, 'SALES_STAFF', 'Nhân viên kinh doanh', 'Bán hàng và hỗ trợ khách hàng', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(6, 'WARE_MANAGER', 'Trưởng kho', 'Quản lý kho hàng', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(7, 'WARE_STAFF', 'Nhân viên kho', 'Nhập xuất và kiểm kê hàng hóa', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55', NULL),
(8, 'ACCOUNTANT', 'Kế toán', 'Phụ trách thanh toán và đối soát', 3, 1, '2026-03-10 07:46:55', '2026-03-16 08:02:29', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` decimal(65,2) NOT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `supplierId` int(11) NOT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `imageUrl`, `categoryId`, `supplierId`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Ca phe robusta', 'Ca phe robusta dat san Da Lat', 160000.00, './asset/img/products/1764836149221.png', 1, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:43:59'),
(2, 'Thiên Tầm Linh Trúc', 'Bùng nổ cafein vào máu', 500000.00, './asset/img/products/1764836098488.png', 1, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(3, 'Robusta Ban Mê', 'Quà quê cao cấp', 300000.00, './asset/img/products/1764836037026.png', 5, 1, 0, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(4, 'Hạ Nhớ', 'cà phê gói, thần tốc cafein', 400000.00, './asset/img/products/1764835957643.png', 1, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(5, 'Bình Minh', 'Chua nhẹ, trải nghiệm gần như ngay lập tức', 200000.00, './asset/img/products/1764835880613.png', 1, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(6, 'Ghiền Đen Đá', 'Thơm lâu, pha cold brew là hết sảy', 600000.00, './asset/img/products/1764835833991.png', 10, 7, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(7, 'Ghiền Sữa Đá', 'Vị nhẹ nhàng, sâu lắng, thích hợp với kiểu pha phin', 500000.00, './asset/img/products/1764835730752.png', 5, 6, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(8, 'Hắc Mộc Linh Hương', 'Hương thơm trầm ấm như linh mộc cổ thụ, vị đậm mạnh, dư vị kéo dài như dòng linh khí ngưng tụ.', 400000.00, './asset/img/products/1764835710011.png', 5, 2, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(9, 'Huyền Sương Cổ Vị', 'Lớp hương nhẹ lẫn khói sương núi, vị chát dịu thanh tao, gợi cảm giác cổ xưa như bước vào tiên cảnh.', 399000.00, './asset/img/products/1764835694528.png', 7, 4, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(10, 'Trầm Vân Định Ý', 'Vị đậm sâu như mây trầm tụ, giúp tinh thần tỉnh táo, tập trung như bước vào trạng thái nhập định.', 299000.00, './asset/img/products/1764835683610.png', 10, 2, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(11, 'Huyết Y Thần Phách', 'Gu đậm mạnh, kích thích giác quan, mang sắc thái mãnh liệt như huyết khí bùng nổ khi vận công.', 199000.00, './asset/img/products/1764835671214.png', 7, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(12, 'Linh Cốt Hỏa Hương', 'Rang đậm theo “hỏa luyện”, tạo hương thơm mạnh và ấm, hậu vị dày như cốt khí tu sĩ.', 990000.00, './asset/img/products/1764835658863.png', 5, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(13, 'Tịch Dạ U Hương', 'Hương thơm trầm tĩnh, phủ nét u tối của đêm sâu, phù hợp người thích cà phê đen đậm.', 399000.00, './asset/img/products/1764835641005.png', 4, 5, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(14, 'Thiên Vị Đạo Hỏa', 'Vị đậm bừng cháy, hương lan tỏa như vận thiên hỏa trong lò luyện đan.', 799000.00, './asset/img/products/1764835625480.png', 4, 6, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(15, 'Hư Vô Thanh Vị', 'Hương nhẹ tinh khiết, vị thanh tao, mềm mại như sương tinh ngưng tụ giữa hư không.', 999999.00, './asset/img/products/1764835610611.png', 3, 7, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(16, 'Cổ Phong Ma Ảnh', 'Gu đậm bí ẩn, đắng sâu, để lại dư vị mạnh mẽ như sát khí ẩn dưới bóng ma phong cổ.', 699000.00, './asset/img/products/1764835597715.png', 9, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(17, 'Linh Sơn Trầm Vị', 'Hương đất và gỗ nhẹ như khí núi linh thiêng, vị cân bằng, dễ uống.', 600000.00, './asset/img/products/1764835582533.png', 8, 2, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(18, 'Vân Khởi Minh Hương', 'Hương thơm bùng lên như mây động lúc bình minh, vị nhẹ, phù hợp người thích gu thanh.', 500000.00, './asset/img/products/1764835562867.png', 7, 1, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(19, 'Hỏa Trì Tinh Thơm', 'Rang bằng nhiệt độ cao “tinh luyện”, tạo ra mùi vị mạnh mẽ và sắc sảo.', 123456.00, './asset/img/products/1764835545361.png', 10, 3, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(20, 'Trấn Tâm Trúc Mộc', 'Hương mộc nhẹ, vị trầm bình ổn, giúp tinh thần vững tâm như trúc giữa gió.', 700000.00, './asset/img/products/1764835532611.png', 1, 4, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(21, 'U Cốc Hàn Vị', 'Vị đắng lạnh nhẹ, sắc nét, mang cảm giác cô tịch như thung lũng u tối.', 400000.00, './asset/img/products/1764835520991.png', 5, 5, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(22, 'Thần Khí Dưỡng Tinh Khôn', 'Hương thơm thanh, vị mượt, giúp “tỉnh táo – dưỡng thần” phù hợp sử dụng buổi sáng.', 600000.00, './asset/img/products/1764835510275.png', 4, 6, 1, '2026-03-14 14:40:14', '2026-03-14 14:40:14'),
(23, 'Ca phe robusta', 'Ca phe robusta dat san Da Lat', 160000.00, NULL, 1, 1, 0, '2026-03-14 14:43:09', '2026-03-14 14:44:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('cash','bank_transfer','credit_card','momo','vnpay','paypal') NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `receipts`
--

INSERT INTO `receipts` (`id`, `payment_id`, `amount`, `order_id`, `payment_method`, `description`, `created_at`) VALUES
(1, 8, 1050000.00, 3, 'vnpay', 'Biên nhận VNPay đơn hàng #3', '2026-03-18 03:10:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `resignation_requests`
--

CREATE TABLE `resignation_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `desired_last_working_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `approved_by_employee_id` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `resignation_requests`
--

INSERT INTO `resignation_requests` (`id`, `employee_id`, `desired_last_working_date`, `reason`, `status`, `approved_by_employee_id`, `approved_at`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 6, '2026-04-15', 'Chuyển nơi ở, không thuận tiện đi làm', 'APPROVED', 1, '2026-03-16 08:41:09', NULL, '2026-03-10 07:47:19', '2026-03-16 08:41:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'ADMIN', 'admin', 'Quản lý doanh nghiệp', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(2, 'USER', 'user', 'Regular user', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(3, 'WAREHOUSE', 'warehouse', 'Warehouse staff', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(4, 'SALE', 'sale', 'Sales staff', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(5, 'HRM', 'hrm', 'HR Manager', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `refresh_token_hash` varchar(255) NOT NULL,
  `jwt_id` varchar(100) NOT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `device_name` varchar(150) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `revoke_reason` varchar(100) DEFAULT NULL,
  `is_blacklisted` tinyint(1) NOT NULL DEFAULT 0,
  `replaced_by_session_id` bigint(20) DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `refresh_token_hash`, `jwt_id`, `device_id`, `device_name`, `ip_address`, `user_agent`, `issued_at`, `expires_at`, `revoked_at`, `revoke_reason`, `is_blacklisted`, `replaced_by_session_id`, `last_used_at`, `created_at`) VALUES
(1, 1, 'hashed_refresh_token_admin_device_1', 'jti-admin-device-1', 'device-admin-01', 'Chrome on Windows', '127.0.0.1', 'Mozilla/5.0', '2026-03-10 07:47:20', '2026-04-09 07:47:20', NULL, NULL, 0, NULL, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(2, 2, 'hashed_refresh_token_hrm_device_1', 'jti-hrm-device-1', 'device-hrm-01', 'Chrome on MacOS', '127.0.0.2', 'Mozilla/5.0', '2026-03-10 07:47:20', '2026-04-09 07:47:20', NULL, NULL, 0, NULL, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(3, 1, '$2a$10$V4Ey.6DNoQjqSaD6WVJUyONEIH/L6vS8XSr9INTu12b8ZdU9YkVWC', '891e5af5-4ea2-4723-85a1-14cd001ff584', '610c8500-a462-4e11-b12f-2ddecd942db2', 'PostmanRuntime/7.51.0', '::1', 'PostmanRuntime/7.51.0', '2026-03-14 14:23:11', '2026-04-13 14:23:11', '2026-03-14 14:23:34', 'Token rotated', 0, 4, '2026-03-14 14:23:34', '2026-03-14 14:23:11'),
(4, 1, '$2a$10$OVsJVo8.0qFjS75YKX0XOuM5WnKfj0P4NFd/9BuGsuGMqbAqwcTmi', '834ce84e-0426-4148-8274-0028f129b207', '610c8500-a462-4e11-b12f-2ddecd942db2', 'PostmanRuntime/7.51.0', '::1', 'PostmanRuntime/7.51.0', '2026-03-14 14:23:34', '2026-04-13 14:23:34', NULL, NULL, 0, NULL, '2026-03-14 14:23:34', '2026-03-14 14:23:34'),
(5, 1, '$2a$10$r96A90yopbti.nkAuZIrI.0FTkaBUp5uIzNu6JXCyDYBiotvHmLpa', 'bdf95ef1-9c31-4b5c-a03d-01fbb5328ac0', '7972d8fd-c809-47a1-a166-d3dc24bfe53a', 'PostmanRuntime/7.51.0', '::1', 'PostmanRuntime/7.51.0', '2026-03-14 14:28:48', '2026-04-13 14:28:48', NULL, NULL, 0, NULL, '2026-03-14 14:28:48', '2026-03-14 14:28:48'),
(6, 1, '$2a$10$yMbEXxVFJCn57zX.2Ea6qu3ZgDifWvhmiyl72ru5mtplyA0p9nyxu', '2b8e0cfb-2b89-4f48-ace7-b7bc37d20d6a', '442b5a6c-1601-4326-ab0d-f82c9192e672', 'PostmanRuntime/7.51.0', '::1', 'PostmanRuntime/7.51.0', '2026-03-14 14:30:50', '2026-04-13 14:30:50', NULL, NULL, 0, NULL, '2026-03-14 14:30:50', '2026-03-14 14:30:50'),
(7, 1, '$2a$10$FbFH6Tb/5D4dlMp.hqaQX.4TaH3U9GjCp2DNQIxWd/achqMDQWo9y', '98343071-895f-4104-a763-6a9754d7f2cc', 'cee9b4a7-debb-41c4-9184-df7fd5259dfb', 'PostmanRuntime/7.51.0', '::1', 'PostmanRuntime/7.51.0', '2026-03-14 14:47:31', '2026-04-13 14:47:31', NULL, NULL, 0, NULL, '2026-03-14 14:47:31', '2026-03-14 14:47:31'),
(8, 1, '$2a$10$9xtZJUnDa76GmT8K3zTUIOU1rf5H2X9UXyJ5597C92gLV0wqKNrDi', '5f08b1a1-a9f0-450d-9138-76caad0d45a9', 'a7c9e452-acb5-4027-8241-00c6c875028c', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-15 16:15:42', '2026-04-14 16:15:42', NULL, NULL, 0, NULL, '2026-03-15 16:15:42', '2026-03-15 16:15:42'),
(9, 1, '$2a$10$Hz9ui0tiLGH1fJD/yXr5buScLkllVufCLwy6u.5T1yA9VTSCWsILG', 'e17c5896-a52f-4c11-9c28-00064549f575', 'e002926d-0f1c-48b1-a6b4-8feb906d0366', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-15 16:35:39', '2026-04-14 16:35:39', NULL, NULL, 0, NULL, '2026-03-15 16:35:39', '2026-03-15 16:35:39'),
(10, 1, '$2a$10$6klecNuRFui6gDGSZYqcledmSiHJRBFtKtzcA57JgDZH9p1L./Etq', '8d178e90-b10c-4f5a-86e4-9bb5032ce2db', 'aa2ac3ff-82ca-4922-a0c8-f1efada1e643', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-15 17:10:41', '2026-04-14 17:10:41', NULL, NULL, 0, NULL, '2026-03-15 17:10:41', '2026-03-15 17:10:41'),
(11, 1, '$2a$10$9t6664DxJLJ2KBcdIcZWg.HWwWAcQrH3m9dA6vMetPPE2p2tULDOO', '0703e3bf-e5f5-41c2-9760-16bcfa3953c6', 'b525ebc8-9b58-4d8a-9ed4-d8045188502d', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 07:26:55', '2026-04-15 07:26:55', NULL, NULL, 0, NULL, '2026-03-16 07:26:55', '2026-03-16 07:26:55'),
(12, 1, '$2a$10$DSAImJuwSRSGerQcRMB0iO9tQ3RXdftwiOLbpmiwGCudzObQdDLYy', '97d8e24e-6278-46f1-8eff-6f87bbf8b4ae', 'fb12ca5d-5438-4a6f-9273-8044c2299678', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 07:43:08', '2026-04-15 07:43:08', NULL, NULL, 0, NULL, '2026-03-16 07:43:08', '2026-03-16 07:43:08'),
(13, 1, '$2a$10$pewZNUeMhU31HqPMaMiYoejmzTdmuK6/rTp6hQE9YNi4aXdlrDzSC', '309ad002-7f2f-46fb-a88f-8b276b893b1d', 'c079363b-4d18-4d8b-9fb3-3d925a56090b', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 07:45:12', '2026-04-15 07:45:12', NULL, NULL, 0, NULL, '2026-03-16 07:45:12', '2026-03-16 07:45:12'),
(14, 1, '$2a$10$sNmysN/Sdz5ovi2LdSg3BOIRWSLVlRCIJjMWrpmA2UyEHY6kUo/Bq', '9f4696b1-e920-4def-b599-942a791cc4c2', '00d42ef3-4d1f-4188-8bee-f4d5b4d138c1', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:01:11', '2026-04-15 08:01:11', NULL, NULL, 0, NULL, '2026-03-16 08:01:11', '2026-03-16 08:01:11'),
(15, 5, '$2a$10$nJNQYVJlVJObvvRa72zm0O4ljlEgaXDCERb/tiwKXZ8YNypPfZ8w2', '1e41d8c1-fe10-42d7-b969-18b611172f96', '7d0d6e6b-dd6a-4517-9ad9-1ec0e6db5759', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:04:34', '2026-04-15 08:04:34', NULL, NULL, 0, NULL, '2026-03-16 08:04:34', '2026-03-16 08:04:34'),
(16, 1, '$2a$10$C03U/W71JbTp3jcktOI05.tal1mimkQcbCFPJrrZcQ5EPqwTEXFU6', '3782e7a0-06e4-4029-b2de-f63d63c27ccd', 'e96b3b74-719f-43df-be8a-21f829077a30', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:06:07', '2026-04-15 08:06:07', NULL, NULL, 0, NULL, '2026-03-16 08:06:07', '2026-03-16 08:06:07'),
(17, 1, '$2a$10$1oTyJ1CkAFZ.p/0qrvE7beTUErTxu3aqrW0s1OGltDELOK5hxrl0.', 'a1fabfc6-ae2f-47f0-a6fc-087d517cac64', 'e56c1422-6ec2-47f7-93e1-fd44551b63c7', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:18:54', '2026-04-15 08:18:54', NULL, NULL, 0, NULL, '2026-03-16 08:18:54', '2026-03-16 08:18:54'),
(18, 10, '$2a$10$MnmUaYyc8wlR6qjvT.tbWeY35zIoAkfWuGGylcFF9udQuTjP8fyVu', 'a367a985-5e3e-45dd-8a86-be5429cf37ac', 'cdca3f8a-28af-4f8a-b734-cdd51c937f19', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:19:21', '2026-04-15 08:19:21', NULL, NULL, 0, NULL, '2026-03-16 08:19:21', '2026-03-16 08:19:21'),
(19, 1, '$2a$10$9zkPyrkyC8JOnyrB8KfV2eqZXWFmY5OkVZCRCks8xV7newIDK.QG.', 'c3fcf056-bd3c-4dfd-8f64-f6486ee7c26b', '1b551a8f-3eb7-4ee2-8ef5-639150dd7cd4', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:21:51', '2026-04-15 08:21:51', NULL, NULL, 0, NULL, '2026-03-16 08:21:51', '2026-03-16 08:21:51'),
(20, 10, '$2a$10$63zIqNaLYNmYpviWsv3Hd.K4QyeL5I1BptiTE6HOyErfgWCQGk.FK', 'bf38294e-dbf3-45c5-8613-c77d7cce5dac', '2ec5830a-4b0f-4afa-b369-c02822437050', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:22:31', '2026-04-15 08:22:31', NULL, NULL, 0, NULL, '2026-03-16 08:22:31', '2026-03-16 08:22:31'),
(21, 1, '$2a$10$ApEW055aq5ixz7Ww/l7YD.j7JiiY4pU/VOxmr4F/WH6DOdYBQlkD.', '3bb0b710-2a1b-42e7-af06-cd0fa595d803', 'b80781f6-fa49-4db9-bcd4-e4cd7803e3a6', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:24:07', '2026-04-15 08:24:07', NULL, NULL, 0, NULL, '2026-03-16 08:24:07', '2026-03-16 08:24:07'),
(22, 10, '$2a$10$cUrwiaqR4htAhklCkerUYeGQorBqpqgaEPtETaqRFWYPjCaUI7rk2', '7e7a1610-a623-493f-851b-4b3a7956c373', '205b076c-0ef3-424d-8342-fa316b0274a3', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:26:30', '2026-04-15 08:26:30', NULL, NULL, 0, NULL, '2026-03-16 08:26:30', '2026-03-16 08:26:30'),
(23, 10, '$2a$10$8zWI4uO9z2kIkQAD9p3dn.PJER.RxDgVFdwGCPsPDB4RaaP7tqTy.', '07dfe2cc-8928-4446-a08f-635709a7a54e', 'fcabeaf5-0dcd-4b30-9fcf-64a7a36549db', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:26:37', '2026-04-15 08:26:37', NULL, NULL, 0, NULL, '2026-03-16 08:26:37', '2026-03-16 08:26:37'),
(24, 6, '$2a$10$tuEr/MGtGkpaDUjf0kleUub.sVsYF4Rup5rUr.62FKPZAswIpYTy2', 'a9780ad3-3f01-4254-87d3-ab6c03e9154f', '83d789ac-fda2-4f9b-9f73-f1b733dc4e38', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:28:12', '2026-04-15 08:28:12', '2026-03-16 08:41:09', 'Resignation approved', 0, NULL, '2026-03-16 08:28:12', '2026-03-16 08:28:12'),
(25, 1, '$2a$10$99tO1Xr6eC6Bv8QcQIDwSesQNpNBG1/f/8TX.dWFOJo2mJQZqed4W', '74cc62fd-7924-4a21-b8d4-6a9ff1c3ba2f', 'c1a77b74-c051-462f-9c94-69a95e2e54a6', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-16 08:40:54', '2026-04-15 08:40:54', NULL, NULL, 0, NULL, '2026-03-16 08:40:54', '2026-03-16 08:40:54'),
(26, 1, '$2a$10$u6GykltlzEONWPjgisuYouAngMdhS3fbKbT1S7aE/ELNEIKPpJTzW', '1ff013f0-494d-431e-b110-ac60d9e190b6', 'f7d9e4ed-a2b9-4f0d-91f1-6cba1155d64d', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-03-18 10:08:29', '2026-04-17 10:08:29', NULL, NULL, 0, NULL, '2026-03-18 10:08:29', '2026-03-18 10:08:29'),
(27, 5, '$2a$10$rGG6Y.FRpoiKU51M3m8L5eQNhx8SXr3OFfc85GUlMofNNEN4i5FOm', 'c905fb0b-debc-4a0c-a0eb-217704e69020', '4ae266e9-db67-4e05-b2ed-298452423003', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-04-06 07:29:32', '2026-05-06 07:29:32', NULL, NULL, 0, NULL, '2026-04-06 07:29:32', '2026-04-06 07:29:32'),
(28, 1, '$2a$10$uKvn1uo2mpbNfWQxEUYHFeOGMdMslp7bx2xkVfWpAZKB8inQCMJfm', 'fd168804-8274-4c13-ad22-fa18899bd67f', '0f21a2aa-ef40-493e-a816-015e08d529f7', 'PostmanRuntime/7.51.1', '::1', 'PostmanRuntime/7.51.1', '2026-04-06 07:50:04', '2026-05-06 07:50:04', NULL, NULL, 0, NULL, '2026-04-06 07:50:04', '2026-04-06 07:50:04');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `code` varchar(191) NOT NULL,
  `contactInfo` varchar(191) DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `address`, `code`, `contactInfo`, `isActive`) VALUES
(1, 'NCC10', 'HCM-BenThanh', 'HCM1909', '01234561954', 1),
(2, 'NCC2', 'DAK LAK', 'NCCDL01', '0123456789', 1),
(3, 'NCC3', 'DAK LAK', 'NCCDL02', '012345678', 1),
(4, 'NCC4', 'DAK LAK', 'NCCDL03', '012345678', 1),
(5, 'NCC5', 'DAK LAK', 'NCCDL06', '012345678', 1),
(6, 'NCC6', 'DAK LAK', 'NCCDL05', '012345678', 1),
(7, 'NCC7', 'Lam Dong', 'NCCDL07', '012345678', 1),
(8, 'Minh\'s farm', 'DAK LAK', 'DL001', '0878254731', 1),
(9, 'Lam gau', 'hâhahaha', '112345', '01234561954', 0),
(10, 'Múc Đinh', 'DAK LAK', 'ABC123', '0878254732', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `emailVerifiedAt` datetime(3) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `roleId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `createdAt`, `updatedAt`, `deletedAt`, `lastLoginAt`, `emailVerifiedAt`, `email`, `username`, `name`, `phoneNumber`, `avatarUrl`, `password`, `isActive`, `roleId`) VALUES
(1, '2026-03-10 07:47:19.747', '2026-04-06 07:50:04.539', NULL, '2026-04-06 07:50:04.000', '2026-03-10 07:47:19.747', 'admin@coffee.local', 'admin', 'Admin Updated', '0900000001', NULL, '$2a$10$Fs9WEoONRwrvqEdwLCr.uOtI8.4VfOzvsd34jBm23juvT5sAl8Sz2', 1, 1),
(2, '2026-03-10 07:47:19.747', '2026-03-14 14:22:00.095', NULL, NULL, '2026-03-10 07:47:19.747', 'hr.manager@coffee.local', 'hrmanager', 'Trần Thị HR Manager', '0900000002', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 1, 5),
(3, '2026-03-10 07:47:19.747', '2026-03-14 14:22:03.597', NULL, NULL, '2026-03-10 07:47:19.747', 'hr.staff@coffee.local', 'hrstaff', 'Lê Văn HR Staff', '0900000003', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 1, 5),
(4, '2026-03-10 07:47:19.747', '2026-03-14 14:22:07.755', NULL, NULL, '2026-03-10 07:47:19.747', 'sale.manager@coffee.local', 'salemgr', 'Phạm Văn Sales Mgr', '0900000004', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 1, 4),
(5, '2026-03-10 07:47:19.747', '2026-04-06 07:29:32.485', NULL, '2026-04-06 07:29:32.000', '2026-03-10 07:47:19.747', 'sale.staff@coffee.local', 'salestaff', 'Hoàng Thị Sales', '0900000005', NULL, '$2a$10$Fs9WEoONRwrvqEdwLCr.uOtI8.4VfOzvsd34jBm23juvT5sAl8Sz2', 1, 4),
(6, '2026-03-10 07:47:19.747', '2026-03-16 08:41:09.871', NULL, '2026-03-16 08:28:12.000', '2026-03-10 07:47:19.747', 'warehouse@coffee.local', 'warehouse1', 'Đỗ Văn Kho', '0900000006', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 0, 3),
(7, '2026-03-10 07:47:19.747', '2026-03-14 14:32:45.304', NULL, NULL, '2026-03-10 07:47:19.747', 'accountant@coffee.local', 'account1', 'Updated Staff Name', '0900000007', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 1, 1),
(8, '2026-03-14 14:21:20.551', '2026-03-16 08:18:36.309', '2026-03-16 08:18:00.000', NULL, NULL, 'test@coffee.local', 'test_1773472880550', 'Test User', '0900000099', NULL, '$2a$10$IrMypSIDis8Z1f4SUzf.RumxROsLJKOt7z6Cxi3EF9wKy8HzEcvEa', 1, 2),
(9, '2026-03-14 14:32:25.341', '2026-03-14 14:35:23.413', NULL, NULL, NULL, 'newstaff@coffee.local', 'newstaff_1773473545340', 'New Staff', NULL, NULL, '$2a$10$ERG9C/Z57Fk.ags8jAcsf.PP8xqevwgzeWL94UxRTFcueBsrkC.6e', 1, 4),
(10, '2026-03-16 08:10:30.887', '2026-03-16 08:26:37.300', NULL, '2026-03-16 08:26:37.000', NULL, 'namielts@coffee.local', 'namielts_1773623430885', 'Nguyen Hoai Nam', NULL, NULL, '$2a$10$fXDIMmMSInItF4ZazrxEo.fLhFtcSPjdfEdmBwsJEe3rG9ECmab4m', 1, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variants`
--

CREATE TABLE `variants` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `productId` int(11) NOT NULL,
  `additionalPrice` decimal(65,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `variants`
--

INSERT INTO `variants` (`id`, `name`, `productId`, `additionalPrice`) VALUES
(1, 'size xl', 1, 170000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_attendance_employee_date` (`employee_id`,`work_date`),
  ADD KEY `idx_attendance_work_date` (`work_date`),
  ADD KEY `idx_attendance_status` (`status`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_userId_key` (`userId`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_cartId_fkey` (`cartId`),
  ADD KEY `cart_items_productId_fkey` (`productId`),
  ADD KEY `cart_items_variantId_fkey` (`variantId`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_key` (`name`),
  ADD KEY `categories_parentId_fkey` (`parentId`);

--
-- Chỉ mục cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_key` (`code`);

--
-- Chỉ mục cho bảng `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_departments_code` (`code`),
  ADD UNIQUE KEY `uk_departments_name` (`name`),
  ADD KEY `fk_departments_manager_employee` (`manager_employee_id`);

--
-- Chỉ mục cho bảng `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employees_user_id` (`user_id`),
  ADD UNIQUE KEY `uk_employees_employee_code` (`employee_code`),
  ADD KEY `idx_employees_department_id` (`department_id`),
  ADD KEY `idx_employees_manager_id` (`direct_manager_employee_id`),
  ADD KEY `idx_employees_status` (`status`),
  ADD KEY `idx_employees_hire_date` (`hire_date`);

--
-- Chỉ mục cho bảng `employee_position_history`
--
ALTER TABLE `employee_position_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eph_employee_id` (`employee_id`),
  ADD KEY `idx_eph_position_id` (`position_id`),
  ADD KEY `idx_eph_department_id` (`department_id`),
  ADD KEY `idx_eph_changed_by` (`changed_by_user_id`),
  ADD KEY `idx_eph_effective_from` (`effective_from`),
  ADD KEY `idx_eph_effective_to` (`effective_to`);

--
-- Chỉ mục cho bảng `imports`
--
ALTER TABLE `imports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Chỉ mục cho bảng `import_details`
--
ALTER TABLE `import_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_id` (`import_id`),
  ADD KEY `product_id_imports` (`product_id_imports`);

--
-- Chỉ mục cho bảng `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventories_productId_key` (`productId`);

--
-- Chỉ mục cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leave_requests_employee_id` (`employee_id`),
  ADD KEY `idx_leave_requests_leave_type_id` (`leave_type_id`),
  ADD KEY `idx_leave_requests_status` (`status`),
  ADD KEY `idx_leave_requests_approved_by` (`approved_by_employee_id`),
  ADD KEY `idx_leave_requests_dates` (`start_date`,`end_date`);

--
-- Chỉ mục cho bảng `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_leave_types_code` (`code`),
  ADD UNIQUE KEY `uk_leave_types_name` (`name`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_userId_fkey` (`userId`),
  ADD KEY `orders_couponId_fkey` (`couponId`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fkey` (`orderId`),
  ADD KEY `order_items_productId_fkey` (`productId`),
  ADD KEY `order_items_variantId_fkey` (`variantId`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `fk_payment_method` (`payment_method_id`);

--
-- Chỉ mục cho bảng `payment_bank_transfer_details`
--
ALTER TABLE `payment_bank_transfer_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Chỉ mục cho bảng `payment_card_details`
--
ALTER TABLE `payment_card_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Chỉ mục cho bảng `payment_ewallet_details`
--
ALTER TABLE `payment_ewallet_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Chỉ mục cho bảng `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_payroll_employee_period` (`payroll_period_id`,`employee_id`),
  ADD KEY `idx_payroll_employee_id` (`employee_id`),
  ADD KEY `idx_payroll_position_history_id` (`position_history_id`),
  ADD KEY `idx_payroll_generated_by` (`generated_by_user_id`),
  ADD KEY `idx_payroll_status` (`status`);

--
-- Chỉ mục cho bảng `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_items_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_items_type` (`item_type`),
  ADD KEY `idx_payroll_items_code` (`item_code`);

--
-- Chỉ mục cho bảng `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_payroll_period_code` (`code`),
  ADD UNIQUE KEY `uk_payroll_period_month_year` (`month_no`,`year_no`),
  ADD KEY `idx_payroll_periods_year_month` (`year_no`,`month_no`);

--
-- Chỉ mục cho bảng `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_positions_code` (`code`),
  ADD UNIQUE KEY `uk_positions_name` (`name`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_categoryId_fkey` (`categoryId`),
  ADD KEY `products_supplierId_fkey` (`supplierId`);

--
-- Chỉ mục cho bảng `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_receipts_payment_id` (`payment_id`);

--
-- Chỉ mục cho bảng `resignation_requests`
--
ALTER TABLE `resignation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resignation_employee_id` (`employee_id`),
  ADD KEY `idx_resignation_status` (`status`),
  ADD KEY `idx_resignation_approved_by` (`approved_by_employee_id`),
  ADD KEY `idx_resignation_last_working_date` (`desired_last_working_date`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_code_key` (`code`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sessions_jti` (`jwt_id`),
  ADD KEY `idx_sessions_user_id` (`user_id`),
  ADD KEY `idx_sessions_expires_at` (`expires_at`),
  ADD KEY `idx_sessions_blacklist` (`is_blacklisted`),
  ADD KEY `idx_sessions_replaced_by` (`replaced_by_session_id`);

--
-- Chỉ mục cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_code_key` (`code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD KEY `users_roleId_fkey` (`roleId`);

--
-- Chỉ mục cho bảng `variants`
--
ALTER TABLE `variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variants_productId_fkey` (`productId`);

--
-- Chỉ mục cho bảng `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `employee_position_history`
--
ALTER TABLE `employee_position_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `imports`
--
ALTER TABLE `imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `import_details`
--
ALTER TABLE `import_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_method_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `payroll_items`
--
ALTER TABLE `payroll_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `payroll_periods`
--
ALTER TABLE `payroll_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `resignation_requests`
--
ALTER TABLE `resignation_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `variants`
--
ALTER TABLE `variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_manager_employee` FOREIGN KEY (`manager_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_manager` FOREIGN KEY (`direct_manager_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `employee_position_history`
--
ALTER TABLE `employee_position_history`
  ADD CONSTRAINT `fk_eph_changed_by` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `imports`
--
ALTER TABLE `imports`
  ADD CONSTRAINT `imports_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `import_details`
--
ALTER TABLE `import_details`
  ADD CONSTRAINT `import_details_ibfk_1` FOREIGN KEY (`import_id`) REFERENCES `imports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `import_details_ibfk_2` FOREIGN KEY (`product_id_imports`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_approved_by` FOREIGN KEY (`approved_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`),
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payment_bank_transfer_details`
--
ALTER TABLE `payment_bank_transfer_details`
  ADD CONSTRAINT `fk_bank_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment_card_details`
--
ALTER TABLE `payment_card_details`
  ADD CONSTRAINT `fk_card_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment_ewallet_details`
--
ALTER TABLE `payment_ewallet_details`
  ADD CONSTRAINT `fk_ewallet_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_generated_by` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_period` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_position_history` FOREIGN KEY (`position_history_id`) REFERENCES `employee_position_history` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD CONSTRAINT `fk_payroll_item_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `receipts_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `resignation_requests`
--
ALTER TABLE `resignation_requests`
  ADD CONSTRAINT `fk_resign_approved_by` FOREIGN KEY (`approved_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_resign_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_replaced_by` FOREIGN KEY (`replaced_by_session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `variants`
--
ALTER TABLE `variants`
  ADD CONSTRAINT `variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
