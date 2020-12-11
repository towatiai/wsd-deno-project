/**
 * Creates a simple mock class, that is able to fake functions
 * and verify their call history later.
 */
class Mock {
    constructor() {

        this.mockContext = {
            timesCalled: 0,
            calledWith: [],
            returnValues: []
        };

        this.mockFunction = (...params) => {
            this.mockContext.timesCalled++;
            this.mockContext.calledWith.push(params);

            const value = this.mockContext.returnValues.find(k =>
                this.indexOfParams(k.params, [params]) === 0);

            return value?.value;
        };
    }

    getMock() {
        return this.mockFunction;
    }

    /**
     * Resets current mock context
     */
    reset() {
        this.mockContext.timesCalled = 0;
        this.mockContext.calledWith = [];
        this.mockContext.returnValues = [];
    }

    /**
     * Checks whether the mocked function was called given times
     * @param {number} t Number of times this function must have been called
     */
    calledTimes(t) {
        return this.mockContext.timesCalled === t;
    }

    getParams(i) {
        if (typeof index === "undefined") 
            return this.mockContext.calledWith[this.mockContext.calledWith.length - 1];

        return this.mockContext.calledWith[i];
    }

    /**
     * Checks if the mocked function was called with given parameters.
     * @param  {...any} params Params the mocked function had to be called with.
     */
    calledWith(...params) {
        return this.indexOfParams(params, this.mockContext.calledWith) >= 0;
    }

    withArgs(...params) {
        return {
            returns: (value) => {
                this.mockContext.returnValues.push({
                    params: params, value: value
                });
            },
            returnsDatabaseResult: (value) => {
                if (!Array.isArray(value)) {
                    throw new Error("Use arrays when creating mocked database results.");
                }

                this.mockContext.returnValues.push({
                    params: params,
                    value: {
                        rowCount: value.length,
                        rowsOfObjects: () => value
                    }
                });
            }
        }
    }


    indexOfParams(searchedParams, listOfParams) {

        let foundIndex = -1;
        listOfParams.some((callParams, callIndex) => {

            for (let i = 0; i < callParams.length; i++) {

                // If given any type, we allow the parameter to be any type, but not null or undefined.
                if (searchedParams[i] === type.ANY && callParams[i] !== null && typeof callParams[i] !== "undefined") continue;

                // If given string or number type, we allow the parameter to be either of those.
                if (searchedParams[i] === type.STRING && typeof callParams[i] === type.STRING) continue;
                if (searchedParams[i] === type.NUMBER && typeof callParams[i] === type.NUMBER) continue;

                // If the parameters are equal.
                if (searchedParams[i] === callParams[i]) continue;

                if (!isNaN(searchedParams[i])) {
                    if (parseInt(searchedParams[i]) === callParams[i]
                        || parseFloat(searchedParams[i]) === callParams[i])
                        continue;
                }

                if (typeof searchedParams[i] === "object" && 
                    Object.keys(searchedParams[i])
                    .every(key => searchedParams[i][key] === callParams[i][key])
                    ) continue;

                // If parameter's types doesn't match and they are not equal, the
                // mock function was 
                return false;
            }

            foundIndex = callIndex;
            return true; // Returning true inside some-loop breaks it.
        });

        return foundIndex;

    }
}

export const type = {
    ANY: "any",
    STRING: "string",
    NUMBER: "number"
}

export const mockRequest = (data) => {
    return {
        body: (ctx) => {
            return ctx?.type === "json" ? ({value: data}) : ({ value: { get: (key) => data[key] }})
        }
    }
}

export default Mock;