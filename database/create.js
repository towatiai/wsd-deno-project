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

CREATE UNIQUE INDEX ON users((lower(email)));
`;

const CREATE_USER_DATA = `
CREATE TABLE IF NOT EXISTS user_data (
    sleep_time      FLOAT8,
    sleep_quality   INTEGER,
    mood            INTEGER,
    sports_time     FLOAT8, 
    studying_time   FLOAT8,
    eating          INTEGER,
    datetime        timestamptz NOT NULL,
    user_id         INTEGER REFERENCES users(id)
);
`;

export default async () => {

    try {
        await runQuery(CREATE_USERS);
        await runQuery(CREATE_USER_DATA);
        console.log("%cDatabase tables created.", "color:green;");
    } catch(e) {
        console.error("Failed to create tables. Check other errors for possible causes.");
        console.log(e);
        return false;
    }
    
    return true;
} 