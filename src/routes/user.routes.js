import express from "express";
import * as UserController from "../controllers/UserController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  updateUserStatusValidation,
} from "../middlewares/userValidation.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, UserController.register);
router.post("/login", loginValidation, UserController.login);

// Protected routes
router.get("/users/profile", authenticate, UserController.getProfile);
router.put(
  "/users/profile",
  authenticate,
  updateProfileValidation,
  UserController.updateProfile
);
router.put(
  "/users/password",
  authenticate,
  changePasswordValidation,
  UserController.changePassword
);

// Admin only routes
router.get("/users", authenticate, authorize(1,5), UserController.getUsers);
router.get(
  "/users/:id",
  authenticate,
  authorize(1,5),
  UserController.getUserDetail
);
router.put(
  "/users/:id/status",
  authenticate,
  authorize(1,5),
  updateUserStatusValidation,
  UserController.updateUserStatus
);

export default router;
