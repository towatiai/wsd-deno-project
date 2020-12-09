import { validate } from "../deps.js";

export default class {
    constructor(form) {
        this.empty = {};
        this.keys = Object.keys(form);
        this.types = {};

        this.keys.forEach(key => {
            this.empty[key] = form[key];
        });

        this.empty.errors = [];
        this.form = {};
    }

    getEmpty() {
        return this.empty;
    }

    async parse(data, types) {

        let params;
        if (typeof data.body === "function") {
            params = await data.body().value;
        } else {
            params = data;
        }

        this.form = {};
        this.keys.forEach(key => {
            const value = types && types.hasOwnProperty(key)
                ? parseType(params.get(key), types[key])
                : params.get(key);

            this.form[key] = value ?? this.empty[key];
        });

        this.form.errors = [];

        return this.form;
    }

    async validate(rules, data) {

        const [passes, errors] = await validate(this.form, rules, data);

        console.log(errors)

        if (passes) {
            return [true, this.getEmpty()];
        } else {
            this.form.errors = errors;
            return [false, this.form];
        }
    }
}


function parseType(value, type) {
    if ( value=== null || typeof value === undefined ) return null;

    console.log(value, isNaN(value), type);
    switch(type) {
        case "string": return value.toString()
        case "float": return isNaN(value) || value === "" ? null : parseFloat(value)
        case "int": case "integer": return isNaN(value) || value === "" ? null : parseInt(value)
        default: return value
    }
}