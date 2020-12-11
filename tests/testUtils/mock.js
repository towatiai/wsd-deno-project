/**
 * Creates a simple mock class, that is able to fake functions
 * and verify their call history later.
 */
class Mock {
    constructor() {

        this.mockContext = {
            timesCalled: 0,
            calledWith: [],
            returnValues: {}
        };

        this.mockFunction = (...params) => {
            this.mockContext.timesCalled++;
            this.mockContext.calledWith.push(params);

            const key = Object.keys(this.mockContext.returnValues).find(k => 
                this.indexOfParams(k.split("|"), [params]) === 0);

            return this.mockContext.returnValues[key];
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
        this.mockContext.returnValues = {};
    }

    /**
     * Checks whether the mocked function was called given times
     * @param {number} t Number of times this function must have been called
     */
    calledTimes(t) {
        return this.mockContext.timesCalled === t;
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
                this.mockContext.returnValues[params.join("|")] = value;
            },
            returnsDatabaseResult: (value) => {
                if (!Array.isArray(value)) {
                    throw new Error("Use arrays when creating mocked database results.");
                }

                this.mockContext.returnValues[params.join("|")] = {
                    rowCount: value.length,
                    rowsOfObjects: () => value
                }
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

export default Mock;