import os
import random
import re
import models
from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException, Depends, status, Request, Form
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
import requests
# from ModelApp.ML_FastAPI_Docker_Heroku import main

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database

models.Base.metadata.create_all(bind=engine)
#Do not modify this as need to create table be for insert data
from recommend import (get_search_recommendations, get_collaborative_recommendations)
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
    return {"name": existing_user.user_name, "email": existing_user.email_address, "phone": existing_user.phone_number, "password": existing_user.password, "user_id": existing_user.user_id}

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
# 2. User Profile 
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
    user.age = changeInfo.age
    user.gender = changeInfo.gender
    user.city = changeInfo.city
    db.commit()

    return {"message": "User information updated successfully", "data": {"name": user.user_name, "email": user.email_address, "phone": user.phone_number, "age": user.age, "gender": user.gender, "city": user.city}}

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

# 2. User profile api
    # profile display
    # profile update
    # If-else for checking user address status
        # if doesnt have -> create new
        # if have -> update
    # logout
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

@app.post("/updateAddress/")
async def updateAddress(user: UserAddressRequest, db: Session = Depends(get_db)):
    # Generate verification code
    verification_code = generate_verification_code()
    verification_codes[user.email] = verification_code

    # Send email with verification code
    html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    message = MessageSchema(subject="Verification Code", recipients=[user.email], body=html, subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)

    return {"message": "Please check your email for verification."}

@app.post("/postupdateAddress/")
async def update_address(user_request: UserAddressRequest, db: Session = Depends(get_db)):
    # Get the user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == user_request.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if user already has addresses
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == user.user_id).all()

    if not user_addresses:
        # If user has no address, create a new one and link it
        new_address = Address(
            unit_number=user_request.unit_number,
            street_number=user_request.street_number,
            address_line1=user_request.address_line1,
            address_line2=user_request.address_line2,
            region=user_request.region,
            postal_code=user_request.postal_code,
        )
        db.add(new_address)
        db.commit()  # Save the new address
        db.refresh(new_address)

        # Link the new address to the user in the UserAddress table
        new_user_address = UserAddress(
            user_id=user.user_id,
            address_id=new_address.address_id,
            is_default=True  # Set it as default if it's the first address
        )
        db.add(new_user_address)
        db.commit()  # Save the user-address link
        return {"message": "New address created and linked to user.", "data": user_request}
    
    else:
        # If addresses exist, update the first one (or implement custom logic to choose the address)
        address = db.query(Address).filter(Address.address_id == user_addresses[0].address_id).first()

        if address:
            address.unit_number = user_request.unit_number
            address.street_number = user_request.street_number
            address.address_line1 = user_request.address_line1
            address.address_line2 = user_request.address_line2
            address.region = user_request.region
            address.postal_code = user_request.postal_code

        db.commit()  # Save the updated address
        return {"message": "Address updated successfully."}
    
# 3. Home page (Store page)
    # home page display
    # recommend product (do after have ai model)
    # categories (show different product categories)
    

@app.get("/getHomePageProduct/")
async def get_home_page_product(userid: int, db: Session = Depends(get_db)):
    
    result = get_collaborative_recommendations(str(userid))
    
    all_products = db.query(Product).filter(
        Product.product_id.in_(result)
    ).all()  # Returns a list of Product objects
    
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
        }
        for product in all_products
    ]


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

# done
@app.get("/products/search")
async def search_products(query: str = "", db: Session = Depends(get_db)):
    """Search products by name or category."""

    product_ids = get_search_recommendations(query)
    
    products = db.query(Product).filter(
        Product.product_id.in_(product_ids)
    ).all()

    if not products:
        return JSONResponse(status_code=404, content={"message": "No products found."})
    
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
        }
        for product in products
    ]

# ------------------------------
# 4.1. Product Detail Page
# ------------------------------

@app.get("/products/{product_id}")
async def get_product_detail(product_id: String, db: Session = Depends(get_db)):
    """Fetch detailed information for a specific product."""
    
    product = db.query(Product).filter(
        Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

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
        }
    ]


@app.get()
async def get_selected_related_item(product)

@app.post("/cart/add")
async def add_to_cart(product_id: int, quantity: int, db: Session = Depends(get_db)):
    """Add a product to the shopping cart or update quantity if it already exists."""
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = ShoppingCartItem(product_item_id=product_id, quantity=quantity, price=0.0)
        db.add(cart_item)

    db.commit()
    return {"message": "Product added to cart successfully."}

# ------------------------------
# 5. Cart Page
# ------------------------------

@app.get("/cart")
async def view_cart(db: Session = Depends(get_db)):
    """View all items in the cart and calculate total price."""
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
            }
            for item in cart_items
        ],
        "total_price": total_price,
    }

@app.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
    """Remove a product from the cart."""
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart."}

@app.post("/cart/checkout")
async def checkout(db: Session = Depends(get_db)):
    """Checkout the cart and clear all items."""
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Simulate order creation (details like user and payment skipped for now)
    order_total = sum(item.quantity * float(item.price) for item in cart_items)
    db.query(ShoppingCartItem).delete()
    db.commit()

    return {"message": "Checkout successful.", "order_total": order_total}

# ------------------------------
# 6. Order Page
# ------------------------------

@app.get("/orders/{order_id}")
async def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    """Fetch details of a specific order."""
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order.order_id,
        "order_date": order.order_date,
        "order_total": float(order.order_total),
        "items": [
            {"product_id": line.product_item_id, "quantity": line.qty, "price": float(line.price)}
            for line in order.order_lines
        ],
    }

@app.get("/orders/history")
async def get_order_history(db: Session = Depends(get_db)):
    """Fetch all past orders for a user."""
    orders = db.query(ShopOrder).all()

    if not orders:
        return {"message": "No past orders found."}

    return [
        {
            "order_id": order.order_id,
            "order_date": order.order_date,
            "order_total": float(order.order_total),
        }
        for order in orders
    ]


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
