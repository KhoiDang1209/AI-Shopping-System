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
module.exports = {
    getAllCity,
    insertNewUser,
    resetPassword,
    checkIfEmailExist
}