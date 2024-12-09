from sqlalchemy import (Column, Integer, String, ForeignKey, Boolean, Text, Date, DECIMAL, UniqueConstraint, Float)
from sqlalchemy.orm import relationship
from database import Base

# Location Tables
    
class Address(Base):
    __tablename__ = "address"
    address_id = Column(Integer, primary_key=True)
    unit_number = Column(String(100))
    street_number = Column(String(40))
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    region = Column(String(100))
    postal_code = Column(String(20))

    user_addresses = relationship("UserAddress", back_populates="address")

# 1. User-related Tables
class SiteUser(Base):
    __tablename__ = "site_user"
    
    # User attributes
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String(100), nullable=True)
    age = Column(Integer)
    gender = Column(String(10))
    email_address = Column(String(100), unique=True, nullable=True)
    phone_number = Column(String(10), unique=True, nullable=True)
    city = Column(String(100))
    password = Column(String(255), nullable=True)
    

    # Other Relationships
    addresses = relationship("UserAddress", back_populates="user")
    user_payment_methods = relationship("UserPaymentMethod", back_populates="user")
    reviews = relationship("UserReview", back_populates="user")  
    ratings = relationship("ProductRating", back_populates="user")  # Back reference for user ratings
    shopping_carts = relationship("ShoppingCart", back_populates="user")
    orders = relationship("ShopOrder", back_populates="user")

class UserAddress(Base):
    __tablename__ = "user_address"
    user_id = Column(Integer, ForeignKey("site_user.user_id"), primary_key=True)
    address_id = Column(Integer, ForeignKey("address.address_id"), primary_key=True)
    is_default = Column(Boolean, default=False)

    user = relationship("SiteUser", back_populates="addresses")
    address = relationship("Address", back_populates="user_addresses")


class UserPaymentMethod(Base):
    __tablename__ = "user_payment_method"
    payment_method_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("site_user.user_id"))
    payment_type_id = Column(Integer, ForeignKey("payment_type.payment_type_id"))
    provider = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False)
    expiry_date = Column(Date, nullable=False)
    is_default = Column(Boolean, default=False)

    user = relationship("SiteUser", back_populates="user_payment_methods")
    shop_order = relationship("ShopOrder", back_populates="payment_method")
    payment_type = relationship("PaymentType", back_populates="user_payment_methods")


class UserReview(Base):
    __tablename__ = "user_review"
    user_review_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("site_user.user_id"))
    ordered_product_id = Column(Integer, ForeignKey("order_line.ordered_product_id"))
    rating_value = Column(DECIMAL(2, 1), nullable=False)
    comment = Column(Text)

    user = relationship("SiteUser", back_populates="reviews")
    order_line = relationship("OrderLine", back_populates="reviews")


# 2. Product-related Tables

class Product(Base):
    __tablename__ = "product"
    
    # Product attributes
    product_id = Column(String(100), primary_key=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    main_category = Column(String(255), nullable=False)
    main_category_encoded = Column(String(100), nullable=False)
    sub_category = Column(String(255), nullable=False)
    sub_category_encoded = Column(String(100), nullable=False)
    product_image = Column(String(255), nullable=True)
    product_link = Column(String(255), nullable=True)
    average_rating = Column(Float, default=0.0)  # Renamed from 'ratings'
    no_of_ratings = Column(Integer, default=0)
    discount_price_usd = Column(DECIMAL(10, 2), nullable=True)
    actual_price_usd = Column(DECIMAL(10, 2), nullable=True)

    # Relationships
    category_id = Column(Integer, ForeignKey("product_category.category_id"))
    category = relationship("ProductCategory", back_populates="products")
    items = relationship("ProductItem", back_populates="product")
    ratings = relationship("ProductRating", back_populates="product")  # This should store related ProductRatings
    shopping_cart_item = relationship("ShoppingCartItem", back_populates="product")

class ProductRating(Base):
    __tablename__ = "product_rating"
    
    # Rating attributes
    rating_id = Column(Integer, primary_key=True)  # Unique ID for each rating
    user_id = Column(Integer, ForeignKey("site_user.user_id"), nullable=False)  # Reference to the SiteUser table
    product_id = Column(String(100), ForeignKey('product.product_id'), nullable=False)  # Reference to the Product table
    rating = Column(Float, nullable=False)  # Rating value (e.g., between 1 and 5)

    # Relationships
    user = relationship("SiteUser", back_populates="ratings")  # User who rated the product
    product = relationship("Product", back_populates="ratings")  # Product being rated

class ProductCategory(Base):
    __tablename__ = "product_category"
    
    # Category attributes
    category_id = Column(Integer, primary_key=True)
    parent_category_id = Column(Integer, ForeignKey("product_category.category_id"))
    category_name = Column(String(100), nullable=False)

    # Relationships
    parent_category = relationship("ProductCategory", remote_side=[category_id])
    products = relationship("Product", back_populates="category")
    variations = relationship("Variation", back_populates="category")
    promotion_categories = relationship("PromotionCategory", back_populates="product_categories")


class ProductItem(Base):
    __tablename__ = "product_item"

    # Product Item attributes
    product_item_id = Column(String(100), primary_key=True)
    product_id = Column(String(100), ForeignKey("product.product_id"))
    SKU = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    is_in_stock = Column(Boolean, default=True)
    product_image = Column(String(255), nullable=False)

    # Relationships
    product = relationship("Product", back_populates="items")
    configurations = relationship("ProductConfiguration", back_populates="product_item")
    order_line = relationship("OrderLine", back_populates="product_item")

    

class ProductConfiguration(Base):
    __tablename__ = "product_configuration"
    product_item_id = Column(String, ForeignKey("product_item.product_item_id"), primary_key=True)
    variation_option_id = Column(Integer, ForeignKey("variation_option.variation_option_id"), primary_key=True)

    variation_option = relationship("VariationOption", back_populates="product_configurations")
    product_item = relationship("ProductItem", back_populates="configurations")


# 2.1. Variation Tables
class Variation(Base):
    __tablename__ = "variation"
    variation_id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("product_category.category_id"))
    name = Column(String(100))
    size = Column(String(50))
    color = Column(String(50))

    category = relationship("ProductCategory", back_populates="variations")
    options = relationship("VariationOption", back_populates="variation")


