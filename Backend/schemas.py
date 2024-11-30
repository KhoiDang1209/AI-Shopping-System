from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
from datetime import date
from decimal import Decimal

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
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    region: Optional[str] = None
    postal_code: Optional[str] = None
    country_id: int  # User must provide country if no address exists

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