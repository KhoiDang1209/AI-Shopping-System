from pydantic import BaseModel
from typing import List, Optional


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