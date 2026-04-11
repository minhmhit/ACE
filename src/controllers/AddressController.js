import { validationResult } from "express-validator";
import * as AddressService from "../services/AddressService.js";

export async function getMyAddresses(req, res, next) {
  try {
    const addresses = await AddressService.getMyAddresses(req.user.id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const address = await AddressService.createAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Tạo địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const address = await AddressService.updateAddress(
      req.user.id,
      parseInt(req.params.id),
      req.body,
    );

    res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const result = await AddressService.deleteAddress(
      req.user.id,
      parseInt(req.params.id),
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
