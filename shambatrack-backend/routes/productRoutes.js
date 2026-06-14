import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
} from "../controllers/productController.js";

import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("coop_admin"));

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.patch("/:id/deactivate", deactivateProduct);
router.patch("/:id/activate", deactivateProduct);

export default router;
