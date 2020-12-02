/**
 * This is an init-file, that should be run before using the application.
 */

import createTables from "./database/create.js";

await createTables();