import runQuery from "../database/runQuery.js";
import { hash, compare } from "../deps.js";
import debug from "../utils/debug.js";


export const getReportByDate = async(id, date) => {

    if (id === null || typeof id === "undefined" || !date) {
        throw Error("No user id defined.");
    }

    date = new Date(date);

    const result = (await runQuery("SELECT * FROM user_data WHERE user_id = $1 AND date = $2;",
        id, date))?.rowsOfObjects();

    console.log(result);

    if (!result) {
        return [null, null];
    }

    return [
        result.find(isMorningReport),
        result.find(isEveningReport)
    ];
}


export const getReportSummaryForWeek = async(id, week) => {
    if (id === null || typeof id === "undefined" || !week) {
        throw Error("No user id defined.");
    }

    return (await runQuery(`
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

export const getReportSummaryForMonth = async(id, month) => {
    if (id === null || typeof id === "undefined" || !month) {
        throw Error("No user id defined.");
    }

    return (await runQuery(`
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


export const getMoodSummaryForPastTwoDays = async(id) => {
    if (id === null || typeof id === "undefined") {
        throw Error("No user id defined.");
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return (await runQuery(`
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


export const addReportForUser = async (report, user) => {

    debug("LOG", "Add report", report, user);

    const id = user.id;

    const [existingMorningReport, existingEveningReport] = await getReportByDate(id, report.date);

    if (isMorningReport(report)) {
        
        if (existingMorningReport) {
            await deleteReport(id, existingMorningReport);
        }

        await runQuery(`INSERT INTO user_data (
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
    
    if (isEveningReport(report)) {
        
        if (existingEveningReport) {
            await deleteReport(id, existingEveningReport);
        }

        await runQuery(`INSERT INTO user_data (
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

function isMorningReport(report) {
    return (report.hasOwnProperty("sleep_time") && report["sleep_time"] !== null )
    || (report.hasOwnProperty("sleepTime") && report.sleepTime !== null);
}

function isEveningReport(report) {
    return ( report.hasOwnProperty("sports_time") && report["sports_time"] !== null )
    || ( report.hasOwnProperty("sportsTime") && report.sportsTime !== null);
}

async function deleteReport(userId, report) {
    await runQuery("DELETE FROM user_data WHERE id = $1 AND user_id = $2;", report.id, userId);
}