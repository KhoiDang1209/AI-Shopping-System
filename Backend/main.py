import os
import random
import re
import models
from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException, Depends, status
from typing import List
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Local imports
from database import engine, SessionLocal
from models import *
from schemas import (
    UserCreate, UserResponse, AddressCreate, AddressResponse, ProductCreate,
    ProductResponse, ShopOrderCreate, ShopOrderResponse, UserRegisterRequest,
    EmailContent, RegisterRequest, EmailVadidate, LoginRequire, FPEmail,
    ChangePasswordInfor, UpdateRequire
)

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database
models.Base.metadata.create_all(bind=engine)

# CORS Middleware
origins = ["http://localhost:3000"]  # Replace with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password hashing utility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generate random 6-digit code for verification
def generate_verification_code():
    return str(random.randint(100000, 999999))

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=credentials['EMAIL'],
    MAIL_PASSWORD=credentials['PASSWORD'],
    MAIL_FROM=credentials['EMAIL'],
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Temporary in-memory storage for email -> verification code
verification_codes = {}

# -------------------------------
# Root and Test Endpoints
# -------------------------------

@app.post("/")
async def root():
    return {"message": "CORS is working"}

# -------------------------------
# User Authentication
# -------------------------------

@app.post("/register")
async def register_user(user: UserResponse, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address already registered")

    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[user.email_address] = verification_code

    # Send email with verification code
    html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    message = MessageSchema(subject="Verification Code", recipients=[user.email_address], body=html, subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)
    
    return {"message": "Registration successful. Please check your email for verification."}

@app.post("/verify-email/")
async def verify_email(emailValidate: EmailVadidate):
    email = emailValidate.email
    code = emailValidate.code
    if email not in verification_codes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found. Please register first.")
    
    if verification_codes[email] != code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")
    
    # Code is correct - remove it from temporary store
    del verification_codes[email]
    return {"message": "Email verified successfully."}

@app.post("/postRegister/")
async def postRegister(user: UserRegisterRequest, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    db_user = SiteUser(
        user_name=user.user_name,
        email_address=user.email_address,
        phone_number=user.phone_number,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
@app.post("/Login")
async def login(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.user_name_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.user_name_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.user_name == user.user_name_or_email).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    # Verify the password
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[existing_user.email_address] = verification_code

    # Email content with verification code
    html = f"""
    <p>Dear {existing_user.user_name},</p>
    <p>This is a test email</p>
    <p>Your verification code is: <strong>{verification_code}</strong></p>
    <p>Thank you,</p>
    <p>Ai Shopping system</p>
    """

    # Send email with verification code
    message = MessageSchema(
        subject="Hello",
        recipients=[existing_user.email_address],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    user_response = UserResponse(
        user_name=existing_user.user_name,
        email_address=existing_user.email_address,
        phone_number=existing_user.phone_number,
        password = existing_user.password
    )
    return {"message": "Send email successful. Please check your email for verification.", "user": user_response}

@app.post("/postLogin/")
async def postLogin(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.user_name_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.user_name_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.user_name == user.user_name_or_email).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    # Verify the password
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    user_response = UserResponse(
        user_name=existing_user.user_name,
        email_address=existing_user.email_address,
        phone_number=existing_user.phone_number,
        password = existing_user.password
    )

    return {"message": "Login successful", "user": user_response}

# -------------------------------
# User Profile
# -------------------------------

@app.post("/Update")
async def Update(user: UpdateRequire, db: Session = Depends(get_db)):
    # Generate verification code
    verification_code = generate_verification_code()
    verification_codes[user.email] = verification_code

    # Send email with verification code
    html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    message = MessageSchema(subject="Verification Code", recipients=[user.email], body=html, subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)

    return {"message": "Please check your email for verification."}

@app.post("/postUpdate")
async def postUpdate(changeInfo: UpdateRequire, db: Session = Depends(get_db)):
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user information
    user.user_name = changeInfo.name
    user.phone_number = changeInfo.phone
    db.commit()

    return {"message": "User information updated successfully", "data": {"name": user.user_name, "email": user.email_address, "phone": user.phone_number}}

# -------------------------------
# Forgot Password
# -------------------------------

@app.post("/forgetpassword")
async def forgetpassword(email: FPEmail, db: Session = Depends(get_db)):
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == email.email).first()
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your Email Has Not Registered!!!")

    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[email.email] = verification_code

    # Send email with verification code
    html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    message = MessageSchema(subject="Password Reset Code", recipients=[email.email], body=html, subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)
    
    return {"message": "Please check your email for the verification code."}

@app.post("/postForgetPassword/")
async def postForgetPassword(changeInfo: ChangePasswordInfor, db: Session = Depends(get_db)):
    if changeInfo.newPassword != changeInfo.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Hash the new password
    hashed_password = hash_password(changeInfo.newPassword)

    # Update the password in the database
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hashed_password
    db.commit()

    return {"message": "Password changed successfully"}

# -------------------------------
# Utility Functions
# -------------------------------

def is_email(value: str) -> bool:
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, value) is not None

# 2. User profile api
    # profile display
    # profile update
    # If-else for checking user address status
        # if doesnt have -> create new
        # if have -> update
    # logout
    
# 3. Home page
    # home page display
    # recommend product (do after have ai model)
    # categories (show different product categories)

# 4 Search products page
    # products display

# 4.1. Product detail page
    # product details display/{product_id}
    # add to cart
        # if a product already in cart, add quantity
    
# 5. Cart page
    # cart display
    # calculate total price
    # remove item from cart
    # cart checkout
    
# 6. Order page
    # checkout display (display items, total price, payment, shipping methods)
    # order create (provide payment and shipping methods)
    # order display/{order_id}
    # order history
    # payment
    
"""
Summary of API Endpoints:
User Authentication:
    POST /login
    POST /register
    GET /check-email
User Profile:
    GET /profile
    POST /profile/update
    GET /user-address
    POST /user-address
    POST /logout
Home Page:
    GET /home
    GET /categories
    GET /recommended-products
Product Pages:
    GET /products
    GET /products/{product_id}
    POST /add-to-cart
Cart:
    GET /cart
    POST /cart/checkout
    POST /remove-from-cart
Order:
    GET /checkout
    POST /order/create
    GET /order/{order_id}
    GET /order-history
    POST /payment
"""
