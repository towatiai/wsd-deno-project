import { Pool, config } from "../deps.js";
import debug from "../utils/debug.js";

if (!config().DATABASE_URL?.length) {
    console.error("%cCannot connect to database, because database URL is not defined. Please add environmental variable DATABASE_URL.", "color:salmon;");
}

const clientPool = new Pool(config().DATABASE_URL, 5);

export default async (query, ...args) => {

    debug("LOG", "Executing query", query);
    debug("LOG", "With args", args);

    const client = await clientPool.connect();
    try {    
        const data = await client.query(query, ...args);
        debug("LOG", "Received data", data.rowsOfObjects());
        return data;

    } catch (e) {
        debug("ERR", "Query failed", e);
        throw Error(e);

    } finally {
        await client.release();

    }
}