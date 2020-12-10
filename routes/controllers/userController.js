import Form from "../../utils/formData.js";
import { isEmail, required, invalid, minLength } from "../../deps.js";

const registerForm = new Form({
    email: "",
    password: "",
    passwordVerify: ""
});

const loginForm = new Form({
    email: "",
    password: ""
});


class UserController {

    constructor(UserService, runQuery) {
        this.userService = new UserService(runQuery);
    }


    loginPage = async ({ render }) => {
        render('login.ejs', loginForm.getEmpty());
    };

    registerPage = async ({ render }) => {
        render("registration.ejs", Object.assign(registerForm.getEmpty(), { registerSuccess: false }));
        return;
    }

    login = async ({ request, response, render, session }) => {
        const form = await loginForm.parse(request);

        const user = {
            email: form.email,
            password: form.password
        };

        const [authenticated, userResult] = await this.userService.login(user);

        if (!authenticated) {
            const data = user;
            data.errors = {
                login: "Invalid username or password."
            };
            render("login.ejs", data);

            return;
        }

        await session.set("authenticated", true);

        await session.set("user", {
            id: userResult.id,
            email: userResult.email
        });

        response.redirect("/");
    }

    logout = async ({ session, response }) => {

        await session.set("authenticated", false);
        await session.set("user", null);

        response.redirect("/");
    }

    register = async ({ request, response, render }) => {

        const form = await registerForm.parse(request);

        const password = form.password;

        const [passes, data] = await registerForm.validate(form, {
            email: [required, isEmail, this.uniqueEmail],
            password: [required, minLength(4)],
            passwordVerify: [required, this.equals(password)]
        }, {
            messages: {
                "email.isEmail": "Email has to be an email.",
                "email.unique": "Email is already reserved. Use another email.",
                "password.minLength": "Password must contain more than 4 characters.",
                "passwordVerify.equals": "Passwords don't match. Please try again."
            }
        });

        if (!passes) {
            data.registerSuccess = false;
            render("registration.ejs", data);
            return;
        }

        await this.userService.register(form);

        render("registration.ejs", Object.assign(registerForm.getEmpty(), { registerSuccess: true }));
    }

    /**
     * Custom validation rule for unique emails
     * @param {string} email Email to be checked 
     */
    uniqueEmail = async (email) => {
        const data = await this.userService.getUserByEmail(email);
        if (data.rowCount > 0) {
            return invalid("unique", { email });
        }
    }

    /**
     * Custom validation rule for equality
     * @param {string} email Email to be checked 
     */
    equals(value2) {

        return (value1) => {
            if (value1 !== value2) {
                return invalid("equals", { value1, value2 });
            }
        }

    }
}

export default UserController;
