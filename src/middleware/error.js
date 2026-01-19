import { fail } from "../utils/response.js";

export default (err,req,res,next) =>{
    console.error(`Error : ${err.message}`);
    fail(res,err.message, err.status ||500)
    
}