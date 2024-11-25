from fastapi import FastAPI, HTTPException, Depends
from typing import List
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import models

from models import User, Address, Product, ShopOrder

from schemas import (
    UserCreate,
    UserResponse,
    AddressCreate,
    AddressResponse,
    ProductCreate,
    ProductResponse,
    ShopOrderCreate,
    ShopOrderResponse,
)

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
# User Endpoints
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
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
    return db.query(User).all()


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
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