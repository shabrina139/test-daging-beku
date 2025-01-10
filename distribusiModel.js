const distribusiSchema = {
    type: "object",
    properties: {
        name: {type: "string", maxLength: 255},
        warehouse_location: {type: "string", maxLength: 255},
        batch_id: {type: "string", maxLength: 255},
        quantity_received: {type: "integer", minimum: 0},
    },
    required: ["name", "warehouse_location", "batch_id", "quantity_received"]
}
module.exports = distribusiSchema;