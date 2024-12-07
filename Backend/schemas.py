from pydantic import BaseModel, EmailStr, Field, constr, field_validator, validator
from datetime import date
from decimal import Decimal
from typing import List, Optional, Union
from typing_extensions import Annotated
import re

# 1. Login & Register schema
# class UserRegisterRequest(BaseModel):
#     user_name: str
#     email_address: EmailStr
#     phone_number: constr(min_length=10, max_length=10)
#     password: constr(min_length=8)

#     class Config:
#         orm_mode = True

# class UserLoginRequest(BaseModel):
#     email_address: EmailStr
#     password: str

#     class Config:
#         orm_mode = True

# class UserResponse(BaseModel): # for user response after login / register
#     user_id: int
#     user_name: str
#     email_address: EmailStr
#     phone_number: str

#     class Config:
#         orm_mode = True
        
# # 2. User profile schema

# # 3. Product schema
#     # category schema
#     # variation schema
    
# # 4. Cart schema

# # 5. Order schema

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
    age: int
    gender: str
    city: str
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
    age: int
    gender: str
    city: str
    class Config:
        orm_mode = True

class LoginRequire(BaseModel):
    phone_number_or_email: Union[str, EmailStr]  # Accepts either a string (username) or an Email
    password: str

    class Config:
        orm_mode = True


# 2. User profile schema
class UserProfileResponse(BaseModel):
    user_id: int
    user_name: str
    email_address: EmailStr
    phone_number: str
    user_address: Optional[str] = None
    
    class Config:
        orm_mode = True
    
    # user address (for user to add/update address)
class UserAddressRequest(BaseModel):
    email: EmailStr
    unit_number: Optional[str] = None
    street_number: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    region: Optional[str] = None
    postal_code: Optional[str] = None

    class Config:
        orm_mode = True

# 3. Product schema
    # category
class CategoryResponse(BaseModel):
    category_id: int
    category_name: str

    class Config:
        orm_mode = True

    # variation
class VariationResponse(BaseModel):
    variation_id: int
    name: str
    size: Optional[str] = None
    color: Optional[str] = None

    class Config:
        orm_mode = True
        
    # products
class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    description: Optional[str] = None
    price: Decimal
    SKU: str
    product_image: Optional[str] = None
    category: CategoryResponse
    variations: Optional[List[VariationResponse]] = []

    class Config:
        orm_mode = True
    
    # product configuration
class ProductConfigurationResponse(BaseModel):
    product_item_id: int
    variation_options: List[str] 

    class Config:
        orm_mode = True
    
# 3.1 Home page schema
    # recommend products
class RecommendedProductResponse(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    price: Decimal

    class Config:
        orm_mode = True

    # home page (show categories and )
    
# 4. Cart schema
    # cart item
class CartItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: Decimal
    total_price: Decimal

    class Config:
        orm_mode = True
        
    # cart (contains a list of CartItemResponse)
class CartResponse(BaseModel):
    cart_id: int
    items: List[CartItemResponse]
    total: Decimal

    class Config:
        orm_mode = True

# 5. Order schema
    # payment method
class PaymentMethodResponse(BaseModel):
    payment_method_id: int
    payment_name: str

    class Config:
        orm_mode = True

    # shipping method
class ShippingMethodResponse(BaseModel):
    shipping_method_id: int
    type: str
    price: Decimal

    class Config:
        orm_mode = True

    # order item
class OrderItemResponse(BaseModel):
    ordered_product_id: int
    product_name: str
    quantity: int
    price: Decimal
    total_price: Decimal

    class Config:
        orm_mode = True
        
    # order response (show order details)
class OrderResponse(BaseModel):
    order_id: int
    user_id: int
    order_date: date
    order_total: Decimal
    order_status: str  # Status of the order: Pending, Shipped, etc.
    shipping_method: ShippingMethodResponse
    payment_method: PaymentMethodResponse
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True
        
    # order request (for submitting an order)
class OrderRequest(BaseModel):
    payment_method_id: int
    shipping_method_id: int

    class Config:
        orm_mode = True
        
# 6. Additional schema (for country)
class CountryResponse(BaseModel):
    country_id: int
    country_name: str

    class Config:
        orm_mode = True
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
    email: EmailStr
    code: str

class FPEmail(BaseModel):
    email: EmailStr

class ChangePasswordInfor(BaseModel):
    email: EmailStr
    newPassword: str
    confirmPassword: str

class UpdateRequire(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    age: int
    gender: str
    city: str
    unit_number: str
    street_number: str
    address_line1: str
    address_line2: str
    region: str
    postal_code: str
class CategoryName(BaseModel):
    category_name: str

    class Config:
        orm_mode = True

class ListOfInterestingProduct(BaseModel):
    category_name: List[str]
    email: EmailStr
    class Config:
        orm_mode = True

