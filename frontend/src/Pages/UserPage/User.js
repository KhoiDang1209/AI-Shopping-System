import React, { useState } from 'react';
import "./User.css";
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { Link } from 'react-router-dom';

const User = () => {
  // State for user information
  const [userInfo, setUserInfo] = useState({
    fullName: "John Doe",
    email: "johndoe@example.com",
    phone: "+1234567890",
    address: "123 Main Street, City, Country"
  });

  // Simulating user information change
  const handleUserChange = () => {
    setUserInfo({
      fullName: "Jane Smith",
      email: "janesmith@example.com",
      phone: "+9876543210",
      address: "456 Elm Street, New City, Another Country"
    });
  };

  return (
    <div className="user">
      <NavBar />
      <div className="user__container">
        <div className="user__profile">
          {/* User Image */}
          <div className="user__image">
            <img 
              className="user__image__img" 
              src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg" 
              alt="User" 
            />
          </div>
          {/* User Info */}
          <div className="user__info">
            <div className="user__info__item">
              <strong>Full Name:</strong> <span>{userInfo.fullName}</span>
            </div>
            <div className="user__info__item">
              <strong>Email:</strong> <span>{userInfo.email}</span>
            </div>
            <div className="user__info__item">
              <strong>Address:</strong> <span>{userInfo.address}</span>
            </div>
          </div>
          {/* Change Information Button */}
          <div className="user__edit__button__container">
            <Link to="/Information" className="user__edit__button" onClick={handleUserChange}>
              Change User Information
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default User;
