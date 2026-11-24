
const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Invalid Request",
            errors: errors.array()
        });
    }

    next();
};

const userRegisterValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage("FirstName is Required").bail()
        .isLength({ min: 2 }).withMessage("Length must be at least 2 characters"),

    body('lastName')
        .optional()
        .trim()
        .isString().withMessage("LastName must be String"),

    body('email')
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Enter a valid Email")
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage("Password is required").bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters").bail()
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter").bail()
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter").bail()
        .matches(/[0-9]/).withMessage("Password must contain at least one number"),

    body('mobileNo')
        .trim()
        .notEmpty().withMessage("Mobile No is required").bail()
        .isLength({ min: 10, max: 10 }).withMessage("Mobile No must be 10 digits").bail()
        .isNumeric().withMessage("Mobile No must contain only numbers"),

    validateRequest
];

const userLoginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage("Email is Required").bail()
        .isEmail().withMessage("Please Enter a valid Email")
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage("Password is required").bail()
        .isString().withMessage("Password must be a string"),

    validateRequest
];

module.exports = {
    userRegisterValidation,
    userLoginValidation
};
