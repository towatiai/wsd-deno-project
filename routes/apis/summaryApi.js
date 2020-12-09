import { getReportSummaryForMonth, getReportSummaryForWeek } from "../../services/reportService.js";

export const getSummaryByWeekAndMonth = async ({request, response, session}) => {
    
    const params = await request.body({type: "json"}).value;

    const user = await session.get("user");

    const data = {};

    if (params.week) {
        data.week = await getReportSummaryForWeek(user.id, params.week);
    }

    if (params.month) {
        data.month = await getReportSummaryForMonth(user.id, params.month);
    }

    response.body = data;
}