
const nodemailer = require('nodemailer');
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const { getAllCity, insertNewUser, resetPassword, checkIfEmailExist } = require('../services/m_CRUDService')

const getLoginPage = (req, res) => {
    res.render('login.ejs');
}
const getRegisterPage = async (req, res) => {
    let results = await getAllCity(); //wait for the result return to use => if not await then error occur as this empty
    return res.render('Register.ejs', { listCitys: results });
}
const postRegisterUser = async (req, res) => {
    const { firstname, lastname, address, city, email, username, password, dob } = req.body;
    //Check if user email exist as it is unique
    let results = await checkIfEmailExist(email);
    console.log('Results:', results);
    console.log('Is results null:', results === null);
    console.log('Is results an empty object:', Object.keys(results).length === 0);
    console.log('Type of results:', typeof results);
    // console.log(req.body);
    if (Array.isArray(results) && results.length === 0) {
        res.redirect(
            `/Authentication?firstname=${encodeURIComponent(firstname)}&lastname=${encodeURIComponent(lastname)}&address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&dob=${encodeURIComponent(dob)}`
        );
    }
    else {
        res.redirect('/AccountExisted');
    }
};
const getAccountExistedPage = async (req, res) => {
    res.render('AccountExisted.ejs');
}
// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Example with Gmail
    auth: {
        user: user,
        pass: pass, // Use app password if 2FA is enabled
    },
});

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 6-digit code
};

const getAuthenticationSuccessPage = async (req, res) => {
    res.render('AuthenticationSuccessPage.ejs');
};
const getForgetPasswordPage = async (req, res) => {
    res.render('ForgetPassword.ejs');
};

const getAuthenticationPage = async (req, res) => {
    const { firstname, lastname, address, city, email, username, password, dob } = req.query;
    let results = await getAllCity(); //wait for the result return to use => if not await then error occur as this empty
    // Why query => the method is get => query if post then it will be body
    // const { Forgetpasswordemail } = req.body;
    console.log(req.query);
    // console.log(req.body);
    const code = generateCode(); // Generate the code
    console.log('Generated Code:', code); // Log for debugging or tracking
    req.session.authCode = code; // Store the code in the session
    console.log('email: ', email);
    // Store user info in the session
    req.session.userInfo = {
        firstname,
        lastname,
        address,
        city,
        email,
        username,
        password,
        dob
    };
    const mailOptions = {
        from: 'skygrep@gmail.com',
        to: email,
        // to: 'ngthien0929@gmail.com',
        subject: 'Your Authentication Code',
        html: `<p>This is a test email. Your authentication code is: <strong>${code}</strong></p>`, // Bold code using <strong>
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ', error);
            if (!firstname || !lastname || !address) {
                return res.render('InvalidEmailForFP.ejs', { email });
            }
            return res.render('InvalidEmail.ejs', { listCitys: results, firstname, lastname, address, city, email, username, password, dob });
        }
        console.log('Email sent: ', info.response);
        res.render('Authentication.ejs', { firstname, lastname, address, city, email, username, password, dob });
    });

    // console.log(req.query);
    // console.log({ firstname, lastname, address, city, email, username, password, dob });
    // TO PASS THIS TO THE postVerifyCode you can not pass directly bacause this this render a web page
    // => not to pass as hidden data onto the page and use req.body to get
};

const resendAuthenticationCode = async (req, res) => {
    // Retrieve user info from session
    const userInfo = req.session.userInfo;

    if (!userInfo) {
        return res.redirect('/'); // Redirect to login if session data is not available
    }

    const { firstname, lastname, address, city, email, username, password, dob } = userInfo;

    let results = await getAllCity(); // Wait for the result return to use
    const code = generateCode(); // Generate the code
    req.session.authCode = code; // Store the code in the session
    console.log('Generated Code:', code); // Log for debugging or tracking
    const mailOptions = {
        from: 'skygrep@gmail.com',
        to: email,
        subject: 'Your Authentication Code',
        html: `<p>Your authentication code is: <strong>${code}</strong></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ', error);
            return res.render('InvalidEmail.ejs', { listCitys: results, firstname, lastname, address, city, email, username, password, dob });
        }
        console.log('Email sent: ', info.response);
        res.render('Authentication.ejs', { firstname, lastname, address, city, email, username, password, dob });
    });
};


const getRegisterWithFilledInformationPage = async (req, res) => {
    let { listCitys, firstname, lastname, address, city, email, username, password, dob } = req.query;

    // Check if listCitys is a string and needs to be parsed
    //Need to change to string then change back
    if (typeof listCitys === 'string') {
        try {
            listCitys = JSON.parse(listCitys); // Parse the string to an array
        } catch (error) {
            console.error('Error parsing listCitys:', error);
            listCitys = []; // Default to an empty array if parsing fails
        }
    }

    // Now, listCitys is guaranteed to be an array (or empty array if parsing fails)
    // console.log(listCitys);

    res.render('RegisterWithFilledInformation.ejs', { listCitys, firstname, lastname, address, city, email, username, password, dob });
};
const getForgetPasswordWithFilledInformationPage = async (req, res) => {
    let { email } = req.query;

    res.render('ForgetPasswordWithFilledInformation.ejs', { email });
};
const postVerifyCode = async (req, res) => {
    const { firstname, lastname, address, city, email, username, password, dob } = req.body;
    // const { firstname, lastname, address, city, email, username, password, dob } = req.query;
    // console.log(req.query);
    console.log(req.body);
    const userCode = req.body.code; // Get the code entered by the user
    if (userCode === req.session.authCode) {
        if (!firstname || !lastname || !address || !city || !email || !username || !password || !dob) {//forget password
            res.render('AuthenticationSuccessForgetPasswordPage.ejs', { email });
        }
        else {//register new user
            await insertNewUser(lastname, firstname, address, city, email, username, password, dob);
            res.redirect('/AuthenticationSuccess')
        }
    } else {
        res.status(400).send('Invalid code. Please try again.');
    }
};

const getResetPasswordPage = async (req, res) => {
    const { email } = req.query;
    console.log(email);
    res.render('ResetPassword.ejs', { email });
};

const postResetPassword = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log(req.body);
    await resetPassword(email, password, confirmPassword);
    res.render('ResetPasswordSuccess.ejs');
};
module.exports = {
    getLoginPage,
    getRegisterPage,
    postRegisterUser,
    getAuthenticationSuccessPage,
    getForgetPasswordPage,
    getAuthenticationPage,
    postVerifyCode,
    getResetPasswordPage,
    postResetPassword,
    getAccountExistedPage,
    getRegisterWithFilledInformationPage,
    getForgetPasswordWithFilledInformationPage,
    resendAuthenticationCode
}