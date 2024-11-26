from sqlalchemy import (Column, Integer, String, ForeignKey, Boolean, Text, Date, DECIMAL)
from sqlalchemy.orm import relationship
from database import Base

# Location Tables
class Country(Base):
    __tablename__ = "country"
    country_id = Column(Integer, primary_key=True, index=True)
    country_name = Column(String(100), nullable=False)
    
    addresses = relationship("Address", back_populates="country")
    
class Address(Base):
    __tablename__ = "address"
    address_id = Column(Integer, primary_key=True, index=True)
    unit_number = Column(String(100))
    street_number = Column(String(10))
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False)
    region = Column(String(100))
    postal_code = Column(String(20))
    country_id = Column(Integer, ForeignKey("country.country_id"))

    country = relationship("Country", back_populates="addresses")
    user_addresses = relationship("UserAddress", back_populates="address")

# 1. User-related Tables
class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    email_address = Column(String(100), unique=True)
    address = Column(Text)
    phone_number = Column(String(10))
    password = Column(String(255), nullable=False)

    addresses = relationship("UserAddress", back_populates="user")
    user_payment_methods = relationship("UserPaymentMethod", back_populates="user")
    reviews = relationship("UserReview", back_populates="user")
    shopping_carts = relationship("ShoppingCart", back_populates="user")
    orders = relationship("ShopOrder", back_populates="user")


class UserAddress(Base):
    __tablename__ = "user_address"
    user_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
    address_id = Column(Integer, ForeignKey("address.address_id"), primary_key=True)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")
    address = relationship("Address", back_populates="user_address")


class UserPaymentMethod(Base):
    __tablename__ = "user_payment_method"
    payment_method_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
    payment_type_id = Column(Integer, ForeignKey("payment_type.payment_type_id"), primary_key=True)
    provider = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False)
    expiry_date = Column(Date, nullable=False)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="user_payment_method")
    shop_order = relationship("ShopOrder")
    payment_type = relationship("PaymentType")


class UserReview(Base):
    __tablename__ = "user_review"
    user_review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    ordered_product_id = Column(Integer, ForeignKey("order_line.ordered_product_id"))
    rating_value = Column(DECIMAL(2, 1), nullable=False)
    comment = Column(Text)

    user = relationship("User", back_populates="reviews")
    order_line = relationship("OrderLine")


# 2. Product-related Tables
class Product(Base):
    __tablename__ = "product"
    product_id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("product_category.category_id"))
    product_name = Column(String(100), nullable=False)
    description = Column(Text)
    product_image = Column(String(255))

    category = relationship("ProductCategory", back_populates="products")
    items = relationship("ProductItem", back_populates="product")


class ProductCategory(Base):
    __tablename__ = "product_category"
    category_id = Column(Integer, primary_key=True, index=True)
    parent_category_id = Column(Integer, ForeignKey("product_category.category_id"))
    category_name = Column(String(100), nullable=False)

    parent_category = relationship("ProductCategory", remote_side=[category_id])
    products = relationship("Product", back_populates="category")


class ProductItem(Base):
    __tablename__ = "product_item"
    product_item_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"))
    price = Column(DECIMAL(10, 2), nullable=False)
    SKU = Column(String(50), nullable=False)
    is_in_stock = Column(Boolean, default=True)
    product_image = Column(String(255))

    product = relationship("Product", back_populates="items")
    configurations = relationship("ProductConfiguration", back_populates="product_item")


# 3. Shopping Cart-related Table
class ShoppingCart(Base):
    __tablename__ = "shopping_cart"
    shopping_cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))

    user = relationship("User", back_populates="shopping_carts")
    items = relationship("ShoppingCartItem", back_populates="shopping_cart")
    
    
class ShoppingCartItem(Base):
    __tablename__ = "shopping_cart_item"
    shopping_cart_id = Column(Integer, ForeignKey("shopping_cart.shopping_cart_id"), primary_key=True)
    product_item_id = Column(Integer, ForeignKey("product_item.product_item_id"), primary_key=True)
    qty = Column(Integer, nullable=False)

    shopping_cart = relationship("ShoppingCart", back_populates="items")
    product_item = relationship("ProductItem")


# 3. Order-related Tables
class OrderStatus(Base):
    __tablename__ = "order_status"
    order_status_id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), nullable=False)

    orders = relationship("ShopOrder", back_populates="order_status")


class ShopOrder(Base):
    __tablename__ = "shop_order"
    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    order_date = Column(Date, nullable=False)
    order_total = Column(DECIMAL(10, 2))
    payment_method_id = Column(Integer, ForeignKey("user_payment_method.payment_method_id"), nullable=False)
    shipping_method_id = Column(Integer, ForeignKey("shopping_method.shopping_method_id"), nullable=False)
    order_status_id = Column(Integer, ForeignKey("order_status.order_status_id"))

    user = relationship("User", back_populates="orders")
    user_payment_method = relationship("UserPaymentMethod", back_populates="shop_order")
    shipping_method = relationship("ShoppingMethod")
    order_status = relationship("OrderStatus", back_populates="orders")
    order_lines = relationship("OrderLine", back_populates="shop_order")


class OrderLine(Base):
    __tablename__ = "order_line"
    ordered_product_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("shop_order.order_id"))
    product_item_id = Column(Integer, ForeignKey("product_item.product_item_id"))
    qty = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    shop_order = relationship("ShopOrder", back_populates="order_lines")
    product_item = relationship("ProductItem")
    reviews = relationship("UserReview", back_populates="oder_line")


# 4. Payment and Shipping Tables
class PaymentType(Base):
    __tablename__ = "payment_type"
    payment_type_id = Column(Integer, primary_key=True, index=True)
    payment_name = Column(String(50), nullable=False)

    user_payment_method = relationship("UserPaymentMethod", back_populates="payment_type")


class ShoppingMethod(Base):
    __tablename__ = "shopping_method"
    shopping_method_id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    orders = relationship("ShopOrder", back_populates="shipping_method")