const { Object } = require("fabric-contract-api");

const enumTypeProduct = {
    Beef : "Beef",
    Jeroan : "Jeroan"
};

const enumTypeGrade = {
    Premium: "Premium",
    Regular: "Regular",
};

const enumTypePackaging = {
    Vacuum: "Vacuum-sealed pacs",
};

const productDetailSchema = {
    type: "object",
    properties: {
       type: {type: "string", enum: Object.values(enumTypeProduct)},
       grade: {type: "string", enum: Object.values(enumTypeGrade)},
        packaging: {type: "string", enum: Object.values(enumTypePackaging)},
    },
    required: ["type", "grade", "packaging"]
}

const imporSchema = {
    type: "object",
    properties: {
        name: {type: "string", maxLength: 255},
        country_of_origin: {type: "string", maxLength: 255},
        certficate_halal: {type: "string", maxLength: 255},
        quantity: {type: "integer", minimum: 0},
        product_details: productDetailSchema
    },
    required: ["name", "country_of_origin", "certificate_halal", "quantity", "product_details"]
}

module.exports = imporSchema;