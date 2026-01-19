import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to the DB!!!");
  } catch (err) {
    console.log(`Error while connecting to the DB : ${err}`);
    process.exit(1);
  }
};

export default connect;