class VariationOption(Base):
    __tablename__ = "variation_option"
    variation_option_id = Column(Integer, primary_key=True)
    variation_id = Column(Integer, ForeignKey("variation.variation_id"))
    value = Column(String)

    variation = relationship("Variation", back_populates="options")
    product_configurations = relationship("ProductConfiguration", back_populates="variation_option")


# 2.2. Promotion Tables
class Promotion(Base):
    __tablename__ = "promotion"
    promotion_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(Text)
    discount_rate = Column(DECIMAL(5, 2))
    start_date = Column(Date)
    end_date = Column(Date)
    
    promotion_categories = relationship("PromotionCategory", back_populates="promotion")
    

class PromotionCategory(Base):
    __tablename__ = "promotion_category"
    category_id = Column(Integer, ForeignKey("product_category.category_id"), primary_key=True)
    promotion_id = Column(Integer, ForeignKey("promotion.promotion_id"), primary_key=True)

    product_categories = relationship("ProductCategory", back_populates="promotion_categories")
    promotion = relationship("Promotion", back_populates="promotion_categories")


# 3. Shopping Cart-related Table
class ShoppingCart(Base):
    __tablename__ = "shopping_cart"
    shopping_cart_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("site_user.user_id"))

    user = relationship("SiteUser", back_populates="shopping_carts")
    items = relationship("ShoppingCartItem", back_populates="shopping_cart")
    
    
class ShoppingCartItem(Base):
    __tablename__ = "shopping_cart_item"
    shopping_cart_id = Column(Integer, ForeignKey("shopping_cart.shopping_cart_id"), primary_key=True)
    product_id = Column(String(100), ForeignKey("product.product_id"), primary_key=True)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    shopping_cart = relationship("ShoppingCart", back_populates="items")
    product = relationship("Product",back_populates="shopping_cart_item")


# 3. Order-related Tables
class OrderStatus(Base):
    __tablename__ = "order_status"
    order_status_id = Column(Integer, primary_key=True)
    status = Column(String(50), nullable=False)

    orders = relationship("ShopOrder", back_populates="order_status")


class ShopOrder(Base):
    __tablename__ = "shop_order"
    order_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("site_user.user_id"))
    order_date = Column(Date, nullable=False)
    order_total = Column(DECIMAL(10, 2))
    payment_method_id = Column(Integer, ForeignKey("user_payment_method.payment_method_id"))  # Correct foreign key
    shipping_method_id = Column(Integer, ForeignKey("shipping_method.shipping_method_id"))
    order_status_id = Column(Integer, ForeignKey("order_status.order_status_id"))

    user = relationship("SiteUser", back_populates="orders")
    payment_method = relationship("UserPaymentMethod", back_populates="shop_order")
    shipping_method = relationship("ShippingMethod")
    order_status = relationship("OrderStatus")
    order_lines = relationship("OrderLine", back_populates="shop_order")

class OrderLine(Base):
    __tablename__ = "order_line"
    ordered_product_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("shop_order.order_id"))
    product_item_id = Column(String, ForeignKey("product_item.product_item_id"))
    qty = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    shop_order = relationship("ShopOrder", back_populates="order_lines")
    product_item = relationship("ProductItem", back_populates="order_line")
    reviews = relationship("UserReview", back_populates="order_line")


# 4. Payment and Shipping Tables
class PaymentType(Base):
    __tablename__ = "payment_type"
    payment_type_id = Column(Integer, primary_key=True)
    payment_name = Column(String(50), nullable=False)

    user_payment_methods = relationship("UserPaymentMethod", back_populates="payment_type")


class ShippingMethod(Base):
    __tablename__ = "shipping_method"
    shipping_method_id = Column(Integer, primary_key=True)
    type = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    orders = relationship("ShopOrder", back_populates="shipping_method")

class InterestingCategory(Base):
    __tablename__ = "interesting_category"

    interesting_category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("product_category.category_id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("site_user.user_id", ondelete="CASCADE"))

    # Define the relationship with ProductCategory and SiteUser
    category = relationship("ProductCategory", backref="interesting_categories")
    user = relationship("SiteUser", backref="interesting_categories")

    # Unique constraint to prevent duplicate category-user entries
    __table_args__ = (
        UniqueConstraint('category_id', 'user_id', name='unique_user_category'),
    )

    def __init__(self, category_id, user_id):
        self.category_id = category_id
        self.user_id = user_id
