import { getReportSummaryForWeek } from "../../services/reportService.js";


export const getSummaryPage = async ({render, session}) => {
    
    render("summary.ejs");
}