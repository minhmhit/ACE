-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th10 20, 2025 lúc 10:12 AM
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
-- Cơ sở dữ liệu: `ecommerce_cofee`
--

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
(1, 3, '2025-11-11 17:14:01.642'),
(2, 8, '2025-11-11 19:52:19.296'),
(3, 2, '2025-11-11 20:12:27.842'),
(4, 4, '2025-11-13 19:24:22.117'),
(5, 5, '2025-11-13 19:59:55.289'),
(6, 6, '2025-11-13 20:00:41.766'),
(7, 9, '2025-11-13 20:41:10.072'),
(8, 10, '2025-11-14 07:58:29.879');

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
(4, 2, 5, NULL, 2, 200000.00),
(5, 2, 4, NULL, 1, 400000.00),
(6, 2, 1, NULL, 1, 200000.00);

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
(7, 'Arabica', 'Dang nhe cho buoi sang', NULL, 1),
(8, 'Arabica Lam Dong', 'Uong it thoi die som day', 7, 1),
(9, 'Arabica Gia Lai', 'Dang nhe cho buoi sang', 7, 1),
(10, 'Culi', 'Nhin ten la biet cong dung', NULL, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `validFrom` datetime(3) NOT NULL,
  `validUntil` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `discountPercent`, `validFrom`, `validUntil`) VALUES
(1, 'VNTEACHERDAY', 10, '2025-11-05 00:00:00.000', '2025-12-25 23:59:59.000'),
(3, 'XMASPLUS', 25, '2025-11-11 17:56:44.000', '2025-12-21 17:56:51.000'),
(5, 'VNDPLUS', 40, '2025-11-15 14:57:00.000', '2025-12-20 14:57:00.000');

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

--
-- Đang đổ dữ liệu cho bảng `imports`
--

INSERT INTO `imports` (`id`, `supplier_id`, `total_amount`, `import_date`, `payment_status`) VALUES
(1, 1, 12000000.00, '2025-11-11 11:44:47', 'paid'),
(2, 6, 5000000.00, '2025-11-14 03:13:05', 'paid'),
(3, 6, 20000000.00, '2025-11-14 03:17:20', 'paid'),
(4, 7, 11090000.00, '2025-11-15 07:47:38', 'paid'),
(5, 3, 99999999.99, '2025-11-15 18:19:10', 'paid'),
(6, 6, 15000000.00, '2025-11-15 18:20:16', 'paid');

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

--
-- Đang đổ dữ liệu cho bảng `import_details`
--

