from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# 1. User-related schemas
class UserRegister(BaseModel):
    user_name: str
    email_address: EmailStr
    password: str

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    email_address: EmailStr
    password: str

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    user_id: int
    user_name: str
    email_address: EmailStr

    class Config:
        orm_mode = True