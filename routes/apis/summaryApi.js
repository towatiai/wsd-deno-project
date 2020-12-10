class SummaryApi {

    constructor(ReportService, queryRunner) {
        this.reportService = new ReportService(queryRunner);
    }

    getSummaryByWeekAndMonth = async ({ request, response, session }) => {

        const params = await request.body({ type: "json" }).value;

        const user = await session.get("user");

        const data = {};

        if (params.week) {
            data.week = await this.reportService.getReportSummaryForWeek(user.id, params.week);
        }

        if (params.month) {
            data.month = await this.reportService.getReportSummaryForMonth(user.id, params.month);
        }

        response.body = data;
    }

    getGeneralSummaryByDate = async ({ params, response }) => {

        const date = new Date(params.year, params.month - 1, params.day);

        // Checks if date is valid
        if (date.getTime() !== date.getTime()) {
            response.status = 400; // Bad request
            response.body = "Invalid date";
        }

        response.body = await this.reportService.getGeneralReportSummaryByDate(date);
    }

    getGeneralSummary = async ({ response }) => {

        const data = await this.reportService.getGeneralReportSummaryForPastSevenDays();
        response.body = data;
    }

}

export default SummaryApi;