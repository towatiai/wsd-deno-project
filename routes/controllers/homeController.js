import * as userService from "../../services/userService.js";
import Form from "../../utils/formData.js";
import { isEmail, required, invalid, minLength } from "../../deps.js";
import { getMoodSummaryForPastTwoDays } from "../../services/reportService.js";

export const homePage = async ({ render, session }) => {

    const user = await session.get("user");

    const [today, yesterday] = await getMoodSummaryForPastTwoDays(user.id);

    render('home.ejs', {
        today, yesterday
    });
};