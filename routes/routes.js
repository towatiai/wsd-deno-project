import { Router } from "../deps.js";
import { homePage } from "./controllers/homeController.js";
import { addReport, getReportPage } from "./controllers/reportController.js";

import { login, logout, loginPage, register, registerPage } from "./controllers/userController.js";

const router = new Router();


router.get("/auth/login", loginPage);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/register", registerPage);
router.post("/auth/register", register);

router.get("/", homePage);

router.get("/behavior/reporting", getReportPage);
router.post("/behavior/reporting/:type", addReport);

export { router };