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

from fastapi.responses import HTMLResponse
from sqlalchemy import func

# Local imports
from database import engine, SessionLocal
from models import *
from schemas import (
    UserAddressRequest, UserCreate, UserResponse, AddressCreate, AddressResponse, ProductCreate,
    ProductResponse, ShopOrderCreate, ShopOrderResponse, UserRegisterRequest,
    EmailContent, RegisterRequest, EmailVadidate, LoginRequire, FPEmail,
    ChangePasswordInfor, UpdateRequire, CategoryName, ListOfInterestingProduct
)

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database
models.Base.metadata.create_all(bind=engine)
#Do not modify this as need to create table be for insert data
from insertDB import insert_countries, insert_data
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
                "city": address.city,
                "region": address.region,
                "postal_code": address.postal_code,
                "country_id": address.country_id,  # Optionally, join to fetch country name if needed
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
            city=user_request.city,
            region=user_request.region,
            postal_code=user_request.postal_code,
            country_id=user_request.country_id,
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
            address.city = user_request.city
            address.region = user_request.region
            address.postal_code = user_request.postal_code
            address.country_id = user_request.country_id

        db.commit()  # Save the updated address
        return {"message": "Address updated successfully."}
    
# 3. Home page (Store page)
    # home page display
    # recommend product (do after have ai model)
    # categories (show different product categories)
