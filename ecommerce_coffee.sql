-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 10, 2026 at 01:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_coffee`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
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
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `work_date`, `check_in`, `check_out`, `work_minutes`, `overtime_minutes`, `status`, `note`) VALUES
(1, 3, '2026-03-01', '2026-03-01 08:00:00', '2026-03-01 17:00:00', 540, 0, 'PRESENT', NULL),
(2, 5, '2026-03-01', '2026-03-01 08:15:00', '2026-03-01 17:30:00', 555, 30, 'PRESENT', NULL),
(3, 6, '2026-03-01', '2026-03-01 08:00:00', '2026-03-01 18:00:00', 600, 60, 'PRESENT', NULL),
(4, 5, '2026-03-02', NULL, NULL, 0, 0, 'PAID_LEAVE', 'Nghỉ phép năm'),
(5, 3, '2026-03-02', '2026-03-02 08:05:00', '2026-03-02 17:00:00', 535, 0, 'PRESENT', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cartId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `variantId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `validFrom` datetime(3) NOT NULL,
  `validUntil` datetime(3) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
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
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `manager_employee_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BOD', 'Ban giám đốc', 'Bộ phận điều hành doanh nghiệp', 1, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(2, 'HR', 'Nhân sự', 'Quản lý hồ sơ nhân sự, nghỉ phép, lương thưởng', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(3, 'SALES', 'Kinh doanh', 'Bán hàng và chăm sóc khách hàng', 4, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(4, 'WAREHOUSE', 'Kho vận', 'Quản lý kho, nhập xuất hàng', 6, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19'),
(5, 'ACCOUNT', 'Kế toán', 'Quản lý thu chi, đối soát thanh toán', 7, 1, '2026-03-10 07:46:55', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
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
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `employee_code`, `department_id`, `direct_manager_employee_id`, `employment_type`, `status`, `hire_date`, `official_date`, `termination_date`, `date_of_birth`, `gender`, `national_id`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `bank_account_no`, `bank_account_name`, `bank_name`, `created_at`, `updated_at`) VALUES
(1, 1, 'EMP0001', 1, NULL, 'FULL_TIME', 'ACTIVE', '2024-01-01', '2024-01-01', NULL, '1988-05-10', 'MALE', '012345678901', 'TP.HCM', 'Nguyễn Thị A', '0911111111', '1000000001', 'NGUYEN VAN ADMIN', 'VCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(2, 2, 'EMP0002', 2, 1, 'FULL_TIME', 'ACTIVE', '2024-01-10', '2024-02-10', NULL, '1990-03-15', 'FEMALE', '012345678902', 'TP.HCM', 'Trần Văn B', '0911111112', '1000000002', 'TRAN THI HR MANAGER', 'ACB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(3, 3, 'EMP0003', 2, 2, 'FULL_TIME', 'ACTIVE', '2024-02-01', '2024-03-01', NULL, '1996-07-21', 'MALE', '012345678903', 'TP.HCM', 'Lê Thị C', '0911111113', '1000000003', 'LE VAN HR STAFF', 'TCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(4, 4, 'EMP0004', 3, 1, 'FULL_TIME', 'ACTIVE', '2024-01-15', '2024-02-15', NULL, '1989-10-01', 'MALE', '012345678904', 'TP.HCM', 'Phạm Thị D', '0911111114', '1000000004', 'PHAM VAN SALES MGR', 'VCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(5, 5, 'EMP0005', 3, 4, 'FULL_TIME', 'ACTIVE', '2024-03-01', '2024-04-01', NULL, '1998-09-12', 'FEMALE', '012345678905', 'TP.HCM', 'Hoàng Văn E', '0911111115', '1000000005', 'HOANG THI SALES', 'MBB', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(6, 6, 'EMP0006', 4, 1, 'FULL_TIME', 'ACTIVE', '2024-02-20', '2024-03-20', NULL, '1994-12-09', 'MALE', '012345678906', 'TP.HCM', 'Đỗ Thị F', '0911111116', '1000000006', 'DO VAN KHO', 'BIDV', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(7, 7, 'EMP0007', 5, 1, 'FULL_TIME', 'ACTIVE', '2024-02-25', '2024-03-25', NULL, '1993-11-11', 'FEMALE', '012345678907', 'TP.HCM', 'Ngô Văn G', '0911111117', '1000000007', 'NGO THI KE TOAN', 'VCB', '2026-03-10 07:47:19', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `employee_position_history`
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
-- Dumping data for table `employee_position_history`
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
-- Table structure for table `imports`
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
-- Table structure for table `import_details`
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
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `productId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
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
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `request_type`, `start_date`, `end_date`, `total_days`, `reason`, `attachment_url`, `status`, `approved_by_employee_id`, `approved_at`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'ANNUAL_LEAVE', '2026-03-02', '2026-03-02', 1.00, 'Nghỉ phép cá nhân', NULL, 'APPROVED', 4, '2026-02-28 15:00:00', NULL, '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(2, 3, 2, 'SICK_LEAVE', '2026-03-05', '2026-03-05', 1.00, 'Sốt cao, xin nghỉ 1 ngày', '/uploads/medical-note-emp0003.pdf', 'PENDING', NULL, NULL, NULL, '2026-03-10 07:47:19', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
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
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `code`, `name`, `is_paid`, `requires_attachment`, `max_days_per_year`, `is_active`) VALUES
(1, 'ANNUAL', 'Nghỉ phép năm', 1, 0, 12.00, 1),
(2, 'SICK', 'Nghỉ ốm', 1, 1, NULL, 1),
(3, 'MATERNITY', 'Nghỉ thai sản', 1, 1, NULL, 1),
(4, 'UNPAID', 'Nghỉ không lương', 0, 0, NULL, 1),
(5, 'OTHER', 'Khác', 0, 0, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
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

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL,
  `variantId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
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

-- --------------------------------------------------------

--
-- Table structure for table `payment_bank_transfer_details`
--

CREATE TABLE `payment_bank_transfer_details` (
  `payment_id` bigint(20) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `transfer_reference` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_card_details`
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
-- Table structure for table `payment_ewallet_details`
--

CREATE TABLE `payment_ewallet_details` (
  `payment_id` bigint(20) NOT NULL,
  `provider` enum('MOMO','VNPAY','ZALOPAY','PAYPAL') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `response_code` varchar(50) DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `payment_method_id` int(11) NOT NULL,
  `code` enum('CASH','CARD','MOMO','VNPAY','PAYPAL') NOT NULL DEFAULT 'CASH',
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`payment_method_id`, `code`, `name`, `is_active`, `created_at`) VALUES
(1, 'CASH', 'Tiền mặt', 1, '2026-03-10 00:46:55'),
(2, 'CARD', 'Thẻ ngân hàng', 1, '2026-03-10 00:46:55'),
(3, 'MOMO', 'Ví MoMo', 1, '2026-03-10 00:46:55'),
(4, 'VNPAY', 'VNPay', 1, '2026-03-10 00:46:55'),
(5, 'PAYPAL', 'PayPal', 1, '2026-03-10 00:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `payrolls`
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
-- Dumping data for table `payrolls`
--

INSERT INTO `payrolls` (`id`, `payroll_period_id`, `employee_id`, `position_history_id`, `base_salary`, `allowance_total`, `bonus_total`, `deduction_total`, `gross_salary`, `insurance_amount`, `tax_amount`, `net_salary`, `payable_salary`, `calculation_note`, `status`, `generated_at`, `generated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 3, 12000000.00, 1000000.00, 500000.00, 0.00, 13500000.00, 1260000.00, 0.00, 12240000.00, 12240000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(2, 2, 5, 5, 11000000.00, 1000000.00, 300000.00, 0.00, 12300000.00, 1155000.00, 0.00, 11145000.00, 11145000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(3, 2, 6, 6, 10000000.00, 1000000.00, 200000.00, 0.00, 11200000.00, 1050000.00, 0.00, 10150000.00, 10150000.00, 'Lương tháng 02/2026', 'FINALIZED', '2026-03-10 07:47:20', 2, '2026-03-10 07:47:20', '2026-03-10 07:47:20');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_items`
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
-- Dumping data for table `payroll_items`
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
-- Table structure for table `payroll_periods`
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
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`id`, `code`, `month_no`, `year_no`, `start_date`, `end_date`, `payment_date`, `status`, `created_at`, `updated_at`) VALUES
(1, '2026-01', 1, 2026, '2026-01-01', '2026-01-31', '2026-02-05', 'PAID', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(2, '2026-02', 2, 2026, '2026-02-01', '2026-02-28', '2026-03-05', 'PAID', '2026-03-10 07:47:19', '2026-03-10 07:47:19'),
(3, '2026-03', 3, 2026, '2026-03-01', '2026-03-31', NULL, 'OPEN', '2026-03-10 07:47:19', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `level_no` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `code`, `name`, `description`, `level_no`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'DIRECTOR', 'Giám đốc', 'Điều hành doanh nghiệp', 1, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(2, 'HR_MANAGER', 'Trưởng phòng nhân sự', 'Quản lý bộ phận nhân sự', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(3, 'HR_STAFF', 'Nhân viên nhân sự', 'Thao tác nhân sự, hồ sơ, nghỉ phép, lương', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(4, 'SALES_MANAGER', 'Trưởng phòng kinh doanh', 'Quản lý bộ phận kinh doanh', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(5, 'SALES_STAFF', 'Nhân viên kinh doanh', 'Bán hàng và hỗ trợ khách hàng', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(6, 'WARE_MANAGER', 'Trưởng kho', 'Quản lý kho hàng', 2, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(7, 'WARE_STAFF', 'Nhân viên kho', 'Nhập xuất và kiểm kê hàng hóa', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55'),
(8, 'ACCOUNTANT', 'Kế toán', 'Phụ trách thanh toán và đối soát', 3, 1, '2026-03-10 07:46:55', '2026-03-10 07:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `products`
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

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
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

-- --------------------------------------------------------

--
-- Table structure for table `resignation_requests`
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
-- Dumping data for table `resignation_requests`
--

INSERT INTO `resignation_requests` (`id`, `employee_id`, `desired_last_working_date`, `reason`, `status`, `approved_by_employee_id`, `approved_at`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 6, '2026-04-15', 'Chuyển nơi ở, không thuận tiện đi làm', 'PENDING', NULL, NULL, NULL, '2026-03-10 07:47:19', '2026-03-10 07:47:19');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
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
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'ADMIN', 'admin', 'Quản lý doanh nghiệp', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(2, 'USER', 'user', 'Regular user', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(3, 'WAREHOUSE', 'warehouse', 'Warehouse staff', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(4, 'SALE', 'sale', 'Sales staff', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17'),
(5, 'HRM', 'hrm', 'HR Manager', 1, '2026-03-10 00:46:17', '2026-03-10 00:46:17');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
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
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `refresh_token_hash`, `jwt_id`, `device_id`, `device_name`, `ip_address`, `user_agent`, `issued_at`, `expires_at`, `revoked_at`, `revoke_reason`, `is_blacklisted`, `replaced_by_session_id`, `last_used_at`, `created_at`) VALUES
(1, 1, 'hashed_refresh_token_admin_device_1', 'jti-admin-device-1', 'device-admin-01', 'Chrome on Windows', '127.0.0.1', 'Mozilla/5.0', '2026-03-10 07:47:20', '2026-04-09 07:47:20', NULL, NULL, 0, NULL, '2026-03-10 07:47:20', '2026-03-10 07:47:20'),
(2, 2, 'hashed_refresh_token_hrm_device_1', 'jti-hrm-device-1', 'device-hrm-01', 'Chrome on MacOS', '127.0.0.2', 'Mozilla/5.0', '2026-03-10 07:47:20', '2026-04-09 07:47:20', NULL, NULL, 0, NULL, '2026-03-10 07:47:20', '2026-03-10 07:47:20');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `code` varchar(191) NOT NULL,
  `contactInfo` varchar(191) DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `createdAt`, `updatedAt`, `deletedAt`, `lastLoginAt`, `emailVerifiedAt`, `email`, `username`, `name`, `phoneNumber`, `avatarUrl`, `password`, `isActive`, `roleId`) VALUES
(1, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'admin@coffee.local', 'admin', 'Nguyễn Văn Admin', '0900000001', NULL, '$2b$10$example_admin_hash', 1, 1),
(2, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'hr.manager@coffee.local', 'hrmanager', 'Trần Thị HR Manager', '0900000002', NULL, '$2b$10$example_hrm_hash', 1, 5),
(3, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'hr.staff@coffee.local', 'hrstaff', 'Lê Văn HR Staff', '0900000003', NULL, '$2b$10$example_hr_hash', 1, 5),
(4, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'sale.manager@coffee.local', 'salemgr', 'Phạm Văn Sales Mgr', '0900000004', NULL, '$2b$10$example_sale_mgr', 1, 4),
(5, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'sale.staff@coffee.local', 'salestaff', 'Hoàng Thị Sales', '0900000005', NULL, '$2b$10$example_sale_hash', 1, 4),
(6, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'warehouse@coffee.local', 'warehouse1', 'Đỗ Văn Kho', '0900000006', NULL, '$2b$10$example_wh_hash', 1, 3),
(7, '2026-03-10 07:47:19.747', '2026-03-10 07:47:19.747', NULL, NULL, '2026-03-10 07:47:19.747', 'accountant@coffee.local', 'account1', 'Ngô Thị Kế Toán', '0900000007', NULL, '$2b$10$example_acc_hash', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `variants`
--

CREATE TABLE `variants` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `productId` int(11) NOT NULL,
  `additionalPrice` decimal(65,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
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
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_attendance_employee_date` (`employee_id`,`work_date`),
  ADD KEY `idx_attendance_work_date` (`work_date`),
  ADD KEY `idx_attendance_status` (`status`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_userId_key` (`userId`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_cartId_fkey` (`cartId`),
  ADD KEY `cart_items_productId_fkey` (`productId`),
  ADD KEY `cart_items_variantId_fkey` (`variantId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_key` (`name`),
  ADD KEY `categories_parentId_fkey` (`parentId`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_key` (`code`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_departments_code` (`code`),
  ADD UNIQUE KEY `uk_departments_name` (`name`),
  ADD KEY `fk_departments_manager_employee` (`manager_employee_id`);

--
-- Indexes for table `employees`
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
-- Indexes for table `employee_position_history`
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
-- Indexes for table `imports`
--
ALTER TABLE `imports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `import_details`
--
ALTER TABLE `import_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_id` (`import_id`),
  ADD KEY `product_id_imports` (`product_id_imports`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventories_productId_key` (`productId`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leave_requests_employee_id` (`employee_id`),
  ADD KEY `idx_leave_requests_leave_type_id` (`leave_type_id`),
  ADD KEY `idx_leave_requests_status` (`status`),
  ADD KEY `idx_leave_requests_approved_by` (`approved_by_employee_id`),
  ADD KEY `idx_leave_requests_dates` (`start_date`,`end_date`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_leave_types_code` (`code`),
  ADD UNIQUE KEY `uk_leave_types_name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_userId_fkey` (`userId`),
  ADD KEY `orders_couponId_fkey` (`couponId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fkey` (`orderId`),
  ADD KEY `order_items_productId_fkey` (`productId`),
  ADD KEY `order_items_variantId_fkey` (`variantId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `fk_payment_method` (`payment_method_id`);

--
-- Indexes for table `payment_bank_transfer_details`
--
ALTER TABLE `payment_bank_transfer_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `payment_card_details`
--
ALTER TABLE `payment_card_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `payment_ewallet_details`
--
ALTER TABLE `payment_ewallet_details`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_payroll_employee_period` (`payroll_period_id`,`employee_id`),
  ADD KEY `idx_payroll_employee_id` (`employee_id`),
  ADD KEY `idx_payroll_position_history_id` (`position_history_id`),
  ADD KEY `idx_payroll_generated_by` (`generated_by_user_id`),
  ADD KEY `idx_payroll_status` (`status`);

--
-- Indexes for table `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_items_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_items_type` (`item_type`),
  ADD KEY `idx_payroll_items_code` (`item_code`);

--
-- Indexes for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_payroll_period_code` (`code`),
  ADD UNIQUE KEY `uk_payroll_period_month_year` (`month_no`,`year_no`),
  ADD KEY `idx_payroll_periods_year_month` (`year_no`,`month_no`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_positions_code` (`code`),
  ADD UNIQUE KEY `uk_positions_name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_categoryId_fkey` (`categoryId`),
  ADD KEY `products_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_receipts_payment_id` (`payment_id`);

--
-- Indexes for table `resignation_requests`
--
ALTER TABLE `resignation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resignation_employee_id` (`employee_id`),
  ADD KEY `idx_resignation_status` (`status`),
  ADD KEY `idx_resignation_approved_by` (`approved_by_employee_id`),
  ADD KEY `idx_resignation_last_working_date` (`desired_last_working_date`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_code_key` (`code`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sessions_jti` (`jwt_id`),
  ADD KEY `idx_sessions_user_id` (`user_id`),
  ADD KEY `idx_sessions_expires_at` (`expires_at`),
  ADD KEY `idx_sessions_blacklist` (`is_blacklisted`),
  ADD KEY `idx_sessions_replaced_by` (`replaced_by_session_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_code_key` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD KEY `users_roleId_fkey` (`roleId`);

--
-- Indexes for table `variants`
--
ALTER TABLE `variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variants_productId_fkey` (`productId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imports`
--
ALTER TABLE `imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `import_details`
--
ALTER TABLE `import_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_method_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payroll_items`
--
ALTER TABLE `payroll_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resignation_requests`
--
ALTER TABLE `resignation_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `variants`
--
ALTER TABLE `variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_manager_employee` FOREIGN KEY (`manager_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_manager` FOREIGN KEY (`direct_manager_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  ADD CONSTRAINT `fk_eph_changed_by` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eph_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `imports`
--
ALTER TABLE `imports`
  ADD CONSTRAINT `imports_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `import_details`
--
ALTER TABLE `import_details`
  ADD CONSTRAINT `import_details_ibfk_1` FOREIGN KEY (`import_id`) REFERENCES `imports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `import_details_ibfk_2` FOREIGN KEY (`product_id_imports`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_approved_by` FOREIGN KEY (`approved_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`),
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment_bank_transfer_details`
--
ALTER TABLE `payment_bank_transfer_details`
  ADD CONSTRAINT `fk_bank_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_card_details`
--
ALTER TABLE `payment_card_details`
  ADD CONSTRAINT `fk_card_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_ewallet_details`
--
ALTER TABLE `payment_ewallet_details`
  ADD CONSTRAINT `fk_ewallet_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE CASCADE;

--
-- Constraints for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_generated_by` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_period` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_position_history` FOREIGN KEY (`position_history_id`) REFERENCES `employee_position_history` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD CONSTRAINT `fk_payroll_item_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `receipts_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `resignation_requests`
--
ALTER TABLE `resignation_requests`
  ADD CONSTRAINT `fk_resign_approved_by` FOREIGN KEY (`approved_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_resign_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_replaced_by` FOREIGN KEY (`replaced_by_session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `variants`
--
ALTER TABLE `variants`
  ADD CONSTRAINT `variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
