import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  cookieChecker,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/cookieChecker").get(auth, cookieChecker);

router.route("/logout").get(logoutUser);

export default router;
