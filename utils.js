const ajv = require("ajv")
const ajv = new Ajv();

function validateData(data, schema) {
    const validate = ajv.compile(schema);

    const status = validate(data);
    return {status, validate};
}

module.exports = validateData