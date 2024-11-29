import re
from pydantic import BaseModel, EmailStr, Field, constr, field_validator, validator
from typing import List, Optional
from typing_extensions import Annotated

# User Schemas
class UserBase(BaseModel):
    user_name: str
    address: str
    phone_number: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    user_id: int

    class Config:
        orm_mode = True


# Address Schemas
class AddressBase(BaseModel):
    address_line1: str
    address_line2: Optional[str]
    city: str
    region: str
    postal_code: str
    country_id: int


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    address_id: int

    class Config:
        orm_mode = True


# Product Schemas
class ProductBase(BaseModel):
    product_name: str
    description: Optional[str]
    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    product_id: int

    class Config:
        orm_mode = True


# Order Schemas
class OrderLineBase(BaseModel):
    product_item_id: int
    qty: int
    price: float


class OrderLineCreate(OrderLineBase):
    pass


class OrderLineResponse(OrderLineBase):
    ordered_product_id: int

    class Config:
        orm_mode = True


class ShopOrderBase(BaseModel):
    user_id: int
    payment_method_id: int
    shipping_method_id: int
    shopping_retail: float
    order_date: str
    order_status_id: int


class ShopOrderCreate(ShopOrderBase):
    pass


class ShopOrderResponse(ShopOrderBase):
    order_id: int
    order_lines: List[OrderLineResponse] = []

    class Config:
        orm_mode = True


#Main schema
# 1. Login & Register schema
class UserRegisterRequest(BaseModel):
    user_name: str
    email_address: EmailStr
    phone_number:  str
    password: str

    # @field_validator('password')
    # def password_complexity(cls, value):
    #     if not re.search(r'[A-Z]', value):
    #         raise ValueError("Password must contain at least one uppercase letter.")
    #     if not re.search(r'[a-z]', value):
    #         raise ValueError("Password must contain at least one lowercase letter.")
    #     if not re.search(r'\d', value):
    #         raise ValueError("Password must contain at least one number.")
    #     if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
    #         raise ValueError("Password must contain at least one special character.")
    #     return value

    class Config:
        orm_mode = True

class UserLoginRequest(BaseModel):
    email_address: EmailStr
    password: str

    class Config:
        orm_mode = True

class UserResponse(BaseModel): # for user response after login / register
    user_name: str
    email_address: EmailStr
    phone_number: str
    password: str
    class Config:
        orm_mode = True
        


# 2. User profile schema

# 3. Product schema
    # category schema
    # variation schema
    
# 4. Cart schema

# 5. Order schema

# Schema for email input
class EmailSchema(BaseModel):
    email: List[EmailStr]

class EmailContent(BaseModel):
    message: str
    subject: str

class RegisterRequest(BaseModel):
    user: UserRegisterRequest
    content: EmailContent

class EmailVadidate(BaseModel):
    email: str
    code: str