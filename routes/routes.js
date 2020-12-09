import { Router } from "../deps.js";
import { getGeneralSummary, getGeneralSummaryByDate, getSummaryByWeekAndMonth } from "./apis/summaryApi.js";
import { homePage } from "./controllers/homeController.js";
import { addReport, getReportPage } from "./controllers/reportController.js";
import { getSummaryPage } from "./controllers/summaryController.js";

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

router.get("/behavior/summary", getSummaryPage);

router.post("/api/summary", getSummaryByWeekAndMonth);
router.get("/api/summary", getGeneralSummary);
router.get("/api/summary/:year/:month/:day", getGeneralSummaryByDate);

export { router };