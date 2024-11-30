from pydantic import BaseModel, EmailStr, constr
# from typing import List, Optional
# from datetime import date
# from decimal import Decimal

# 1. Login & Register schema
class UserRegisterRequest(BaseModel):
    user_name: str
    email_address: EmailStr
    phone_number: constr(min_length=10, max_length=10)
    password: constr(min_length=8)

    class Config:
        orm_mode = True

class UserLoginRequest(BaseModel):
    email_address: EmailStr
    password: str

    class Config:
        orm_mode = True

class UserResponse(BaseModel): # for user response after login / register
    user_id: int
    user_name: str
    email_address: EmailStr
    phone_number: str

    class Config:
        orm_mode = True
        
# 2. User profile schema

# 3. Product schema
    # category schema
    # variation schema
    
# 4. Cart schema

# 5. Order schema