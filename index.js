const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");
const validateData = require("./utils");
const imporSchema = require("./dto/model");
const distribusiSchema = require("./dto/distribusiModel");

class Dagingbekucontract extends Contract {
  constructor() {
    super("Dagingbekucontract");
  }

  async instantiate() {
    // function that will be invoked on chaincode instantiation
  }

  async impor(ctx, data, user){
    let jsonData = JSON.parse(data);

    if (user === "" || !user){
      return {
        status: 400,
        message: "user input doesnt exist",
      };
    }
    const isValid = validateData(jsonData.impor, imporSchema);

    if (isValid.status){
      return {
        status: 400,
        message: isValid.validate.errors,
      };
    }
    jsonData.timestamp = ctx.stub.getTxTimestamp();
    jsonData.status = "terimpor";
    jsonData.user = user;
    
    const stringData = JSON.stringify(jsonData);
    const hash = crypto.createHash("sha256").update(stringData).digest("hex");
    await ctx.stub.putState(hash, stringData);
    return{
      status: 201,
      hash: hash,
    }
  }
  async distribusi(ctx, data, user){
    let jsonData = JSON.parse(data);
    
    if (user === "" || !user){
      return {
        status: 400,
        message: "user input doesnt exist",
      };
    }
    const validDistribusi = validateData(jsonData.distribusi, distribusiSchema);

    if (validDistribusi.status){
      return {
        status: 400,
        message: validDistribusi.validate.errors,
      };
    }
    jsonData.timestamp = ctx.stub.getTxTimestamp();
    jsonData.status = "terdistribusi";
    jsonData.user = user;

    const stringData = JSON.stringify(jsonData);
    const hash = crypto.createHash("sha256").update(stringData).digest("hex");
    await ctx.stub.putState(hash, stringData);
    return{
      status: 200,
      hash: hash,
    }
  }
  async pengiriman(ctx, hash, data, user) {
    try{
      const newData = JSON.parse(data);
      const existData = await this.getData(ctx, hash);
      if (existData.code == 404) {
        return {
          status: 404,
          message: "data tidak ditemukan",
        };
      }
      const timestamp=ctx.stub.getTxTimestamp();
      existData.status = "terkirim"
      existData.data.timestamp = timestamp.seconds.low;
      existData.data.user_pengiriman = user;
      Object.assign(existData.data, newData);
      const stringJSON = JSON.stringify(existData.data);
      await ctx.stub.putState(hash, stringJSON);
      return {
        status: 200,
        message: "Daging telah dikirim ke distributor"
      }
    }catch (error) {
      return {
        status: 400,
        message: error.message
      }
    }
  }
  async put(ctx, key, value) {
    await ctx.stub.putState(key, Buffer.from(value));
    return { success: "OK" };
  }

  async getData(ctx, hash) {
    try {
      const buffer = await ctx.stub.getState(hash);
      if (!buffer || !buffer.length) return { code: 404, error: "NOT_FOUND" };
      const data = JSON.parse(buffer.toString());
      return { status: 200, data: data };  
    } catch (error) {
      return {
        status: 400,
        message: error.message,
      };
    }
  }

  async getAll(ctx) {
    try {
      const startKey = ""
      const endKey = ""
      const allResults = [];
      for await (const {key, value} of ctx.stub.getStateByRange(
        startKey,
        endKey
      )) {
        const strValue = Buffer.from(value).toString("utf-8");
        let record = JSON.parse(strValue);
        allResults.push({hash: key, Record: record})
      }
      return { status: 200, data: allResults};
    } catch (error) {
      return {
        status: 400, 
        error: error.message
      }
    }
  }

  async putPrivateMessage(ctx, collection) {
    const transient = ctx.stub.getTransient();
    const message = transient.get("message");
    await ctx.stub.putPrivateData(collection, "message", message);
    return { success: "OK" };
  }

  async getPrivateMessage(ctx, collection) {
    const message = await ctx.stub.getPrivateData(collection, "message");
    const messageString = message.toBuffer ? message.toBuffer().toString() : message.toString();
    return { success: messageString };
  }

  async verifyPrivateMessage(ctx, collection) {
    const transient = ctx.stub.getTransient();
    const message = transient.get("message");
    const messageString = message.toBuffer ? message.toBuffer().toString() : message.toString();
    const currentHash = crypto.createHash("sha256").update(messageString).digest("hex");
    const privateDataHash = (await ctx.stub.getPrivateDataHash(collection, "message")).toString("hex");
    if (privateDataHash !== currentHash) {
      return { error: "VERIFICATION_FAILED" };
    }
    return { success: "OK" };
  }
}

exports.contracts = [Dagingbekucontract];
