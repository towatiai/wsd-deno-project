import { Pool } from "../deps.js";
import debug from "../utils/debug.js";

export const createQueryRunner = (dbConfig, nConnections) => {

    console.log(dbConfig);
    const clientPool = new Pool("postgres://kyogdktj:cyZUugABcGy2NEbGro3hdc2MfMJyuPKx@hattie.db.elephantsql.com:5432/kyogdktj", nConnections);

    return async (query, ...args) => {

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

}