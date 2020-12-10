
class HomeController {

    constructor(ReportService, runQuery) {
        this.reportService = new ReportService(runQuery);
    }

    homePage = async ({ render, session }) => {

        const user = await session.get("user");

        const generalReport = await this.reportService.getGeneralReportSummaryForPastSevenDays();

        if (!user) {
            render("home.ejs", { generalReport, today: null, yesterday: null });
            return;
        }

        const [today, yesterday] = await this.reportService.getMoodSummaryForPastTwoDays(user.id);
    
        render('home.ejs', {
            today, yesterday, generalReport
        });
    };
}


export default HomeController;