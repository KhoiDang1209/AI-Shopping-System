from collections import defaultdict
import os
import random
import re
import models
from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException, Depends, status, Request, Form, Body
from typing import List
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, NoResultFound
from passlib.context import CryptContext
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import func

# Local imports
from database import engine, SessionLocal
from models import *
from schemas import *

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database

models.Base.metadata.create_all(bind=engine)
#Do not modify this as need to create table be for insert data
# from insert_data import *

# @app.on_event("startup")
# async def startup_event():
#     print("Running data insertion task on startup...")
#     insert_product_data()
#     insert_user_data()
#     insert_product_rating_data()

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
#Login and register
@app.post("/getUserInfoByEmail")
async def getUserInfoByEmail(user: FPEmail, db: Session = Depends(get_db)):
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email).first()
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == existing_user.user_id).all()
    address = db.query(Address).filter(Address.address_id == user_addresses[0].address_id).first()
    return {"data": {
                "name": existing_user.user_name,
                "email": existing_user.email_address,
                "phone": existing_user.phone_number,
                "age": existing_user.age,
                "gender": existing_user.gender,
                "city": existing_user.city,
                "unit_number": address.unit_number,
                "street_number": address.street_number,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "region": address.region,
                "postal_code": address.postal_code
        }}

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
    # Check if user already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Hash the password
    hashed_password = hash_password(user.password)
    
    # Create the SiteUser instance
    db_user = SiteUser(
        user_name=user.user_name,
        age = user.age,
        gender = user.gender,
        email_address=user.email_address,
        phone_number=user.phone_number,
        city = user.city,
        password=hashed_password

    )
    
    # Add and commit SiteUser to get the user_id
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Return a response with both user and personal info
    return {
        "user": {
            "user_id": db_user.user_id,
            "user_name": db_user.user_name,
            "age": db_user.age,
            "gender": db_user.gender,
            "email_address": db_user.email_address,
            "city": db_user.city,
            "password": db_user.password,
        }
    }
