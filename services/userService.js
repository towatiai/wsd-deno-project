import debug from "../utils/debug.js";


class UserService {

    constructor(queryRunner, bcrypt) {
        this.runQuery = queryRunner;
        this.bcrypt = bcrypt;
    }

    getUserByEmail = async (email) => {
        return await this.runQuery("SELECT * FROM users WHERE email = $1;", email);
    }


    login = async (user) => {
        debug("LOG", "Logging in", user);

        if (!user || !user.password || !user.email) {
            return [false, null];
        }

        const email = user.email;
        const result = await this.getUserByEmail(email);

        if (result.rowCount === 0) {
            return [false, null];
        }

        const userResult = result.rowsOfObjects()[0];

        if (await this.bcrypt.compare(user.password, userResult.password)) {
            return [true, userResult];
        }

        return [false, null];
    }

    register = async (user) => {

        debug("LOG", "Registering user", user);

        if (!user.password || !user.email) {
            throw new ReferenceError("Unable to register user. Missing user information.", user);
        }

        const password = await this.bcrypt.hash(user.password);
        const email = user.email;

        await this.runQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);
    }
}


export default UserService;