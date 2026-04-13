import express from "express";
import * as AddressController from "../controllers/AddressController.js";
import {
  createAddressValidation,
  updateAddressValidation,
  addressIdValidation,
} from "../middlewares/addressValidation.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, AddressController.getMyAddresses);

router.get("/default", authenticate, AddressController.getDefaultAddress);

router.post(
  "/",
  authenticate,
  createAddressValidation,
  AddressController.createAddress,
);

router.put(
  "/:id",
  authenticate,
  updateAddressValidation,
  AddressController.updateAddress,
);

router.delete(
  "/:id",
  authenticate,
  addressIdValidation,
  AddressController.deleteAddress,
);

export default router;
