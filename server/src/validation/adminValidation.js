const {body,validationResult}=require('express-validator');
const adminRegisterValidation=[
    //name validation
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required").bail()
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters").bail(),

    // Email validation
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required").bail()
        .isEmail()
        .withMessage("Please enter a valid email").bail(),

    // Password validation
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

    // Phone validation
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required").bail()
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone number must be 10 digits").bail()
        .isNumeric()
        .withMessage("Phone number must contain only numbers").bail(),

    // Gym Name validation
    body("gymName")
        .trim()
        .notEmpty()
        .withMessage("Gym name is required").bail()
        .isLength({ min: 3 })
        .withMessage("Gym name must be at least 3 characters").bail(),

    // Gym Address validation
    body("gymAddress")
        .trim()
        .notEmpty()
        .withMessage("Gym address is required").bail()
        .isLength({ min: 5 })
        .withMessage("Gym address must be at least 5 characters").bail(),
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
const adminLoginValidation=[
    body('email').trim()
                .notEmpty().withMessage("Email is  required").bail()
                .isEmail().withMessage("Please Enter a Valid Email").bail(),
    body('password')
                     .notEmpty().withMessage("Password is required").bail(),
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

const adminChangePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required')
        .bail(),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .bail()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .bail()
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .bail()
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .bail()
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .bail(),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .bail()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid Request',
                errors: errors.array()
            });
        }

        next();
    }
];


module.exports={adminRegisterValidation,adminLoginValidation,adminChangePasswordValidation};