INSERT INTO `import_details` (`id`, `import_id`, `product_id_imports`, `quantity`, `unit_price`) VALUES
(1, 1, 1, 20, 200000.00),
(2, 1, 2, 20, 200000.00),
(3, 1, 3, 20, 200000.00),
(4, 2, 7, 100, 50000.00),
(5, 3, 6, 100, 200000.00),
(6, 4, 7, 10, 200000.00),
(7, 4, 5, 15, 300000.00),
(8, 4, 3, 17, 270000.00),
(9, 5, 22, 100, 250000.00),
(10, 5, 21, 100, 240000.00),
(11, 5, 20, 100, 230000.00),
(12, 5, 19, 100, 220000.00),
(13, 5, 18, 100, 210000.00),
(14, 5, 17, 100, 200000.00),
(15, 5, 16, 100, 260000.00),
(16, 5, 15, 100, 270000.00),
(17, 5, 14, 100, 280000.00),
(18, 5, 13, 100, 290000.00),
(19, 5, 12, 100, 300000.00),
(20, 5, 10, 100, 250000.00),
(21, 5, 9, 100, 240000.00),
(22, 5, 8, 100, 230000.00),
(23, 6, 11, 100, 150000.00);

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
(1, 57, 1),
(2, 44, 2),
(3, 54, 3),
(4, 4, 4),
(5, 27, 5),
(9, 100, 6),
(10, 110, 7),
(16, 100, 8),
(17, 100, 9),
(18, 100, 10),
(19, 100, 11),
(20, 100, 12),
(21, 100, 13),
(22, 100, 14),
(23, 100, 15),
(24, 100, 16),
(25, 100, 17),
(26, 100, 18),
(27, 100, 19),
(28, 100, 20),
(29, 100, 21),
(30, 100, 22);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `shipAddress` varchar(50) DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','SHIPPING') NOT NULL DEFAULT 'PENDING',
  `totalAmount` decimal(65,2) NOT NULL,
  `userId` int(11) NOT NULL,
  `couponId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `orderDate`, `shipAddress`, `status`, `totalAmount`, `userId`, `couponId`) VALUES
(1, '2025-11-11 18:09:26.000', NULL, 'COMPLETED', 600000.00, 3, 1),
(2, '2025-11-11 18:11:57.000', NULL, 'CANCELLED', 1000000.00, 3, 1),
(3, '2025-11-11 18:19:10.000', NULL, 'COMPLETED', 600000.00, 3, 1),
(4, '2025-11-11 18:25:29.000', NULL, 'COMPLETED', 200000.00, 3, 1),
(5, '2025-11-13 20:55:35.000', NULL, 'COMPLETED', 1600000.00, 9, NULL),
(6, '2025-11-13 21:04:17.000', NULL, 'COMPLETED', 300000.00, 9, NULL),
(7, '2025-11-13 21:20:07.000', NULL, 'PENDING', 180000.00, 9, 1),
(8, '2025-11-14 07:59:49.000', NULL, 'PENDING', 225000.00, 10, 3),
(9, '2025-11-14 08:22:44.000', NULL, 'PENDING', 400000.00, 10, NULL),
(10, '2025-11-14 08:26:41.000', NULL, 'PENDING', 200000.00, 10, NULL),
(11, '2025-11-14 08:32:54.000', NULL, 'PENDING', 180000.00, 10, 1),
(12, '2025-11-14 08:33:51.000', NULL, 'COMPLETED', 400000.00, 10, NULL),
(13, '2025-11-14 08:35:16.000', NULL, 'COMPLETED', 200000.00, 10, NULL),
(14, '2025-11-14 08:37:07.000', NULL, 'COMPLETED', 400000.00, 10, NULL),
(15, '2025-11-14 08:40:11.000', NULL, 'COMPLETED', 200000.00, 10, NULL),
(16, '2025-11-14 08:42:32.000', NULL, 'COMPLETED', 500000.00, 10, NULL),
(17, '2025-11-14 08:49:15.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(18, '2025-11-14 08:49:48.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(19, '2025-11-14 08:51:07.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(20, '2025-11-14 08:52:55.000', 'HCM', 'COMPLETED', 450000.00, 10, 1),
(21, '2025-11-14 08:55:58.000', 'An Dương vương', 'COMPLETED', 150000.00, 10, 3);

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
(1, 1, 1, 1, 200000.00, NULL),
(2, 1, 1, 4, 400000.00, NULL),
(3, 5, 2, 1, 200000.00, NULL),
(4, 1, 3, 1, 200000.00, NULL),
(5, 1, 3, 4, 400000.00, NULL),
(6, 1, 4, 1, 200000.00, NULL),
(7, 2, 5, 5, 200000.00, NULL),
(8, 1, 5, 4, 400000.00, NULL),
(9, 1, 5, 3, 300000.00, NULL),
(10, 1, 5, 2, 500000.00, NULL),
(11, 1, 6, 3, 300000.00, NULL),
(12, 1, 7, 5, 200000.00, NULL),
(13, 1, 8, 3, 300000.00, NULL),
(14, 1, 9, 4, 400000.00, NULL),
(15, 1, 10, 5, 200000.00, NULL),
(16, 1, 11, 5, 200000.00, NULL),
(17, 1, 12, 4, 400000.00, NULL),
(18, 1, 13, 5, 200000.00, NULL),
(19, 1, 14, 4, 400000.00, NULL),
(20, 1, 15, 5, 200000.00, NULL),
(21, 1, 16, 2, 500000.00, NULL),
(22, 1, 17, 2, 500000.00, NULL),
(23, 1, 18, 2, 500000.00, NULL),
(24, 1, 19, 2, 500000.00, NULL),
(25, 1, 20, 2, 500000.00, NULL),
(26, 1, 21, 5, 200000.00, NULL);

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
  `isActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `imageUrl`, `categoryId`, `supplierId`, `isActive`) VALUES
