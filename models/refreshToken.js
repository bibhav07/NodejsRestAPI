import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tokenTokenSchema = new Schema({

    token : {
        type: String,
        unique: true,
    }

});


export default mongoose.model('RefreshToken', tokenTokenSchema, 'refreshTokens');