const express = require('express');

const { resendAuthenticationCode, getForgetPasswordWithFilledInformationPage, getRegisterWithFilledInformationPage, getAccountExistedPage, postResetPassword, getResetPasswordPage, getLoginPage, getRegisterPage, postRegisterUser, getAuthenticationPage, getAuthenticationSuccessPage, getForgetPasswordPage, postVerifyCode } = require('../controllers/m_homeController');

const m_router = express.Router();

//Khai bao route
// router.get('/', (req, res) => {
//     res.send('Hello World!!!!')
// })

//Much simpler
m_router.get('/', getLoginPage);
m_router.get('/Register', getRegisterPage);
m_router.get('/AuthenticationSuccess', getAuthenticationSuccessPage);
m_router.get('/ForgetPassword', getForgetPasswordPage);
m_router.get('/Authentication', getAuthenticationPage);
m_router.get('/resend-authentication-code', resendAuthenticationCode);
m_router.get('/ResetPassword', getResetPasswordPage);
m_router.get('/RegisterWithFilledInformation', getRegisterWithFilledInformationPage);
m_router.get('/ForgetPasswordWithFilledInformation', getForgetPasswordWithFilledInformationPage);
m_router.get('/AccountExisted', getAccountExistedPage);
m_router.post('/registerUser', postRegisterUser);
m_router.post('/verify-code', postVerifyCode);
m_router.post('/ResetPassword', postResetPassword);

module.exports = m_router;