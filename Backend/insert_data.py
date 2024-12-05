import pandas as pd
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Product, UserPersonalInfo, ProductRating, SiteUser
from sqlalchemy.exc import IntegrityError
import os

# Path to your CSV files (adjust if necessary)
CSV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ModelApp", "Data")
product_csv_path = os.path.join(CSV_DIR, "product.csv")
user_data_csv_path = os.path.join(CSV_DIR, "new_user_data.csv")
rating_csv_path = os.path.join(CSV_DIR, "new_rating.csv")

# Function to insert data from CSV files
def insert_data_from_csv():
    # Initialize session
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()

    # Read the CSV files
    try:
        product_df = pd.read_csv(product_csv_path)
        user_data_df = pd.read_csv(user_data_csv_path)
        rating_df = pd.read_csv(rating_csv_path)
        
        print(f"Loaded {len(product_df)} products")
        print(f"Loaded {len(user_data_df)} user data records")
        print(f"Loaded {len(rating_df)} ratings")
    except Exception as e:
        print(f"Error reading CSV files: {e}")
        return

    # Insert Product Data
    for index, row in product_df.iterrows():
        product_name = row['name'][:200]  #  product name to 100 characters
        
        # Step 2b: Check if image or image link exceed 255 characters and ignore them
        product_image = row['image'][:255] if len(row['image']) <= 255 else None
        product_link = row['link'][:255] if len(row['link']) <= 255 else None

        try:
            print(f"Inserting product: {row['name']}")
            new_product = Product(
                product_id=row['id'],
                product_name=row['name'],
                main_category=row['main_category'],
                main_category_encoded=row['main_category_encoded'],
                sub_category=row['sub_category'],
                sub_category_encoded=row['sub_category_encoded'],
                product_image=row['image'] if len(row['image']) <= 255 else None,
                product_link=row['link'] if len(row['link']) <= 255 else None,
                average_rating=row['ratings'],
                no_of_ratings=row['no_of_ratings'],
                discount_price_usd=row['discount_price_usd'],
                actual_price_usd=row['actual_price_usd'],
                category_id=None  # You can modify this to link to a valid category
            )
            session.add(new_product)

            if index % 100 == 0:  # Commit every 100 records to optimize performance
                print("Committing session...")
                session.commit()

        except IntegrityError as e:
            session.rollback()  # If the record already exists, rollback and continue
            print(f"Error inserting product: {row['name']} - {e}")

    # Commit any remaining products
    session.commit()

    # Insert User Personal Info Data
    for index, row in user_data_df.iterrows():
        try:
            user = session.query(SiteUser).filter(SiteUser.user_id == row['user_id']).first()
            if user:
                print(f"Inserting user personal info for user_id: {row['user_id']}")
                new_user_info = UserPersonalInfo(
                    age=row['age'],
                    gender=row['gender'],
                    city=row['city'],
                    user_id=row['user_id']
                )
                session.add(new_user_info)

            if index % 100 == 0:  # Commit every 100 records
                print("Committing session...")
                session.commit()

        except IntegrityError as e:
            session.rollback()
            print(f"Error inserting user personal info for user_id: {row['user_id']} - {e}")

    # Commit any remaining user personal info
    session.commit()

    # Insert Product Rating Data
    for index, row in rating_df.iterrows():
        try:
            user = session.query(SiteUser).filter(SiteUser.user_id == row['user_id']).first()
            product = session.query(Product).filter(Product.product_id == row['productid']).first()

            if user and product:
                print(f"Inserting rating for user_id: {row['user_id']} and product_id: {row['productid']}")
                new_rating = ProductRating(
                    user_id=row['user_id'],
                    product_id=row['productid'],
                    rating=row['rating']
                )
                session.add(new_rating)

            if index % 100 == 0:  # Commit every 100 records
                print("Committing session...")
                session.commit()

        except IntegrityError as e:
            session.rollback()
            print(f"Error inserting rating for user_id: {row['user_id']} and product_id: {row['productid']} - {e}")

    # Commit any remaining ratings
    session.commit()

    # Close the session
    session.close()

    print("Data insertion complete.")

# Function to run automatically on app startup
from fastapi import FastAPI

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print("Running data insertion task on startup...")
    insert_data_from_csv()