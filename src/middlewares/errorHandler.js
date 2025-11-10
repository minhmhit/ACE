// export function errorHandler(err, req, res, next) {
//   console.error(err.stack);

//   // Xử lý lỗi validation
//   if (err.name === "ValidationError") {
//     return res.status(400).json({
//       error: "Dữ liệu không hợp lệ",
//       details: err.details,
//     });
//   }

//   // Xử lý lỗi xác thực
//   if (err.name === "UnauthorizedError") {
//     return res.status(401).json({
//       error: "Không có quyền truy cập",
//     });
//   }

//   // Xử lý lỗi không tìm thấy tài nguyên
//   if (err.name === "NotFoundError") {
//     return res.status(404).json({
//       error: "Không tìm thấy tài nguyên",
//     });
//   }

//   // Lỗi mặc định
//   res.status(500).json({
//     error: "Lỗi hệ thống",
//   });
// }
