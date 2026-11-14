const {body,validationResult}=require('express-validator');
const userRegisterValidation=[
    body('firstName').trim()
                    .notEmpty().withMessage("FirstName is Required").bail()
                    .isLength({min:2}).withMessage("Length must be greater than 1").bail()
                    .isString().withMessage("firstName must be String").bail(),
    body('lastName').trim()
                   .isString().withMessage('LastName must be String').bail(),
    body('email')
                 .notEmpty().withMessage("Email is required").bail()
                 .isEmail().withMessage("Enter a valid Email").bail()
                 .trim(),
    body("password")
            .notEmpty()
            .withMessage("Password is required").bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters").bail()
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter").bail()
            .matches(/[a-z]/)
            .withMessage("Password must contain at least one lowercase letter").bail()
            .matches(/[0-9]/)
            .withMessage("Password must contain at least one number").bail(),

    body('mobileNo').notEmpty().withMessage('Mobile No is required').bail()  
                    .trim()
                    .isLength({min:10,max:10}).withMessage("Mobile No must be 10 digit").bail()
                    .isNumeric().withMessage("Mobile No must Contain Only Number").bail(),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                message:"Invalid Request",
                errors:errors.array()
            })
            
        }
        next();
    }               
]
const userLoginValidation=[
    body('email').notEmpty().withMessage("Email is Required").bail()
                  .trim()
                  .isEmail().withMessage("Please Enter a valid Email").bail(),
    body('password').notEmpty().withMessage("Password is required").bail()
                    .isString().withMessage("Password must be a string").bail(),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                message:"Invalid Request",
                errors:errors.array()
            })
        }
        next();
    }
    
]
module.exports={userRegisterValidation,userLoginValidation};