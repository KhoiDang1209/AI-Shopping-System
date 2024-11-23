const connection = require('../config/m_database');
const getAllCity = async () => {
    let [results, fields] = await connection.query('Select name from provinces p');
    return results;
}
const insertNewUser = async (lastname, firstname, address, city, email, username, password, dob) => {
    let [results, fields] = await connection.query(
        'INSERT INTO Users (LastName, FirstName, Address, City, Email, Username, Password, DOB) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [lastname, firstname, address, city, email, username, password, dob]);
    return results;
}

const resetPassword = async (email, password, confirmPassword) => {
    let [results, fields] = await connection.query(
        'UPDATE Users SET Password = ? WHERE Email = ?', [confirmPassword, email]);
    return results;
}

const checkIfEmailExist = async (email) => {
    let [results, fields] = await connection.query(
        'SELECT Email FROM Users u WHERE Email = ?', [email]);
    return results;
}

const checkIfLoginInforCorrect = async (username, password) => {
    let [results, fields] = await connection.query(
        'SELECT * FROM Users u WHERE UserName = ? AND Password = ?', [username, password]);
    if (Array.isArray(results) && results.length === 0) {
        [results, fields] = await connection.query(
            'SELECT * FROM Users u WHERE Email = ? AND Password = ?', [username, password]);//case username is an email
    }
    return results;
}
module.exports = {
    getAllCity,
    insertNewUser,
    resetPassword,
    checkIfEmailExist,
    checkIfLoginInforCorrect
}