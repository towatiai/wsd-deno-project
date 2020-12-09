import * as userService from "../../services/userService.js";
import Form from "../../utils/formData.js";
import { isEmail, required, invalid, minLength } from "../../deps.js";

export const homePage = async ({ render }) => {
    render('home.ejs');
};