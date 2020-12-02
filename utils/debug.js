import { parse } from "../deps.js";

export default (type, title, ...data) => {
    const args = parse(Deno.args);

    // No debugging parameters, so we don't log this.
    if (!args.d && !args.debug) return;

    switch (type) {
        case "LOG":
            console.log(`%c[LOGGING] ${title}:`, "color:gold;");
            break;

        case "ERR":
            console.log(`%c[FAILURE] ${title}:`, "color:salmon;");
            break;

        case "SUC":
            console.log(`%c[SUCCESS] ${title}:`, "color:limegreen;");
            break;

        default:
            console.log(`%c[DEBUG] ${title}:`, "color:deepskyblue;");
    }

    if (data?.length) {
        data.forEach(d => {
            if (Array.isArray(d) && d?.length) console.log(d.join(", "));
            else if (!Array.isArray(d) && d) console.log(d);
            else console.log("No data.");
        });
    } else {
        console.log("No data.");
    }

}