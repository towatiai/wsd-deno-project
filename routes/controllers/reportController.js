import * as userService from "../../services/userService.js";
import Form from "../../utils/formData.js";
import { isNumber, isDate, required, minNumber, maxNumber, invalid, minLength } from "../../deps.js";

const reportForm = new Form({
    date: new Date(),
    sleepDuration: "",
    sleepQuality: 1,
    mood: 1
});

export const getReportPage = ({render}) => {
    render("reporting.ejs", reportForm.getEmpty());
}


export const addReport = async ({params, request, render, response}) => {

    await reportForm.parse(request, {
        sleepDuration: "float",
        sleepQuality: "int",
        mood: "int"
    });
    console.log("form: ", reportForm.form);

    let validations = {
        date: [required, isDate],
        mood: [required, isNumber]
    }

    validations = Object.assign(validations, params.type === "morning" ? {
        // Morning reporting fields
        sleepDuration: [required, isNumber, minNumber(0)],
        sleepQuality: [required, isNumber, minNumber(1), maxNumber(5)]
    }: {

    });

    const messages = {
        "date": "Date cannot be empty.",
        "sleepDuration.required": "Sleep duration cannot be empty.",
        "sleepDuration.minNumber": "Sleep duration must be positive",
        "sleepQuality": "Sleep quality must be a number between 1 and 5.",
        "mood": "General mood must be a number between 1 and 5"
    };

    const [passes, data] = await reportForm.validate(validations, {messages});

    if (!passes) {
        render("reporting.ejs", data);
        return;
    }

    
}