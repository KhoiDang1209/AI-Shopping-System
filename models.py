from sqlalchemy import (Column, Integer, String, ForeignKey, Boolean, Text, Date, DECIMAL)
from sqlalchemy.orm import relationship
from database import Base

# Location Tables
class Country(Base):
    __tablename__ = "country"
    country_id = Column(Integer, primary_key=True)
    country_name = Column(String(100), nullable=False)
    
    addresses = relationship("Address", back_populates="country")
    
class Address(Base):
    __tablename__ = "address"
    address_id = Column(Integer, primary_key=True)
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
    user_id = Column(Integer, primary_key=True)
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
    payment_method_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    payment_type_id = Column(Integer, ForeignKey("payment_type.payment_type_id"))
    provider = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False)
    expiry_date = Column(Date, nullable=False)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="user_payment_method")
    shop_order = relationship("ShopOrder", back_populates="payment_method")
    payment_type = relationship("PaymentType")


class UserReview(Base):
    __tablename__ = "user_review"
    user_review_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    ordered_product_id = Column(Integer, ForeignKey("order_line.ordered_product_id"))
    rating_value = Column(DECIMAL(2, 1), nullable=False)
    comment = Column(Text)

    user = relationship("User", back_populates="reviews")
    order_line = relationship("OrderLine")


# 2. Product-related Tables
class Product(Base):
    __tablename__ = "product"
    product_id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("product_category.category_id"))
    product_name = Column(String(100), nullable=False)
    description = Column(Text)
    product_image = Column(String(255))

    category = relationship("ProductCategory", back_populates="products")
    items = relationship("ProductItem", back_populates="product")


class ProductCategory(Base):
    __tablename__ = "product_category"
    category_id = Column(Integer, primary_key=True)
    parent_category_id = Column(Integer, ForeignKey("product_category.category_id"))
    category_name = Column(String(100), nullable=False)

    parent_category = relationship("ProductCategory", remote_side=[category_id])
    products = relationship("Product", back_populates="category")
    

class ProductItem(Base):
    __tablename__ = "product_item"
    product_item_id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("product.product_id"))
    price = Column(DECIMAL(10, 2), nullable=False)
    SKU = Column(String(50), nullable=False)
    is_in_stock = Column(Boolean, default=True)
    product_image = Column(String(255))

    product = relationship("Product", back_populates="items")
    configurations = relationship("ProductConfiguration", back_populates="product_item")
    

class ProductConfiguration(Base):
    __tablename__ = 'product_configuration'
    product_item_id = Column(Integer, ForeignKey('product_item.product_item_id'), primary_key=True)
    variation_option_id = Column(Integer, ForeignKey('variation_option.variation_option_id'), primary_key=True)

    variation_option = relationship('VariationOption', back_populates='product_configurations')
    product_item = relationship('ProductItem', back_populates='configurations')


# 2.1. Variation Tables
class Variation(Base):
    __tablename__ = 'variation'
    variation_id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey('product_category.category_id'))
    name = Column(String(100))
    size = Column(String(50))
    color = Column(String(50))

    category = relationship('ProductCategory', back_populates='variations')


class VariationOption(Base):
    __tablename__ = 'variation_option'
    variation_option_id = Column(Integer, primary_key=True)
    variation_id = Column(Integer, ForeignKey('variation.variation_id'))
    value = Column(String)

    variation = relationship('Variation', back_populates='options')


# 2.2. Promotion Tables
class Promotion(Base):
    __tablename__ = 'promotion'
    promotion_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(Text)
    discount_rate = Column(DECIMAL(5, 2))
    start_date = Column(Date)
    end_date = Column(Date)
    

class PromotionCategory(Base):
    __tablename__ = 'promotion_category'
    category_id = Column(Integer, ForeignKey('product_category.category_id'), primary_key=True)
    promotion_id = Column(Integer, ForeignKey('promotion.promotion_id'), primary_key=True)

    category = relationship('ProductCategory', back_populates='promotions')
    promotion = relationship('Promotion', back_populates='categories')


# 3. Shopping Cart-related Table
class ShoppingCart(Base):
    __tablename__ = "shopping_cart"
    shopping_cart_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))

    user = relationship("User", back_populates="shopping_carts")
    items = relationship("ShoppingCartItem", back_populates="shopping_cart")
    
    
class ShoppingCartItem(Base):
    __tablename__ = "shopping_cart_item"
    shopping_cart_id = Column(Integer, ForeignKey("shopping_cart.shopping_cart_id"), primary_key=True)
    product_item_id = Column(Integer, ForeignKey("product_item.product_item_id"), primary_key=True)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    shopping_cart = relationship("ShoppingCart", back_populates="items")
    product_item = relationship("ProductItem")


# 3. Order-related Tables
class OrderStatus(Base):
    __tablename__ = "order_status"
    order_status_id = Column(Integer, primary_key=True)
    status = Column(String(50), nullable=False)

    orders = relationship("ShopOrder", back_populates="order_status")


class ShopOrder(Base):
    __tablename__ = "shop_order"
    order_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    order_date = Column(Date, nullable=False)
    order_total = Column(DECIMAL(10, 2))
    payment_method_id = Column(Integer, ForeignKey("user_payment_method.payment_method_id"))  # Correct foreign key
    shipping_method_id = Column(Integer, ForeignKey("shipping_method.shipping_method_id"))
    order_status_id = Column(Integer, ForeignKey("order_status.order_status_id"))

    user = relationship("User", back_populates="orders")
    payment_method = relationship("UserPaymentMethod", back_populates="shop_order")
    shipping_method = relationship("ShippingMethod")
    order_status = relationship("OrderStatus")

class OrderLine(Base):
    __tablename__ = "order_line"
    ordered_product_id = Column(Integer, primary_key=True)
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
    payment_type_id = Column(Integer, primary_key=True)
    payment_name = Column(String(50), nullable=False)

    user_payment_method = relationship("UserPaymentMethod", back_populates="payment_type")


class ShippingMethod(Base):
    __tablename__ = "shipping_method"
    shipping_method_id = Column(Integer, primary_key=True)
    type = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    orders = relationship("ShopOrder", back_populates="shipping_method")