@app.post("/login")
async def login(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.phone_number_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.phone_number_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.phone_number == user.phone_number_or_email).first()
    if not existing_user:
        print("User not found in query:", user.phone_number_or_email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Verify the password
    if not verify_password(user.password, existing_user.password):
        hash_password1 = hash_password(user.password)
        print("User not found in query:", hash_password1)
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
    <p>Your verification code is: <strong>{verification_code}</strong></p>
    <p>Thank you,</p>
    <p>AI Shopping System</p>
    """

    # Send email with verification code
    message = MessageSchema(
        subject="Verification Code",
        recipients=[existing_user.email_address],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    # Create user response
    user_response = UserResponse(
        user_name=existing_user.user_name,
        email_address=existing_user.email_address,
        phone_number=existing_user.phone_number,
        password=existing_user.password,
        age=existing_user.age,
        gender=existing_user.gender,
        city=existing_user.city
    )

    return {
        "message": "Email sent successfully. Please check your email for verification.",
        "user": user_response
    }

@app.post("/postLogin/")
async def postLogin(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.phone_number_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.phone_number_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.phone_number == user.phone_number_or_email).first()

    if not existing_user:
        print("User not found in query:", user.phone_number_or_email)
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


@app.post("/preHomepage/")
async def preHomepage(userEmail: FPEmail, db: Session = Depends(get_db)):
    getUserID = db.query(SiteUser).filter(SiteUser.email_address == userEmail.email).first()
    if not getUserID:
        raise HTTPException(status_code=404, detail="User not found")
    
    checkIfFirstTimeLogin = db.query(InterestingCategory).filter(InterestingCategory.user_id == getUserID.user_id).first()
    return {"data": bool(checkIfFirstTimeLogin)}


@app.post("/getAllInterestingProductByUserEmail/")
async def getAllInterestingProductByUserEmail(userEmail: FPEmail, db: Session = Depends(get_db)):
    getUserID = db.query(SiteUser).filter(SiteUser.email_address == userEmail.email).first()
    if not getUserID:
        raise HTTPException(status_code=404, detail="User not found")

    interesting_categories = db.query(InterestingCategory).filter(InterestingCategory.user_id == getUserID.user_id).all()
    if not interesting_categories:
        return {"data": []}
    
    category_names = [db.query(ProductCategory.category_name).filter(ProductCategory.category_id == cat.category_id).scalar() for cat in interesting_categories]
    return {"data": category_names}


@app.post("/insertInterestingProduct/")
async def insertInterestingProduct(list: ListOfInterestingProduct, db: Session = Depends(get_db)):
    user_id = db.query(SiteUser).filter(SiteUser.email_address == list.email).first().user_id
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Insert the selected categories into the InterestingCategory table
    for category_name in list.category_name:
        category_id = db.query(ProductCategory).filter(ProductCategory.category_name == category_name).first().category_id
        if not category_id:
            raise HTTPException(status_code=404, detail=f"Category '{category_name}' not found")
        
        existing_entry = db.query(InterestingCategory).filter(
            InterestingCategory.user_id == user_id,
            InterestingCategory.category_id == category_id
        ).first()
        if not existing_entry:
            interesting_category = InterestingCategory(user_id=user_id, category_id=category_id)
            db.add(interesting_category)
    db.commit()

    return {"message": "Success! Categories added to the database."}


@app.post("/insertInterestingProductWithMostChosenItem/")
async def insertInterestingProductWithMostChosenItem(userEmail: FPEmail, db: Session = Depends(get_db)):
    getUserID = db.query(SiteUser).filter(SiteUser.email_address == userEmail.email).first()
    if not getUserID:
        raise HTTPException(status_code=404, detail="User not found")
    
    top_categories = db.query(
        ProductCategory.category_id,
        func.count(InterestingCategory.category_id).label("category_count")
    ).join(InterestingCategory, InterestingCategory.category_id == ProductCategory.category_id).group_by(ProductCategory.category_id).order_by(func.count(InterestingCategory.category_id).desc()).limit(3).all()

    for category in top_categories:
        existing_entry = db.query(InterestingCategory).filter(
            InterestingCategory.user_id == getUserID.user_id,
            InterestingCategory.category_id == category.category_id
        ).first()
        if not existing_entry:
            interesting_category = InterestingCategory(user_id=getUserID.user_id, category_id=category.category_id)
            db.add(interesting_category)
    
    db.commit()

    return {"message": "Success! Auto-assigned top interesting categories."}

# -------------------------------
# 2. User profile api
    # profile display
    # profile update
    # If-else for checking user address status
        # if doesnt have -> create new
        # if have -> update
    # logout
# -------------------------------
@app.post("/postUpdate")
async def postUpdate(changeInfo: UpdateRequire, db: Session = Depends(get_db)):
    # Find the user based on the provided email
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user personal information
    user.user_name = changeInfo.name
    user.phone_number = changeInfo.phone
    user.age = changeInfo.age
    user.gender = changeInfo.gender
    user.city = changeInfo.city
    db.commit()  # Commit the updated user info

    # Check if the user has existing addresses
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == user.user_id).all()

    if not user_addresses:
        # If no addresses exist, create and link a new address
        new_address = Address(
            unit_number=changeInfo.unit_number,
            street_number=changeInfo.street_number,
            address_line1=changeInfo.address_line1,
            address_line2=changeInfo.address_line2,
            region=changeInfo.region,
            postal_code=changeInfo.postal_code,
        )
        db.add(new_address)
        db.commit()  # Save the new address
        db.refresh(new_address)

        # Link the new address to the user in UserAddress table
        new_user_address = UserAddress(
            user_id=user.user_id,
            address_id=new_address.address_id,
            is_default=True  # Mark this address as the default
        )
        db.add(new_user_address)
        db.commit()  # Save the user-address link

        return {"message": "New address created and linked to user.", "data": {
            "user": {
                "name": user.user_name,
                "email": user.email_address,
                "phone": user.phone_number,
                "age": user.age,
                "gender": user.gender,
                "city": user.city
            },
            "address": {
                "unit_number": new_address.unit_number,
                "street_number": new_address.street_number,
                "address_line1": new_address.address_line1,
                "address_line2": new_address.address_line2,
                "region": new_address.region,
                "postal_code": new_address.postal_code
            }
        }}

    else:
        # If addresses exist, update the first address (or modify logic as needed)
        address = db.query(Address).filter(Address.address_id == user_addresses[0].address_id).first()
        if address:
            address.unit_number = changeInfo.unit_number
            address.street_number = changeInfo.street_number
            address.address_line1 = changeInfo.address_line1
            address.address_line2 = changeInfo.address_line2
            address.region = changeInfo.region
            address.postal_code = changeInfo.postal_code
            db.commit()  # Commit the updated address

        else:
            raise HTTPException(status_code=404, detail="Address not found for user")

    # Return updated user and address data
    return {"message": "User information updated successfully", "data": {
        "user": {
            "name": user.user_name,
            "email": user.email_address,
            "phone": user.phone_number,
            "age": user.age,
            "gender": user.gender,
            "city": user.city
        },
        "address": {
            "unit_number": address.unit_number if address else None,
            "street_number": address.street_number if address else None,
            "address_line1": address.address_line1 if address else None,
            "address_line2": address.address_line2 if address else None,
            "region": address.region if address else None,
            "postal_code": address.postal_code if address else None
        }
    }}

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

def is_email(input_str):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, input_str) is not None
@app.post("/UserAddressInfor/")
async def UserAddressInfor(email: FPEmail, db: Session = Depends(get_db)):
    # Get the user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == email.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get the user addresses
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == user.user_id).all()

    # Fetch the address details by joining the Address table
    addresses_info = []
    for user_address in user_addresses:
        address = db.query(Address).filter(Address.address_id == user_address.address_id).first()
        if address:
            addresses_info.append({
                "unit_number": address.unit_number,
                "street_number": address.street_number,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "region": address.region,
                "postal_code": address.postal_code,
                "is_default": user_address.is_default
            })

    return {"addresses": addresses_info}  
    
# 3. Home page (Store page)
    # home page display
    # recommend product (do after have ai model)
    # categories (show different product categories)
@app.post("/getAllProduct/")
async def get_all_products(db: Session = Depends(get_db)):
    all_products = db.query(Product).all()  # Returns a list of Product objects

    # Sort products by no_of_ratings from highest to lowest
    sorted_products = sorted(all_products, key=lambda p: p.no_of_ratings, reverse=True)

    # Group products by rating ranges
    grouped_products = defaultdict(list)

    for product in sorted_products:
        rating = product.average_rating
        if 0 <= rating < 1:
            grouped_products["0-1"].append(product)
        elif 1 <= rating < 2:
            grouped_products["1-2"].append(product)
        elif 2 <= rating < 3:
            grouped_products["2-3"].append(product)
        elif 3 <= rating < 4:
            grouped_products["3-4"].append(product)
        elif 4 <= rating <= 5:
            grouped_products["4-5"].append(product)

    # Convert grouped products into the required format
    result = {
        "0-1": [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in grouped_products["0-1"]
        ],
        "1-2": [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in grouped_products["1-2"]
        ],
        "2-3": [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in grouped_products["2-3"]
        ],
        "3-4": [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in grouped_products["3-4"]
        ],
        "4-5": [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in grouped_products["4-5"]
        ],
    }

    return result


# Get products by category name
@app.post("/getProductbyCategory/")
async def get_products_by_category(categoryNeed: CategoryName, db: Session = Depends(get_db)):
    category = db.query(ProductCategory).filter(ProductCategory.category_name == categoryNeed.category_name).first()
    if not category:
        return {"error": "Category not found"}

    products_by_category = db.query(Product).filter(Product.category_id == category.category_id).all()

    if not products_by_category:
        return {"error": "No products found for this category"}

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
            "category_id": product.category_id
        }
        for product in products_by_category
    ]


# Get all categories
@app.post("/getAllCategory/")
async def get_all_categories(db: Session = Depends(get_db)):
    all_categories = db.query(ProductCategory).all()  # Returns a list of ProductCategory objects
    return [
        {
            "category_id": category.category_id,
            "parent_category_id": category.parent_category_id,
            "category_name": category.category_name,
        }
        for category in all_categories
    ]


# ------------------------------
# 4. Search Products Page
# ------------------------------

@app.post("/products")
async def get_products(
    category: Optional[str] = Body(None, embed=True),
    min_price: Optional[float] = Body(None, embed=True),
    max_price: Optional[float] = Body(None, embed=True),
    page: int = Body(1, embed=True),
    page_size: int = Body(10, embed=True),
    db: Session = Depends(get_db),
):
    """
    Fetch and filter products with pagination.
    """
    query = db.query(Product)

    if category:
        query = query.filter(Product.main_category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Product.discount_price_usd >= min_price)
    if max_price is not None:
        query = query.filter(Product.discount_price_usd <= max_price)

    total_products = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()

    if not products:
        return {"products": [], "total": 0, "page": page, "page_size": page_size}

    return {
        "products": [
            {
                "product_id": product.product_id,
                "name": product.product_name,
                "category": product.main_category,
                "price": float(product.discount_price_usd),
                "image": product.product_image,
                "ratings": product.average_rating,
                "stock": product.items[0].is_in_stock if product.items else False,
            }
            for product in products
        ],
        "total": total_products,
        "page": page,
        "page_size": page_size,
    }



# ------------------------------
# 4.1. Product Detail Page
# ------------------------------

# @app.get("/products/{product_id}")
# async def get_product_detail(product_id: int, db: Session = Depends(get_db)):
#     """Fetch detailed information for a specific product."""
#     product = db.query(Product).filter(Product.product_id == product_id).first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     return {
#         "product_id": product.product_id,
#         "product_name": product.product_name,
#         "main_category": product.main_category,
#         "sub_category": product.sub_category,
#         "discount_price": product.discount_price_usd,
#         "actual_price": product.actual_price_usd,
#         "description": product.product_image,  # Assuming description exists
#         "image": product.product_image,
#     }

# @app.post("/cart/add")
# async def add_to_cart(product_id: int, quantity: int, db: Session = Depends(get_db)):
#     """Add a product to the shopping cart or update quantity if it already exists."""
#     cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

#     if cart_item:
#         cart_item.quantity += quantity
#     else:
#         cart_item = ShoppingCartItem(product_item_id=product_id, quantity=quantity, price=0.0)
#         db.add(cart_item)

#     db.commit()
#     return {"message": "Product added to cart successfully."}
@app.post("/products/detail")
async def get_product_detail(
    product_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Fetch detailed information for a specific product by product_id.
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "product_id": product.product_id,
        "name": product.product_name,
        "category": product.main_category,
        "price": float(product.discount_price_usd),
        "actual_price": float(product.actual_price_usd),
        "image": product.product_image,
        "description": product.product_image,  # Replace with real description if available
        "ratings": product.average_rating,
        "stock": product.items[0].is_in_stock if product.items else False,
    }


# ------------------------------
# 5. Cart Page
# ------------------------------

# @app.get("/cart")
# async def view_cart(db: Session = Depends(get_db)):
#     """View all items in the cart and calculate total price."""
#     cart_items = db.query(ShoppingCartItem).all()

#     if not cart_items:
#         return {"cart": [], "total_price": 0}

#     total_price = sum(item.quantity * float(item.price) for item in cart_items)
#     return {
#         "cart": [
#             {
#                 "product_id": item.product_item_id,
#                 "quantity": item.quantity,
#                 "price": float(item.price),
#             }
#             for item in cart_items
#         ],
#         "total_price": total_price,
#     }

# @app.delete("/cart/remove/{product_id}")
# async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
#     """Remove a product from the cart."""
#     cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

#     if not cart_item:
#         raise HTTPException(status_code=404, detail="Cart item not found")

#     db.delete(cart_item)
#     db.commit()
#     return {"message": "Item removed from cart."}

# @app.post("/cart/checkout")
# async def checkout(db: Session = Depends(get_db)):
#     """Checkout the cart and clear all items."""
#     cart_items = db.query(ShoppingCartItem).all()

#     if not cart_items:
#         raise HTTPException(status_code=400, detail="Cart is empty")

#     # Simulate order creation (details like user and payment skipped for now)
#     order_total = sum(item.quantity * float(item.price) for item in cart_items)
#     db.query(ShoppingCartItem).delete()
#     db.commit()

#     return {"message": "Checkout successful.", "order_total": order_total}

@app.post("/cart/add")
async def add_to_cart(
    product_id: int = Body(..., embed=True),
    quantity: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Add a product to the cart or update its quantity if already in the cart.
    """
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    # Check if product exists
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if the product is already in the cart
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        # Add new item to the cart
        new_cart_item = ShoppingCartItem(product_item_id=product_id, quantity=quantity, price=product.discount_price_usd)
        db.add(new_cart_item)

    db.commit()

    return {"message": f"{quantity} unit(s) of '{product.product_name}' added to cart."}

# ------------------------------
# Additional Features from Frontend Observed in Product.js
# ------------------------------

@app.post("/categories")
async def get_product_categories(db: Session = Depends(get_db)):
    """
    Fetch distinct product categories for filtering.
    """
    categories = db.query(Product.main_category).distinct().all()
    return {"categories": [category[0] for category in categories]}

# ------------------------------
# Cart Display
# ------------------------------

@app.post("/cart")
async def get_cart(db: Session = Depends(get_db)):
    """
    Fetch all items in the user's cart.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        return {"cart": [], "total_price": 0}

    total_price = sum(item.quantity * float(item.price) for item in cart_items)

    return {
        "cart": [
            {
                "product_id": item.product_item_id,
                "quantity": item.quantity,
                "price": float(item.price),
                "name": item.product_item.product_name if item.product_item else "Unknown Product",
                "imageUrl": item.product_item.product_image if item.product_item else "",
            }
            for item in cart_items
        ],
        "total_price": total_price,
    }
async def cart(type: str = Body(..., embed=True), db: Session = Depends(get_db)):
    if type == "remove-all":
        db.query(ShoppingCartItem).delete()  # Remove all items from the cart
        db.commit()
        return {"message": "All items removed from cart."}
# ------------------------------
# Remove Item from Cart
# ------------------------------

@app.post("/cart/remove")
async def remove_from_cart(product_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Remove a specific item from the cart by product_id.
    """
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart."}

# ------------------------------
# Checkout (Clear Cart)
# ------------------------------

@app.post("/cart/checkout")
async def checkout(db: Session = Depends(get_db)):
    """
    Clear the cart and complete the checkout process.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Simulate order processing
    order_total = sum(item.quantity * float(item.price) for item in cart_items)

    # Clear the cart
    db.query(ShoppingCartItem).delete()
    db.commit()

    return {"message": "Checkout successful", "order_total": order_total}

# ------------------------------
# Additional Functionality
# ------------------------------

@app.post("/cart/deselect-all")
async def deselect_all_items(db: Session = Depends(get_db)):
    """
    Clear all items from the cart.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        return {"message": "Cart is already empty."}

    db.query(ShoppingCartItem).delete()
    db.commit()
    return {"message": "All items removed from cart."}

# ------------------------------
# 6. Order Page
# ------------------------------

# @app.get("/orders/{order_id}")
# async def get_order_detail(order_id: int, db: Session = Depends(get_db)):
#     """Fetch details of a specific order."""
#     order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()
#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")

#     return {
#         "order_id": order.order_id,
#         "order_date": order.order_date,
#         "order_total": float(order.order_total),
#         "items": [
#             {"product_id": line.product_item_id, "quantity": line.qty, "price": float(line.price)}
#             for line in order.order_lines
#         ],
#     }

# @app.get("/orders/history")
# async def get_order_history(db: Session = Depends(get_db)):
#     """Fetch all past orders for a user."""
#     orders = db.query(ShopOrder).all()

#     if not orders:
#         return {"message": "No past orders found."}

#     return [
#         {
#             "order_id": order.order_id,
#             "order_date": order.order_date,
#             "order_total": float(order.order_total),
#         }
#         for order in orders
#     ]

# ------------------------------
# Checkout Display
# ------------------------------

@app.post("/checkout/display")
async def display_checkout(db: Session = Depends(get_db)):
    """
    Fetch items in the cart, total price, and available payment and shipping methods.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.quantity * float(item.price) for item in cart_items)

    payment_methods = db.query(UserPaymentMethod).all()
    shipping_methods = db.query(ShippingMethod).all()

    return {
        "cart_items": [
            {
                "product_id": item.product_item_id,
                "name": item.product_item.product_name if item.product_item else "Unknown Product",
                "price": float(item.price),
                "quantity": item.quantity,
                "imageUrl": item.product_item.product_image if item.product_item else "",
            }
            for item in cart_items
        ],
        "total_price": total_price,
        "payment_methods": [
            {"id": method.payment_method_id, "provider": method.provider, "account_number": method.account_number}
            for method in payment_methods
        ],
        "shipping_methods": [
            {"id": method.shipping_method_id, "type": method.type, "price": float(method.price)}
            for method in shipping_methods
        ],
    }

# ------------------------------
# Order Create
# ------------------------------

@app.post("/checkout/create-order")
async def create_order(
    payment_method_id: int = Body(..., embed=True),
    shipping_method_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Create an order with the selected payment and shipping methods.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.quantity * float(item.price) for item in cart_items)

    # Create the order
    new_order = ShopOrder(
        user_id=1,  # Replace with actual user ID from authentication
        order_date=datetime.now(),
        order_total=total_price,
        payment_method_id=payment_method_id,
        shipping_method_id=shipping_method_id,
        order_status_id=1,  # Assuming '1' is the ID for 'Pending' status
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Add order lines
    for item in cart_items:
        order_line = OrderLine(
            order_id=new_order.order_id,
            product_item_id=item.product_item_id,
            qty=item.quantity,
            price=item.price,
        )
        db.add(order_line)

    # Clear the cart
    db.query(ShoppingCartItem).delete()
    db.commit()

    return {"message": "Order created successfully", "order_id": new_order.order_id}

# ------------------------------
# Order Display
# ------------------------------

@app.post("/order/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """
    Fetch and display details for a specific order by order_id.
    """
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order.order_id,
        "order_date": order.order_date,
        "total_price": float(order.order_total),
        "status": order.order_status.status if order.order_status else "Unknown",
        "items": [
            {"product_id": line.product_item_id, "quantity": line.qty, "price": float(line.price)}
            for line in order.order_lines
        ],
        "payment_method": {
            "provider": order.payment_method.provider,
            "account_number": order.payment_method.account_number,
        } if order.payment_method else None,
        "shipping_method": {
            "type": order.shipping_method.type,
            "price": float(order.shipping_method.price),
        } if order.shipping_method else None,
    }

# ------------------------------
# Order History
# ------------------------------

@app.post("/order/history")
async def get_order_history(db: Session = Depends(get_db)):
    """
    Fetch a list of all past orders for the user.
    """
    orders = db.query(ShopOrder).filter(ShopOrder.user_id == 1).all()  # Replace with actual user ID

    if not orders:
        return {"message": "No past orders found", "orders": []}

    return [
        {
            "order_id": order.order_id,
            "order_date": order.order_date,
            "total_price": float(order.order_total),
            "status": order.order_status.status if order.order_status else "Unknown",
        }
        for order in orders
    ]

# ------------------------------
# Payment Processing (Simulated)
# ------------------------------

@app.post("/payment/process")
async def process_payment(order_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Simulate payment processing for a specific order.
    """
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Simulate payment processing
    order.order_status_id = 2  # Assuming '2' is the ID for 'Completed' status
    db.commit()

    return {"message": "Payment processed successfully", "order_id": order.order_id}


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
