import pandas as pd
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Product, ProductRating, SiteUser
from sqlalchemy.exc import IntegrityError
import os

# Path to your CSV files (adjust if necessary)
CSV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ModelApp", "Data")
product_csv_path = os.path.join(CSV_DIR, "new_product.csv")
user_data_csv_path = os.path.join(CSV_DIR, "new_user_data.csv")
product_rating_csv_path = os.path.join(CSV_DIR, "new_ratings.csv")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def insert_product_data():
    product_df = pd.read_csv(product_csv_path)

    session = SessionLocal()
    
   # Insert Product Data
    for index, row in product_df.iterrows():
        try:
            print(f"Inserting product: {row['name']}")
            new_product = Product(
                product_id=row['id'],
                product_name=row['name'][:200],
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
    session.close()
    
def insert_user_data():
    user_data_df = pd.read_csv(user_data_csv_path)
    
    session = SessionLocal()
    
    for index, row in user_data_df.iterrows():
        try:
            new_user = SiteUser(
                # user_name=row['user_name'],
                age=row['age'],
                gender=row['gender'],
                # email_address=row['email'],
                # phone_number=row['phone'],
                city=row['city'],
                # password=row['password']
            )
            session.add(new_user)
            
            if index % 100 == 0:  # Commit every 100 records
                print("Committing session...")
                session.commit()
            
        except IntegrityError as e:
            session.rollback()
            
    session.commit()
    session.close()
    
def insert_product_rating_data():
    product_rating_df = pd.read_csv(product_rating_csv_path)
    
    session = SessionLocal()
    
    # Insert Product Rating Data
    for index, row in product_rating_df.iterrows():
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
    session.close()
