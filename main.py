import os
import random
import re
from dotenv import dotenv_values
from fastapi import status, FastAPI, HTTPException, Depends
from typing import List

from pydantic import EmailStr, ValidationError
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from models import SiteUser, Address, Product, ShopOrder
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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
    LoginRequire
)
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)
# print(credentials)
app = FastAPI()
models.Base.metadata.create_all(bind=engine)
origins = [
    "http://localhost:3000"
]
# Add CORS Middleware to allow requests from the frontend
# Allow both localhost and 127.0.0.1


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
# User Endpoints

app.add_middleware(
CORSMiddleware,
allow_origins=origins, # Allows all origins
allow_credentials=True,
allow_methods=["*"], # Allows all methods
allow_headers=["*"], # Allows all headers
)
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
    hashed_password = hash_password(user.password)
    # Store user in the database
    new_user = SiteUser(
        user_name=user.user_name,
        email_address=user.email_address,
        phone_number=user.phone_number,
        password=hashed_password
    )
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
    db_user = SiteUser(
        user_name=user.user_name,
        email_address=user.email_address,
        phone_number=user.phone_number,
        password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def is_email(value: str) -> bool:
    # Check if value is a valid email using regex
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, value) is not None

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

    # Check if the password is correct (assuming you have password hashing)
    if existing_user.password != user.password:  # Replace with hashing check if needed
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
# @app.post("/login", response_model=UserResponse)
# async def login_user(user: UserLoginRequest, db: Session = Depends(get_db)):
#     # Get user from DB
#     db_user = db.query(User).filter(User.email_address == user.email_address).first()
    
#     if not db_user or not verify_password(user.password, db_user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid credentials"
#         )
    
#     return db_user

# # 2. User profile api
#     # If-else for checking user address status
#         # if doesnt have -> create new
#         # if have -> update 

# # 3. Home page
#     # recommend product (do after have ai model)
#     # categories (show different product categories)

# # 3.1. Product detail page
    
# # 4. Cart page
#     # add a product to cart
#         # if a product already in cart, add quantity
#     # view products in cart, calculate total price
    
# # 5. Order page