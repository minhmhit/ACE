import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "ecommerce_cofee",
  waitForConnections: true,
  connectionLimit: 100,
  connectTimeout: 10000000,
  queueLimit: 0,
});

//Thông báo kết nối mysql thành công
pool
  .getConnection()
  .then(() => {
    console.log("Kết nối MySQL thành công!");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MySQL:", err);
  });
