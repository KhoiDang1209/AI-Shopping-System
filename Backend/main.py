import os
import random
import re

# Third-party imports
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

# Local application imports
from database import engine, SessionLocal
from models import *
from schemas import (
    UserCreate,
    UserResponse,
    AddressCreate,
    AddressResponse,
    ProductCreate,
    ProductResponse,
    ShopOrderCreate,
    ShopOrderResponse,
    UserRegisterRequest,
    EmailContent,
    RegisterRequest,
    EmailVadidate,
    LoginRequire,
    FPEmail,
    ChangePasswordInfor,
    UpdateRequire
)

from starlette.middleware.cors import CORSMiddleware

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database
models.Base.metadata.create_all(bind=engine)

# Allow CORS (Cross-Origin Resource Sharing) for frontend interaction
origins = [
    "http://localhost:3000"  # Replace this with your frontend URL if different
]

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
@app.post("/")
async def root():
    return {"message": "CORS is working"}
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = SiteUser(
        user_name=user.user_name,
        address=user.address,
        phone_number=user.phone_number,
        password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(SiteUser).all()


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(SiteUser).filter(SiteUser.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Address Endpoints
@app.post("/addresses/", response_model=AddressResponse)
def create_address(address: AddressCreate, db: Session = Depends(get_db)):
    db_address = Address(**address.dict())
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address


@app.get("/addresses/", response_model=List[AddressResponse])
def get_addresses(db: Session = Depends(get_db)):
    return db.query(Address).all()


# Product Endpoints
@app.post("/products/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# Shop Order Endpoints
@app.post("/orders/", response_model=ShopOrderResponse)
def create_order(order: ShopOrderCreate, db: Session = Depends(get_db)):
    db_order = ShopOrder(
        user_id=order.user_id,
        payment_method_id=order.payment_method_id,
        shipping_method_id=order.shipping_method_id,
        shopping_retail=order.shopping_retail,
        order_date=order.order_date,
        order_status_id=order.order_status_id
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@app.get("/orders/", response_model=List[ShopOrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(ShopOrder).all()


#Main function
# 1. Login & Register api
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Temporary in-memory storage for email -> verification code
verification_codes = {}

# Email configuration
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

# Generate random 6-digit code
def generate_verification_code():
    return str(random.randint(100000, 999999))


# @app.post("/register", response_model=UserResponse)
@app.post("/register")
async def register_user(user: UserResponse, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )

    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[user.email_address] = verification_code

    # Email content with verification code
    html = f"""
    <p>Dear {user.user_name},</p>
    <p>This is a test email</p>
    <p>Your verification code is: <strong>{verification_code}</strong></p>
    <p>Thank you,</p>
    <p>Ai Shopping system</p>
    """

    # Send email with verification code
    message = MessageSchema(
        subject="Hello",
        recipients=[user.email_address],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    
    return {"message": "Registration successful. Please check your email for verification."}


@app.post("/verify-email/")
async def verify_email(emailValidate: EmailVadidate):
    email = emailValidate.email
    code = emailValidate.code
    if email not in verification_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not found. Please register first."
        )

    if verification_codes[email] != code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code."
        )

    # Code is correct - remove it from the temporary store
    del verification_codes[email]

    return {"message": "Email verified successfully."}

@app.post("/postRegister/")
async def postRegister(user: UserRegisterRequest, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    # Store user in the database
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

def is_email(value: str) -> bool:
    # Check if value is a valid email using regex
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, value) is not None

# Function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

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

<<<<<<< Updated upstream
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
=======
    return {"message": "Login successful", "user": user_response}

@app.post("/forgetpassword")
async def forgetpassword(email: FPEmail, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == email.email).first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your Email Has Not Registered!!!"
        )
    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[email.email] = verification_code

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
        recipients=[email.email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    
    return {"message": "Send email successful. Please check your email for verification."}

@app.post("/postForgetPassword/")
async def postForgetPassword(changeInfo: ChangePasswordInfor, db: Session = Depends(get_db)):
    # Ensure newPassword and confirmPassword match (optional if already checked on frontend)
    if changeInfo.newPassword != changeInfo.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Hash the new password
    hashed_password = hash_password(changeInfo.newPassword)

    # Query the user from the database by email
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the user's password
    user.password = hashed_password

    # Commit the changes to the database
    db.commit()

    return {"message": "Password changed successfully"}

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
# # 2. User profile api
#     # If-else for checking user address status
#         # if doesnt have -> create new
#         # if have -> update 

# # 3. Home page
#     # recommend product (do after have ai model)
#     # categories (show different product categories)

# # 3.1. Product detail page
@app.post("/Update")
async def Update(user: UpdateRequire, db: Session = Depends(get_db)):
    verification_code = generate_verification_code()
    verification_codes[user.email] = verification_code
 # Email content with verification code
    html = f"""
    <p>Dear {user.name},</p>
    <p>This is a test email</p>
    <p>Your verification code is: <strong>{verification_code}</strong></p>
    <p>Thank you,</p>
    <p>Ai Shopping system</p>
    """

    # Send email with verification code
    message = MessageSchema(
        subject="Hello",
        recipients=[user.email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "Send email successful. Please check your email for verification.", "user": user}

@app.post("/postUpdate")
async def Update(changeInfo: UpdateRequire, db: Session = Depends(get_db)):
# Query the user from the database by email
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the user's password
    user.user_name = changeInfo.name
    user.phone_number = changeInfo.phone


    #Update address will be later






    # Commit the changes to the database
    db.commit()
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    updated_user = {
        "name": user.user_name,
        "email": user.email_address,
        "phone": user.phone_number,
        "address": "user.addresses"
        # Add other fields if needed
    }
    return {"message": "Password changed successfully", "data": updated_user}



    
# # 4. Cart page
#     # add a product to cart
#         # if a product already in cart, add quantity
#     # view products in cart, calculate total price
    
# # 5. Order page
>>>>>>> Stashed changes
