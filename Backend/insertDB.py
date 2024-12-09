from passlib.context import CryptContext
import random
from decimal import Decimal
from database import SessionLocal
from models import SiteUser, ProductCategory, Product, ProductItem

# Sample categories
categories = [
    "Electronics", "Home Appliances", "Books", "Fashion", "Toys", "Sports Equipment",
    "Groceries", "Beauty Products", "Furniture", "Automotive"
]

# Sample products with their descriptions and images
products = [
    {"name": "Smartphone", "description": "High-end smartphone with 128GB storage.", "image": "smartphone.jpg"},
    {"name": "Laptop", "description": "Lightweight laptop with a 13-inch display.", "image": "laptop.jpg"},
    {"name": "Air Conditioner", "description": "Energy-efficient air conditioner.", "image": "air_conditioner.jpg"},
    {"name": "Sneakers", "description": "Comfortable and stylish sneakers.", "image": "sneakers.jpg"},
    {"name": "Electric Kettle", "description": "1.5-liter electric kettle.", "image": "kettle.jpg"},
]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def insert_data():
    session = SessionLocal()  # Assuming SessionLocal is already defined

    try:
        # Insert admin user
        password_hash = hash_password("adminpassword123")
        admin_user = SiteUser(
            user_name="admin",
            email_address="admin@example.com",
            phone_number="1234567890",
            password=password_hash
        )
        session.add(admin_user)

        # Insert categories
        category_objects = []
        for category_name in categories:
            category = ProductCategory(category_name=category_name)
            session.add(category)
            category_objects.append(category)

        session.commit()  # Commit categories to get their IDs

        # Insert products and product items
        for product in products:
            random_category = random.choice(category_objects)  # Assign a random category
            new_product = Product(
                product_name=product["name"],
                main_category=random_category.category_name,
                main_category_encoded=product["name"].lower().replace(" ", "_"),
                sub_category=random_category.category_name,  # You can adjust this as needed
                sub_category_encoded=product["name"].lower().replace(" ", "_"),
                product_image=product["image"],
                product_link=f"/products/{product['name'].lower().replace(' ', '_')}",
                average_rating=random.uniform(1, 5),  # Random rating between 1 and 5
                no_of_ratings=random.randint(1, 100),  # Random number of ratings
                discount_price_usd=Decimal(random.uniform(10, 500)).quantize(Decimal("0.01")),
                actual_price_usd=Decimal(random.uniform(10, 1000)).quantize(Decimal("0.01")),
                category_id=random_category.category_id
            )
            session.add(new_product)  # Add the product to session
            # Insert product item for this product
            product_item = ProductItem(
                product_id=new_product.product_id,  # Foreign key to Product
                SKU=f"SKU-{random.randint(1000, 9999)}",  # Random SKU
                price=Decimal(random.uniform(10, 1000)).quantize(Decimal("0.01")),
                is_in_stock=True,
                product_image=new_product.product_image
            )
            session.add(product_item)  # Add product item to session
        # Check for newly added objects
        print("New objects in the session:", session.new)

        # Check for modified objects
        print("Modified objects in the session:", session.dirty)
        session.commit()  # Commit all the changes at once

        print("Admin user, categories, products, and product items inserted successfully.")

    except Exception as e:
        session.rollback()  # Rollback on error
        print(f"An error occurred: {e}")
    finally:
        session.close()

# Call the function to insert data
insert_data()
