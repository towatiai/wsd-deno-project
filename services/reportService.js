import debug from "../utils/debug.js";

class ReportService {

    constructor(queryRunner) {
        this.runQuery = queryRunner;
    }


    getReportByDate = async (id, date) => {

        if (id === null || typeof id === "undefined" || !date) {
            throw Error("No user id defined.");
        }

        date = new Date(date);

        const result = (await this.runQuery("SELECT * FROM user_data WHERE user_id = $1 AND date = $2;",
            id, date))?.rowsOfObjects();

        if (!result) {
            return [null, null];
        }

        return [
            result.find(this.isMorningReport),
            result.find(this.isEveningReport)
        ];
    }


    getGeneralReportSummaryByDate = async (date) => {

        if (!date) {
            throw Error("Date is not defined.");
        }

        return (await this.runQuery(`
    SELECT 
        AVG(sleep_time) as avg_sleep_time,
        AVG(sports_time) as avg_sports_time,
        AVG(studying_time) as avg_studying_time,
        AVG(sleep_quality) as avg_sleep_quality,
        AVG(mood) as avg_mood
    FROM user_data
    WHERE date = $1;`, date))?.rowsOfObjects()[0];
    }

    getGeneralReportSummaryForPastSevenDays = async () => {

        return (await this.runQuery(`
    SELECT 
        AVG(sleep_time) as avg_sleep_time,
        AVG(sports_time) as avg_sports_time,
        AVG(studying_time) as avg_studying_time,
        AVG(sleep_quality) as avg_sleep_quality,
        AVG(mood) as avg_mood
    FROM user_data
    WHERE date > CURRENT_DATE - 7;`))?.rowsOfObjects()[0];
    }


    getReportSummaryForWeek = async (id, week) => {
        if (id === null || typeof id === "undefined" || !week) {
            throw Error("No user id defined.");
        }

        return (await this.runQuery(`
    SELECT 
        AVG(sleep_time) as avg_sleep_time,
        AVG(sports_time) as avg_sports_time,
        AVG(studying_time) as avg_studying_time,
        AVG(sleep_quality) as avg_sleep_quality,
        AVG(mood) as avg_mood
    FROM user_data
    WHERE
        user_id = $1 
        AND EXTRACT(WEEK FROM date) = $2;`, id, week))?.rowsOfObjects()[0];


    }

    getReportSummaryForMonth = async (id, month) => {
        if (id === null || typeof id === "undefined" || !month) {
            throw Error("No user id defined.");
        }

        return (await this.runQuery(`
    SELECT 
        AVG(sleep_time) as avg_sleep_time,
        AVG(sports_time) as avg_sports_time,
        AVG(studying_time) as avg_studying_time,
        AVG(sleep_quality) as avg_sleep_quality,
        AVG(mood) as avg_mood
    FROM user_data
    WHERE
        user_id = $1 
        AND EXTRACT(MONTH FROM date) = $2;`, id, month))?.rowsOfObjects()[0];
    }


    getMoodSummaryForPastTwoDays = async (id) => {
        if (id === null || typeof id === "undefined") {
            throw Error("No user id defined.");
        }

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        return (await this.runQuery(`
    SELECT
        AVG(mood) as avg_mood
    FROM user_data
    WHERE
        user_id = $1 
        AND (date = $2
        OR date = $3)
    GROUP BY date
    ORDER BY date DESC;`, id, today, yesterday))?.rowsOfObjects();
    }


    addReportForUser = async (report, user) => {

        debug("LOG", "Add report", report, user);

        const id = user.id;

        const [existingMorningReport, existingEveningReport] = await this.getReportByDate(id, report.date);

        if (this.isMorningReport(report)) {

            if (existingMorningReport) {
                await this.deleteReport(id, existingMorningReport);
            }

            await this.runQuery(`INSERT INTO user_data (
            sleep_time, 
            sleep_quality,
            mood,
            date,
            user_id )
        VALUES ($1, $2, $3, $4, $5);`,
                report.sleepTime,
                report.sleepQuality,
                report.mood,
                report.date,
                id
            );

            return;
        }

        if (this.isEveningReport(report)) {

            if (existingEveningReport) {
                await this.deleteReport(id, existingEveningReport);
            }

            await this.runQuery(`INSERT INTO user_data (
            sports_time, 
            studying_time,
            eating_quality,
            mood,
            date,
            user_id )
        VALUES ($1, $2, $3, $4, $5, $6);`,
                report.sportsTime,
                report.studyingTime,
                report.eatingQuality,
                report.mood,
                report.date,
                id
            );
        }

    }


    //Private utilities

    isMorningReport(report) {
        return (report.hasOwnProperty("sleep_time") && report["sleep_time"] !== null)
            || (report.hasOwnProperty("sleepTime") && report.sleepTime !== null);
    }

    isEveningReport(report) {
        return (report.hasOwnProperty("sports_time") && report["sports_time"] !== null)
            || (report.hasOwnProperty("sportsTime") && report.sportsTime !== null);
    }

    async deleteReport(userId, report) {
        await this.runQuery("DELETE FROM user_data WHERE id = $1 AND user_id = $2;", report.id, userId);
    }
}

export default ReportService;
