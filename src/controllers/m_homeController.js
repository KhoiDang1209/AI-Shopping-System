
const nodemailer = require('nodemailer');
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const { getAllCountry, checkIfLoginInforCorrect, getAllCity, insertNewUser, resetPassword, checkIfEmailExist } = require('../services/m_CRUDService')

const getLoginPage = (req, res) => {
    res.render('login.ejs');
}
const getRegisterPage = async (req, res) => {
    let results = await getAllCity(); //wait for the result return to use => if not await then error occur as this empty
    let countries = await getAllCountry();
    return res.render('Register.ejs', { listCitys: results, countries });
}
const postRegisterUser = async (req, res) => {
    const { country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber } = req.body;
    //Check if user email exist as it is unique
    let results = await checkIfEmailExist(email);
    // console.log(req.body);
    if (Array.isArray(results) && results.length === 0) {
        res.redirect(
            `/Authentication?country=${encodeURIComponent(country)}&firstname=${encodeURIComponent(firstname)}&lastname=${encodeURIComponent(lastname)}&unitnumber=${encodeURIComponent(unitnumber)}&streetnumber=${encodeURIComponent(streetnumber)}&city=${encodeURIComponent(city)}&Addressline1=${encodeURIComponent(Addressline1)}&Addressline2=${encodeURIComponent(Addressline2)}&Postalcode=${encodeURIComponent(Postalcode)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&dob=${encodeURIComponent(dob)}&PhoneNumber=${encodeURIComponent(PhoneNumber)} }`
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
    const { country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber } = req.query;
    let results = await getAllCity();
    let countries = await getAllCountry();
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
        country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber
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
            if (!firstname || !lastname) {
                return res.render('InvalidEmailForFP.ejs', { email });
            }
            return res.render('InvalidEmail.ejs', { country, listCitys: results, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber });
        }
        console.log('Email sent: ', info.response);
        res.render('Authentication.ejs', { country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber });
    });

};

const resendAuthenticationCode = async (req, res) => {

    const userInfo = req.session.userInfo;

    if (!userInfo) {
        return res.redirect('/'); // Redirect to login if session data is not available
    }

    const { country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber } = userInfo;
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
            return console.log('Error occurred: ', error);
        }
        console.log('Email sent: ', info.response);
        res.render('Authentication.ejs', {
            country, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber
        });
    });
};


const getRegisterWithFilledInformationPage = async (req, res) => {
    let { country, listCitys, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob } = req.query;

    if (typeof listCitys === 'string') {
        try {
            listCitys = JSON.parse(listCitys); // Parse the string to an array
        } catch (error) {
            console.error('Error parsing listCitys:', error);
            listCitys = []; // Default to an empty array if parsing fails
        }
    }
    if (typeof countries === 'string') {
        try {
            countries = JSON.parse(countries); // Parse the string to an array
        } catch (error) {
            console.error('Error parsing countries:', error);
            countries = []; // Default to an empty array if parsing fails
        }
    }

    res.render('RegisterWithFilledInformation.ejs', { country, listCitys, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob });
};
const getForgetPasswordWithFilledInformationPage = async (req, res) => {
    let { email } = req.query;

    res.render('ForgetPasswordWithFilledInformation.ejs', { email });
};
const postVerifyCode = async (req, res) => {
    const { country, listCitys, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber } = req.body;

    console.log(req.body);
    const userCode = req.body.code; // Get the code entered by the user
    if (userCode === req.session.authCode) {
        if (!firstname || !lastname || !city || !email || !username || !password || !dob) {//forget password
            res.render('AuthenticationSuccessForgetPasswordPage.ejs', { email });
        }
        else {//register new user
            await insertNewUser(country, listCitys, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber);
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

const postloginValidation = async (req, res) => {
    const { username, password } = req.body;
    // console.log(req.body);
    let result = await checkIfLoginInforCorrect(username, password);
    if (Array.isArray(result) && result.length === 0) {
        return res.render('loginWithInfor.ejs', { username, password });
    }
    res.render('homepage.ejs');
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
    resendAuthenticationCode,
    postloginValidation
}