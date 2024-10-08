const validator = require("validator");

const validateSingupData = (req)=>{
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName) throw new Error("name is invalid");

    if(! validator.isEmail(emailId)) throw new Error("invalid email id");

    if(! validator.isStrongPassword(password)) throw new Error("plz enter storng password");

}


const validateEditProfileData = (req)=>{
   const allowedEditFields = ["firstName", "lastName", "skills", "photoUrl", "gender", "age", "about"];

   const isEditAllowed = Object.keys(req.body).every((field)=>
        allowedEditFields.includes(field)
   )

   return isEditAllowed;

}



module.exports = {validateSingupData, validateEditProfileData};