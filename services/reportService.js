import runQuery from "../database/runQuery.js";
import { hash, compare } from "../deps.js";
import debug from "../utils/debug.js";


export const getReportByDate = async(id, date) => {

    if (id === null || typeof id === "undefined" || !date) {
        throw Error();
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