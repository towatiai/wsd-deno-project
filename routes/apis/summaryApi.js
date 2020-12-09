import { 
    getReportSummaryForMonth, 
    getReportSummaryForWeek, 
    getGeneralReportSummaryByDate, 
    getGeneralReportSummaryForPastSevenDays
} from "../../services/reportService.js";

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

export const getGeneralSummaryByDate = async({params, response}) => {

    const date = new Date(params.year, params.month - 1, params.day);

    // Checks if date is valid
    if (date.getTime() !== date.getTime()) {
        response.status = 400; // Bad request
        response.body = "Invalid date";
    }

    response.body = await getGeneralReportSummaryByDate(date);
}

export const getGeneralSummary = async ({response}) => {
    
    const data = await getGeneralReportSummaryForPastSevenDays();
    response.body = data;
}