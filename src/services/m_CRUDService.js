const connection = require('../config/m_database');
const getAllCity = async () => {
    let [results, fields] = await connection.query('Select name from provinces p');
    return results;
}
const getAllCountry = async () => {
    let [results, fields] = await connection.query('Select name from country c');
    return results;
}
const insertNewUser = async (country, listCitys, countries, firstname, lastname, unitnumber, streetnumber, city, Addressline1, Addressline2, Postalcode, email, username, password, dob, PhoneNumber) => {
    let result2 = await connection.query('SELECT country_id FROM country WHERE name = ?', [country]);
    let country_id = result2[0][0].country_id;


    // Insert address
    let results1 = await connection.query(
        'INSERT INTO Address (unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [unitnumber, streetnumber, Addressline1, Addressline2, city, null, Postalcode, country_id]);

    // Insert new user
    let [results, fields] = await connection.query(
        'INSERT INTO Users (LastName, FirstName, Email, Username, Password, DOB, PhoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lastname, firstname, email, username, password, dob, PhoneNumber]);

    // Get country_id


    // Get user_ID
    let result4 = await connection.query('SELECT UserID FROM Users WHERE Email = ?', [email]);
    let user_ID = result4[0][0].UserID;
    console.log(result4)
    // Get address_ID
    let result5 = await connection.query(
        'SELECT address_ID FROM Address WHERE unit_number = ? AND street_number = ? AND address_line1 = ? AND address_line2 = ? AND city = ? AND postal_code = ? AND country_id = ?',
        [unitnumber, streetnumber, Addressline1, Addressline2, city, Postalcode, country_id]);
    let address_ID = result5[0][0].address_ID;
    console.log(result5)
    // Insert into User_Address
    let results3 = await connection.query(
        'INSERT INTO User_Address (address_ID, user_ID, is_Default) VALUES (?, ?, ?)',
        [address_ID, user_ID, 1]);

    return { user_ID, address_ID }; // You can return more details here as needed
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
    checkIfLoginInforCorrect,
    getAllCountry
}