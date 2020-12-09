import runQuery from "../database/runQuery.js";
import { hash, compare } from "../deps.js";
import debug from "../utils/debug.js";

export const getUserByEmail = async (email) => {
    return await runQuery("SELECT * FROM users WHERE email = $1;", email);
}


export const login = async (user) => {
    debug("LOG", "Logging in", user);

    if (!user.password || !user.email) {
        return [false, null];
    }

    const email = user.email;
    const result = await getUserByEmail(email);

    if (result.rowCount === 0) {
        return [false, null];
    }

    const userResult = result.rowsOfObjects()[0];

    if (await compare(user.password, userResult.password)) {
        return [true, userResult];
    }

    return [false, null];
}

export const register = async (user) => {
    
    debug("LOG", "Registering user", user);

    if (!user.password || !user.email) {
        throw new ReferenceError("Unable to register user. Missing user information.", user);
    }

    const password = await hash(user.password);
    const email = user.email;

    await runQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);
}