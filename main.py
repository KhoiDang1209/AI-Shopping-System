from fastapi import FastAPI, HTTPException, Depends
from typing import List
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import models

from models import User, Address, Product, ShopOrder

from schemas import (

)

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
