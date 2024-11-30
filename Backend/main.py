from fastapi import FastAPI, HTTPException, status, Depends
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError

import models
from models import *
from schemas import *

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Login & Register api
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )

    # Create a new user
    hashed_password = hash_password(user.password)
    new_user = SiteUser(
        user_name=user.user_name,
        email_address=user.email_address,
        phone_number=user.phone_number,
        password=hashed_password
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error saving user to the database")
    
    return new_user

@app.post("/login", response_model=UserResponse)
async def login_user(user: UserLoginRequest, db: Session = Depends(get_db)):
    # Get user from DB
    db_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    return db_user

# 2. User profile api
    # If-else for checking user address status
        # if doesnt have -> create new
        # if have -> update 

# 3. Home page
    # recommend product (do after have ai model)
    # categories (show different product categories)

# 3.1. Product detail page
    
# 4. Cart page
    # add a product to cart
        # if a product already in cart, add quantity
    # view products in cart, calculate total price
    
# 5. Order page
    