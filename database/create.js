/**
 * Create.js
 * 
 * Executes queries, that create tables if they don't exist yet.
 */

import runQuery from "./runQuery.js";

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(320) NOT NULL,
    password    CHAR(60) NOT NULL
);
`;

const CREATE_SLEEP = `
CREATE TABLE IF NOT EXISTS sleep (
    sleeptime       FLOAT8 NOT NULL,
    sleepquality    
);
`;

export const createTables = () => {



} 