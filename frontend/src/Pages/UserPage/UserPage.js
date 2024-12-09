import "./UserPage.css";
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from "axios";

const UserPage = () => {
    const location = useLocation();  // Get the location object
    const { userData } = location.state;  // Access userData passed via state
    const navigate = useNavigate(); // Hook to handle navigation
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    // If userData is not passed, provide default empty object or 'Guest' info
    const [userInfo, setUserInfo] = useState({
        name: userData?.name || 'Guest',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        age: userData?.age || '',
        gender: userData?.gender || '',
        city: userData?.city || '',
        unit_number: userData?.unit_number || '',
        street_number: userData?.street_number || '',
        address_line1: userData?.address_line1 || '',
        address_line2: userData?.address_line2 || '',
        region: userData?.region || '',
        postal_code: userData?.postal_code || '',
    });
    useEffect(() => {
        if (!userInfo?.email) return; // Avoid making the API call if email is undefined

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/getUserProfile/", {
                    params: {
                        email: userInfo.email,
                    },
                });

                if (response.status === 200) {
                    setUserInfo(response.data.data);
                }
            } catch (err) {
                setError("Failed to fetch user data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [userInfo?.email]); // Fetch only when email changes
    // Simulating user information change
    const handleUserChange = async (e) => {
        try {
            navigate('/ChangeUserInfo', { state: { userData: { ...userInfo } } });
        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };

    return (
        <div className="user">
            <NavBar userInfo={userInfo} />
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
                            <strong>Full Name:</strong> <span>{userInfo.name}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Email:</strong> <span>{userInfo.email}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Phone:</strong> <span>{userInfo.phone}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Age:</strong> <span>{userInfo.age}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Gender:</strong> <span>{userInfo.gender}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>City:</strong> <span>{userInfo.city}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Unit Number:</strong> <span>{userInfo.unit_number}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Street Number:</strong> <span>{userInfo.street_number}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 1:</strong> <span>{userInfo.address_line1}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 2:</strong> <span>{userInfo.address_line2}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Region:</strong> <span>{userInfo.region}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Postal Code:</strong> <span>{userInfo.postal_code}</span>
                        </div>
                    </div>
                    {/* Change Information Button */}
                    <div className="user__edit__button__container">
                        <button
                            onClick={handleUserChange}
                            className="account__dropdownOption"  // Use this class to apply the button styles
                        >
                            Change User Information
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserPage;
