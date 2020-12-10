import { Router } from "../deps.js";
import ReportService from "../services/reportService.js";
import UserService from "../services/userService.js";

import SummaryApi from "./apis/summaryApi.js";

import ReportController from "./controllers/reportController.js";
import UserController from "./controllers/userController.js";
import HomeController from "./controllers/homeController.js";

import { getSummaryPage } from "./controllers/summaryController.js";


export default class {
    constructor(runQuery) {
        this.reportController = new ReportController(ReportService, runQuery);
        this.userController = new UserController(UserService, runQuery);
        this.summaryApi = new SummaryApi(ReportService, runQuery);
        this.homeController = new HomeController(ReportService, runQuery);
    }

    getRoutes() {
        const router = new Router();

        router.get("/auth/login", this.userController.loginPage);
        router.post("/auth/login", this.userController.login);
        router.post("/auth/logout", this.userController.logout);
        router.get("/auth/register", this.userController.registerPage);
        router.post("/auth/register", this.userController.register);
        
        router.get("/", this.homeController.homePage);
        
        router.get("/behavior/reporting", this.reportController.getReportPage);
        router.post("/behavior/reporting/:type", this.reportController.addReport);
        
        router.get("/behavior/summary", getSummaryPage);
        
        router.post("/api/summary", this.summaryApi.getSummaryByWeekAndMonth);
        router.get("/api/summary", this.summaryApi.getGeneralSummary);
        router.get("/api/summary/:year/:month/:day", this.getGeneralSummaryByDate);

        return router.routes();
    }
}