@app.post("/getAllProduct/")
async def get_all_products(db: Session = Depends(get_db)):
    all_products = db.query(Product).all()  # Returns a list of Product objects
    return [
        {
            "product_id": product.product_id,
            "category_id": product.category_id,
            "product_name": product.product_name,
            "description": product.description,
            "product_image": product.product_image,
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
            "category_id": product.category_id,
            "product_name": product.product_name,
            "description": product.description,
            "product_image": product.product_image,
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
# # Product Page
# @app.get("/search-products", response_class=HTMLResponse)
# async def search_products(query: str = '', db: Session = Depends(get_db)):
#     # Query products based on the search term (if provided)
#     products = db.query(Product).filter(Product.name.contains(query)).all()
    
#     # If no products are found
#     if not products:
#         return HTMLResponse(content="<h1>No products found.</h1>", status_code=404)
    
#     # Construct HTML content to display products
#     html_content = "<h1>Search Results</h1>"
#     html_content += "<ul>"
    
#     for product in products:
#         html_content += f"""
#         <li>
#             <a href="/product-detail/{product.product_id}">
#                 <h3>{product.name}</h3>
#                 <p>{product.description}</p>
#                 <p>Price: ${product.price}</p>
#             </a>
#         </li>
#         """
#     html_content += "</ul>"
    
#     return HTMLResponse(content=html_content)


# 4. Search Products Page
@app.get("/search", response_class=HTMLResponse)
async def search_products(request: Request, query: str = "", db: Session = Depends(get_db)):
    # Query the database to search for products
    #products = db.query(Product).all()
    products = db.query(Product).filter(Product.name.ilike(f"%{query}%")).all()

    # HTML response with embedded product list
    html_content = """
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Search Products</title>
    </head>
    <body>
        <h1>Search for Products</h1>
        <form action="/search" method="get">
            <input type="text" name="query" value="{query}" placeholder="Search for products">
            <button type="submit">Search</button>
        </form>
        
        <h2>Results:</h2>
        <ul>
    """
    if products:
        for product in products:
            html_content += f"""
            <li>
                <a href="/product/{product.id}">{product.name}</a> - ${product.price}
            </li>
            """
    else:
        html_content += "<li>No products found</li>"
    
    html_content += """
        </ul>
        <a href="/cart">View Cart</a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

# 4.1 Product Detail Page (View Product Details and Add to Cart)
@app.get("/product/{product_id}", response_class=HTMLResponse)
async def product_detail(request: Request, product_id: int, db: Session = Depends(get_db)):
    # Query the database for the product details
    product = db.query(ProductItem).filter(ProductItem .id == product_id).first()
    
    try:
        product = db.query(Product).filter(Product.id == product_id).one()
    except NoResultFound:
        return HTMLResponse(content="<h1>Product not found</h1>", status_code=404)

    # Check if product is already in cart
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_id == product_id).first()
    
    # HTML response with product details

    html_content = f"""
    <html>
    <head><title>{product.name}</title></head>
    <body>
    <h1>{product.name}</h1>
    <p>{product.description}</p>
    <p><strong>Price:</strong> ${product.price}</p>
    <p><strong>Stock:</strong> {product.stock}</p>
    """

    if cart_item:
        html_content += f"""
        <p>Already in Cart. Quantity: {cart_item.quantity}</p>
        <form action="/update_cart/{cart_item.id}" method="POST">
            <label for="quantity">Update Quantity:</label>
            <input type="number" id="quantity" name="quantity" value="{cart_item.quantity}" min="1" max="{product.stock}" required>
            <button type="submit">Update Cart</button>
        </form>
        """
    else:
        html_content += f"""
        <form action="/add_to_cart/{product.id}" method="POST">
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" value="1" min="1" max="{product.stock}" required>
            <button type="submit">Add to Cart</button>
        </form>
        """

    html_content += """
    <br>
    <a href="/search">Back to Search</a> | <a href="/cart">Go to Cart</a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

# Add product to cart or update quantity if already in cart
@app.post("/add_to_cart/{product_id}", response_class=HTMLResponse)
async def add_to_cart(request: Request, product_id: int, quantity: int = Form(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product or quantity < 1:
        return HTMLResponse(content="<h1>Invalid product or quantity.</h1>", status_code=400)

    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_id == product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        new_cart_item = ShoppingCartItem(product_id=product_id, quantity=quantity)
        db.add(new_cart_item)

    db.commit()

    return HTMLResponse(content=f"""
    <html>
    <body>
        <h1>{product.name} added to cart successfully.</h1>
        <a href="/cart">Go to Cart</a> | <a href="/search">Back to Search</a>
    </body>
    </html>
    """)

# Update cart item quantity
@app.post("/update_cart/{cart_item_id}", response_class=HTMLResponse)
async def update_cart(cart_item_id: int, quantity: int = Form(...), db: Session = Depends(get_db)):
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.id == cart_item_id).first()

    if not cart_item or quantity < 1:
        return HTMLResponse(content="<h1>Invalid quantity.</h1>", status_code=400)

    cart_item.quantity = quantity
    db.commit()

    return HTMLResponse(content=f"""
    <html>
    <body>
        <h1>Cart updated successfully.</h1>
        <a href="/cart">Go to Cart</a> | <a href="/search">Back to Search</a>
    </body>
    </html>
    """)


# 5. Cart Page (Display Cart, Remove Item, Checkout)
@app.get("/cart", response_class=HTMLResponse)
async def cart_page(request: Request, db: Session = Depends(get_db)):
    # Query the database for cart items (assuming `in_cart` is a boolean field)
    # cart_items = db.query(Product).filter(Product.in_cart == True).all()
    cart_items = db.query(ShoppingCartItem).all()
    
    if not cart_items:
        return HTMLResponse(content="<h1>Your cart is empty.</h1>")

    total_price = sum(item.product.price * item.quantity for item in cart_items)

    # HTML response with cart items
    
    # html_content = f"""
    # <!DOCTYPE html>
    # <html lang="en">
    # <head>
    #     <meta charset="UTF-8">
    #     <title>Shopping Cart</title>
    # </head>
    # <body>
    #     <h1>Your Shopping Cart</h1>
    #     <ul>
    # """
    # if cart_items:
    #     for product in cart_items:
    #         html_content += f"""
    #         <li>
    #             {product.name} - ${product.price}
    #             <form action="/remove_from_cart/{product.id}" method="post" style="display:inline;">
    #                 <button type="submit">Remove from Cart</button>
    #             </form>
    #         </li>
    #         """
    # else:
    #     html_content += "<li>Your cart is empty.</li>"
    
    # html_content += """
    #     </ul>
    #     <br>
    #     <a href="/search">Continue Shopping</a>
    # </body>
    # </html>
    # """
    
    html_content = """
    <html>
    <head><title>Your Cart</title></head>
    <body>
    <h1>Your Cart</h1>
    <ul>
    """
    for cart_item in cart_items:
        html_content += f"""
        <li>
            {cart_item.product.name} - ${cart_item.product.price} x {cart_item.quantity} 
            <form action="/remove_from_cart/{cart_item.id}" method="POST">
                <button type="submit">Remove</button>
            </form>
        </li>
        """
    
    html_content += f"""
    </ul>
    <p><strong>Total Price: ${total_price}</strong></p>
    <a href="/checkout">Proceed to Checkout</a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

# # Route to add an item to the cart
# @app.post("/add_to_cart/{product_id}")
# async def add_to_cart(product_id: int, db: Session = Depends(get_db)):
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if product:
#         product.in_cart = True
#         db.commit()
#     return {"message": "Item added to cart"}

# Route to remove an item from the cart
# @app.post("/remove_from_cart/{product_id}")
# async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if product:
#         product.in_cart = False
#         db.commit()
#     return {"message": "Item removed from cart"}

# Remove item from cart
@app.post("/remove_from_cart/{cart_item_id}", response_class=HTMLResponse)
async def remove_from_cart(cart_item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.id == cart_item_id).first()

    if cart_item:
        db.delete(cart_item)
        db.commit()

    return HTMLResponse(content="<h1>Item removed from cart.</h1><a href='/cart'>Back to Cart</a>")


# # 6. Checkout Page
# @app.get("/checkout", response_class=HTMLResponse)
# async def checkout_page(request: Request, db: Session = Depends(get_db)):
#     cart_items = db.query(CartItem).all()
    
#     if not cart_items:
#         return HTMLResponse(content="<h1>Your cart is empty. Please add some products to your cart.</h1>")
    
#     total_price = sum(item.product.price * item.quantity for item in cart_items)

#     html_content = f"""
#     <html>
#     <head><title>Checkout</title></head>
#     <body>
#     <h1>Checkout</h1>
#     <ul>
#     """
#     for cart_item in cart_items:
#         html_content += f"""
#         <li>{cart_item.product.name} - ${cart_item.product.price} x {cart_item.quantity}</li>
#         """
    
#     html_content += f"""
#     </ul>
#     <p><strong>Total Price: ${total_price}</strong></p>
    
#     <h2>Shipping Details</h2>
#     <form action="/place_order" method="POST">
#         <label for="name">Full Name:</label><br>
#         <input type="text" id="name" name="name" required><br><br>
#         <label for="address">Shipping Address:</label><br>
#         <textarea id="address" name="address" rows="4" required></textarea><br><br>
#         <button type="submit">Place Order</button>
#     </form>
#     </body>
#     </html>
#     """
#     return HTMLResponse(content=html_content)

# # Place Order (Checkout Confirmation)
# @app.post("/place_order", response_class=HTMLResponse)
# async def place_order(request: Request, name: str, address: str, db: Session = Depends(get_db)):
#     cart_items = db.query(CartItem).all()

#     if not cart_items:
#         return HTMLResponse(content="<h1>Your cart is empty. Cannot place an order.</h1>")
    
#     order = Order(customer_name=name, shipping_address=address)
#     db.add(order)
#     db.commit()
#     db.refresh(order)

#     for cart_item in cart_items:
#         order_item = OrderItem(order_id=order.id, product_id=cart_item.product_id, quantity=cart_item.quantity, price=cart_item.product.price)
#         db.add(order_item)
    
#     # Clear the cart
#     db.query(CartItem).delete()
#     db.commit()

#     return HTMLResponse(content=f"""
#     <html>
#     <body>
#         <h1>Thank You for Your Order, {name}!</h1>
#         <p>Your order has been placed successfully.</p>
#         <a href="/search">Continue Shopping</a>
#     </body>
#     </html>
#     """)


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
