import { Pool, config } from "../deps.js";
import debug from "../utils/debug.js";

let dbConfig = {};
if (config().DATABASE_URL?.length) {
    dbConfig = config().DATABASE_URL;
}

const clientPool = new Pool(dbConfig, 5);

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