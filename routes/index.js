import express from "express";
import {
  registerController,
  loginController,
  userController,
  refreshToken,
  productController,
} from "../controllers";
import admin from "../middlewares/admin";
import auth from "../middlewares/auth";
const router = express.Router();

//AUTH
router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.get("/refresh", refreshToken.refresh);
router.post("/logout", auth, loginController.logout);

//PRODUCTS
router.get("/products", productController.index);
router.get("/products/:id", productController.show);
router.post("/products", [auth, admin], productController.store);
router.put("/products/:id", [auth, admin], productController.update);
router.delete("/products/:id", [auth, admin], productController.delete);

export default router;