(1, 'Robusta 01', 'Chua nhẹ, uống lâu chết sớm', 200000.00, './asset/img/products/1.jpg', 1, 1, 1),
(2, 'Robusta 02', 'Chua nhẹ, dont know', 500000.00, './asset/img/products/2.jpg', 1, 1, 1),
(3, 'Robusta 03', 'không dành cho người ăn trái ác quỷ', 300000.00, './asset/img/products/3.jpg', 1, 1, 0),
(4, 'Robusta 04', 'đắng, uống đẳng cấp hơn 2 con kia', 400000.00, './asset/img/products/4.jpg', 1, 1, 1),
(5, 'hey 01', 'Chua nhẹ, uống lâu chết sớm', 200000.00, './asset/img/products/1.jpg', 1, 1, 1),
(6, 'haaha', 'Uống lâu bất tử', 600000.00, './asset/img/products/1763089047244.png', 10, 7, 1),
(7, 'haahaa', 'Uống lâu đ bất tử', 500000.00, './asset/img/products/1763089193590.png', 5, 6, 1),
(8, 'Hắc Mộc Linh Hương', 'Hương thơm trầm ấm như linh mộc cổ thụ, vị đậm mạnh, dư vị kéo dài như dòng linh khí ngưng tụ.', 400000.00, './asset/img/products/1763229655960.webp', 5, 2, 1),
(9, 'Huyền Sương Cổ Vị', 'Lớp hương nhẹ lẫn khói sương núi, vị chát dịu thanh tao, gợi cảm giác cổ xưa như bước vào tiên cảnh.', 399000.00, './asset/img/products/1763229695974.webp', 7, 4, 1),
(10, 'Trầm Vân Định Ý', 'Vị đậm sâu như mây trầm tụ, giúp tinh thần tỉnh táo, tập trung như bước vào trạng thái nhập định.', 299000.00, './asset/img/products/1763229736551.webp', 10, 2, 1),
(11, 'Huyết Y Thần Phách', 'Gu đậm mạnh, kích thích giác quan, mang sắc thái mãnh liệt như huyết khí bùng nổ khi vận công.', 199000.00, './asset/img/products/1763229773260.png', 7, 1, 1),
(12, 'Linh Cốt Hỏa Hương', 'Rang đậm theo “hỏa luyện”, tạo hương thơm mạnh và ấm, hậu vị dày như cốt khí tu sĩ.', 990000.00, './asset/img/products/1763229810060.png', 5, 1, 1),
(13, 'Tịch Dạ U Hương', 'Hương thơm trầm tĩnh, phủ nét u tối của đêm sâu, phù hợp người thích cà phê đen đậm.', 399000.00, './asset/img/products/1763229853681.png', 4, 5, 1),
(14, 'Thiên Vị Đạo Hỏa', 'Vị đậm bừng cháy, hương lan tỏa như vận thiên hỏa trong lò luyện đan.', 799000.00, './asset/img/products/1763229889348.png', 4, 6, 1),
(15, 'Hư Vô Thanh Vị', 'Hương nhẹ tinh khiết, vị thanh tao, mềm mại như sương tinh ngưng tụ giữa hư không.', 999999.00, './asset/img/products/1763230100543.webp', 3, 7, 1),
(16, 'Cổ Phong Ma Ảnh', 'Gu đậm bí ẩn, đắng sâu, để lại dư vị mạnh mẽ như sát khí ẩn dưới bóng ma phong cổ.', 699000.00, './asset/img/products/1763230137172.webp', 9, 1, 1),
(17, 'Linh Sơn Trầm Vị', 'Hương đất và gỗ nhẹ như khí núi linh thiêng, vị cân bằng, dễ uống.', 600000.00, './asset/img/products/1763230175920.webp', 8, 2, 1),
(18, 'Vân Khởi Minh Hương', 'Hương thơm bùng lên như mây động lúc bình minh, vị nhẹ, phù hợp người thích gu thanh.', 500000.00, './asset/img/products/1763230218096.png', 7, 1, 1),
(19, 'Hỏa Trì Tinh Thơm', 'Rang bằng nhiệt độ cao “tinh luyện”, tạo ra mùi vị mạnh mẽ và sắc sảo.', 123456.00, './asset/img/products/1763230251515.webp', 10, 3, 1),
(20, 'Trấn Tâm Trúc Mộc', 'Hương mộc nhẹ, vị trầm bình ổn, giúp tinh thần vững tâm như trúc giữa gió.', 700000.00, './asset/img/products/1763230293404.webp', 1, 4, 1),
(21, 'U Cốc Hàn Vị', 'Vị đắng lạnh nhẹ, sắc nét, mang cảm giác cô tịch như thung lũng u tối.', 400000.00, './asset/img/products/1763230330123.webp', 5, 5, 1),
(22, 'Thần Khí Dưỡng Tinh Khôn', 'Hương thơm thanh, vị mượt, giúp “tỉnh táo – dưỡng thần” phù hợp sử dụng buổi sáng.', 600000.00, './asset/img/products/1763230368225.png', 4, 6, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('cash','bank_transfer','credit_card','momo') NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `receipts`
--

INSERT INTO `receipts` (`id`, `amount`, `order_id`, `payment_method`, `description`, `created_at`) VALUES
(1, 200000.00, 4, 'cash', NULL, '2025-11-11 11:27:35'),
(2, 450000.00, 19, 'cash', NULL, '2025-11-14 02:13:06'),
(3, 600000.00, 1, 'cash', NULL, '2025-11-15 18:28:21'),
(4, 1600000.00, 5, 'cash', NULL, '2025-11-15 18:28:46'),
(5, 200000.00, 13, 'cash', NULL, '2025-11-15 18:30:14'),
(6, 400000.00, 12, 'cash', NULL, '2025-11-15 18:30:20'),
(7, 300000.00, 6, 'cash', NULL, '2025-11-15 18:30:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Quản lý doanh nghiệp'),
(2, 'user', 'Regular user'),
(3, 'warehouse', 'Warehouse staff'),
(4, 'sale', 'Sales staff'),
(5, 'hrm', 'HR Manager');

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
(1, 'NCC1', 'HCM', '1', '01234561954', 1),
(2, 'NCC2', 'DAK LAK', 'NCCDL01', '0123456789', 1),
(3, 'NCC3', 'DAK LAK', 'NCCDL02', '012345678', 1),
(4, 'NCC4', 'DAK LAK', 'NCCDL03', '012345678', 1),
(5, 'NCC5', 'DAK LAK', 'NCCDL06', '012345678', 1),
(6, 'NCC6', 'DAK LAK', 'NCCDL05', '012345678', 0),
(7, 'NCC7', 'Lam Dong', 'NCCDL07', '012345678', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `roleId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `createdAt`, `email`, `name`, `phoneNumber`, `password`, `isActive`, `roleId`) VALUES
(2, '2025-11-10 18:32:30.396', 'a@gmail.com', 'minh2', '0935704208', '$2a$10$lEDy2Qp8mZi.c8RNr6CDXutcHdP.lLrhP1yJSfEzAaeiez4Yu1Fne', 1, 1),
(3, '2025-11-10 18:40:20.397', 'b@gmail.com', 'minhmh1', NULL, '$2a$10$aBR3dYJtSnGbZ2KCvT.OyewgGbHsAWL2o7/4De6Tvf9D28V.OGxX6', 0, 2),
(4, '2025-11-10 18:40:29.251', 'c@gmail.com', 'minhmh2', NULL, '$2a$10$RKCnZ6Lcr.xgwcXXXW0NV.r1uos/SgPUKafy28.FD5mCCLs0yHgVO', 1, 3),
(5, '2025-11-10 18:40:38.727', 'd@gmail.com', 'minhmh3', NULL, '$2a$10$NXSJUwY200O5VhotBI0MK.d36eVQRTAavT38NbHRv9Gez2q.5VEdG', 1, 4),
(6, '2025-11-10 18:40:46.491', 'e@gmail.com', 'minhmh4', NULL, '$2a$10$JCepwS4zHQl/VGf5t8QYpOLGWNxPGd1xidz44YR.mJn6LLhvMC9si', 1, 5),
(7, '2025-11-10 18:42:25.874', 'f@gmail.com', 'minhmh5', NULL, '$2a$10$N2d8266taTu7Rr/6116W3eENd1h0ZRUEvwYGmziwx8VODhYgvJvfW', 0, 2),
(8, '2025-11-11 19:32:21.037', 'minh@gmail.com', 'Mai Hoàng Minh', NULL, '$2a$10$1ogC7BeOnn6f7OsZCilxhelzAbDL5nJyZOMIsAk.n/42z/i5SjhnC', 0, 2),
(9, '2025-11-13 20:41:03.747', 'r@gmail.com', 'Thanh Nhã Roast', '01111111111', '$2a$10$U5TbNcp2Hk1eqLrhnrBnMeEQP5yj0Osm0Xi4i9.IkEeGV1bP6OLi6', 0, 2),
(10, '2025-11-14 07:58:15.101', 'g@gmail.com', 'Đức Minh', '01111111111', '$2a$10$jHR7VzDSYIEetAYY9n1mhe8QaDBDqrjtUowLY/25fI65q0fU3RJLK', 1, 2),
(11, '2025-11-15 15:30:56.080', 'admin@gmail.com', 'Nguyễn Văn Admin', NULL, '$2a$10$CmF0hcrOa0PcaTMm.TZwV.vX2ipW5KMh1ibTBmgVaVsiFAvpe4Rm2', 1, 1),
(12, '2025-11-15 15:33:32.684', 'sale@gmail.com', 'Sale thủ', NULL, '$2a$10$jAtfTWPruL8Gw.2Xvts3ruO5af7sA9ytpZoP8RSM.CTptnC0Uktfy', 1, 2),
(13, '2025-11-15 15:39:06.302', 'nguyenvana@gmail.com', 'Đức Minh', NULL, '$2a$10$fDB8fOEqlVAc6Nlj7aAAfemRkR4ACeIoeGXTb/w7xrJ.y5biDmaV.', 1, 2),
(14, '2025-11-15 15:45:21.038', 'nam@gmail.com', 'Đức Minh', NULL, '$2a$10$VO6cooyjIOKncoQM2AnOle669UPexybPfAc3rer4FSLBV2Kch2/32', 1, 2),
(15, '2025-11-15 15:49:56.530', 'ah@gmail.com', 'How', NULL, '$2a$10$T9h9vxB3.EPse9mHt1TT9OE7MRpfJnaHPE38BVyMzOc/IuYjkHqem', 1, 2),
(16, '2025-11-15 15:53:40.528', 'nguyenvanab@gmail.com', 'Đức Minh', NULL, '$2a$10$FBgrzHzUkV2Oe0IkRs3eruVHmHxKvgzknXIPNJnwtRyPM3cJ4HTRa', 1, 4),
(17, '2025-11-15 15:55:59.551', 'nguyenvanabc@gmail.com', 'Đức Minh', NULL, '$2a$10$qBhEKA.WtxFkY6jX6X1Z4OIvzOLiZa2DMRnI8aXYhM0xgdTf7N0Au', 1, 4),
(18, '2025-11-15 15:57:36.797', 'nguyenvanabcde@gmail.com', 'Nguyễn Văn Adminh', '01111111111111', '$2a$10$2KgjjavNCFPyRNwYVxXjwet9ggOLMZwG4Sklfv4grDB494eDpAx52', 1, 2),
(19, '2025-11-15 15:59:47.588', 'nguyenvanb@gmail.com', 'Thanh Nhã', '0123456111', '$2a$10$l8Z96KLUfzqQi9N.G2excuQPLkikquUW6Vqd7oVobLZlyZVk9gZDi', 1, 1),
(20, '2025-11-20 16:05:29.915', 'fs@gmail.com', 'minhmh5', NULL, '$2a$10$/a42KXedaL/zGeIMUSayCuSCF1sznmejMmscJOH.LzD58jIX.o7Ha', 1, 1);

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
(1, 'hey plus', 5, 500000.00);

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
-- Đang đổ dữ liệu cho bảng `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('26675090-fb36-4910-b281-eef2047a78dc', '9300a14b71e99bc7b085cdb12ac1ec34085a2f9c1d3b0f9d051c2835ec3962b9', '2025-10-31 13:33:30.341', '20251031133330_init', NULL, NULL, '2025-10-31 13:33:30.190', 1),
('45b8c423-1a47-4d8a-ad79-600bd9d1fba6', '749a54573c820ba6fca4fe9793be6aa0049be0d55e2b29d0e8ec2ad8f6f699fd', '2025-10-31 13:41:49.773', '20251031134149_update_variant_add_price', NULL, NULL, '2025-10-31 13:41:49.764', 1),
('6772cd7e-4fda-4a6a-83f4-9c12df3b7c24', 'abccfadc215a1bfab0a802ec7b48116adf0c3d556fee4c945b66f0e5cb7c9d36', '2025-10-31 13:44:16.021', '20251031134415_add_order_models', NULL, NULL, '2025-10-31 13:44:15.891', 1),
('aad30cb1-f4f5-4ac0-afb5-fdf889399e35', '71117bb949c54b165b83490ef88d6227deb864ea24d69cd49a8964343e6b2f1b', '2025-10-31 14:01:32.150', '20251031140131_add_cart_models', NULL, NULL, '2025-10-31 14:01:31.949', 1),
('b24ae8dc-ec83-4b01-a25d-6790544a1603', '37cfd69139697d2c647b2d323bacad6aec056535818682c33e5afbf532bf863d', '2025-10-31 13:47:06.897', '20251031134706_update_orderitem_add_variant', NULL, NULL, '2025-10-31 13:47:06.842', 1),
('dec6b9de-c3db-400d-80f4-c73a959362ba', '13a2296d86d773ee683e7f389f31a2d0902e2bbb007b239f2a8a363a77cf3c72', '2025-10-31 13:39:32.939', '20251031133932_add_product_models', NULL, NULL, '2025-10-31 13:39:32.652', 1),
('f9cedfdd-2a05-43ba-8e6e-1c0f7d1c9634', '2b151d68feae08b1042c8eeb2a59caa31216e546b16cebf244cd93c861fc0f95', '2025-10-31 13:52:43.173', '20251031135243_add_coupon_model', NULL, NULL, '2025-10-31 13:52:43.103', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

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
  ADD UNIQUE KEY `categories_name_key` (`name`);

--
-- Chỉ mục cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_key` (`code`);

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
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

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
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `imports`
--
ALTER TABLE `imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `import_details`
--
ALTER TABLE `import_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `variants`
--
ALTER TABLE `variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

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
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

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
