import Form from "../../utils/formData.js";
import { isNumber, isDate, required, minNumber, maxNumber, invalid, minLength } from "../../deps.js";
import { addReportForUser, getReportByDate } from "../../services/reportService.js";

const reportFormMorning = new Form({
    date: new Date(),
    sleepTime: "",
    sleepQuality: 1,
    mood: 1
});

const reportFormEvening = new Form({
    date: new Date(),
    sportsTime: "",
    studyingTime: "",
    eatingQuality: 1,
    mood: 1
});

const errorMessages = {
    "date": "Date cannot be empty.",
    "sleepTime.required": "Sleep duration cannot be empty.",
    "sleepTime.minNumber": "Sleep duration must be positive",

    "sleepQuality": "Sleep quality must be a number between 1 and 5.",

    "studyingTime.required": "Time spent on studies cannot be empty.",
    "studyingTime.minNumber": "Time spent on studies must be positive.",

    "sportsTime.required": "Time spent on sports cannot be empty.",
    "sportsTime.minNumber": "Time spent on sports must be positive.",

    "eatingQuality": "Eating quality must be a number between 1 and 5.",

    "mood": "General mood must be a number between 1 and 5"
};

export const getReportPage = async ({render, session}) => {

    const user = await session.get("user");

    const [morningReport, eveningReport] = await getReportByDate(user.id, new Date());

    render("reporting.ejs", {
        active: "morning",
        hasMorningReport: !!morningReport,
        hasEveningReport: !!eveningReport,
        morningForm: reportFormMorning.getEmpty(),
        eveningForm: reportFormEvening.getEmpty(),
        submitSuccess: false
    });
}

export const addReport = async ({params, request, render, response, session}) => {

    const reportForm = params.type === "morning" ? reportFormMorning : reportFormEvening;

    const user = await session.get("user");

    if (!user) {
        throw Error("Session does not contain user information");
    }

    const form = await reportForm.parse(request, {
        sleepTime: "float",
        sportsTime: "float",
        studyingTime: "float",
        sleepQuality: "int",
        eatingQuality: "int",
        mood: "int"
    });

    let validations = {
        date: [required, isDate],
        mood: [required, isNumber]
    }

    validations = Object.assign(validations, params.type === "morning" ? {
        // Morning reporting fields
        sleepTime: [required, isNumber, minNumber(0)],
        sleepQuality: [required, isNumber, minNumber(1), maxNumber(5)]
    }: {
        // Evening reporting fields
        studyingTime: [required, isNumber, minNumber(0)],
        sportsTime: [required, isNumber, minNumber(0)],
        eatingQuality: [required, isNumber, minNumber(1), maxNumber(5)],
    });

    const [passes, formWithErrors] = await reportForm.validate(form, validations, { messages: errorMessages });

    const [morningReport, eveningReport] = await getReportByDate(user.id, new Date());

    if (!passes) {
        const data = {
            hasEveningReport: !!eveningReport,
            hasMorningReport: !!morningReport,
            morningForm: params.type === "morning" ? formWithErrors : reportFormMorning.getEmpty(),
            eveningForm: params.type === "evening" ? formWithErrors : reportFormEvening.getEmpty(),
            active: params.type,
            submitSuccess: false
        };
        render("reporting.ejs", data);
        return;
    }

    await addReportForUser(form, user);

    const data = {
        morningForm: reportFormMorning.getEmpty(),
        eveningForm: reportFormEvening.getEmpty(),
        hasEveningReport: !!eveningReport,
        hasMorningReport: !!morningReport,
        active: params.type,
        submitSuccess: true,
    };

    await render("reporting.ejs", data);
}