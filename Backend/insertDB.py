from passlib.context import CryptContext
import random
from decimal import Decimal
from database import SessionLocal
from models import Country, SiteUser, ProductCategory, Product, ProductItem
# List of 195 countries in alphabetical order
countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", 
    "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
    "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", 
    "Congo (Democratic Republic)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", 
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", 
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", 
    "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", 
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", 
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
    "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
    "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", 
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", 
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]
# List of sample categories
categories = [
    "Electronics", "Home Appliances", "Books", "Fashion", "Toys", "Sports Equipment",
    "Groceries", "Beauty Products", "Furniture", "Automotive"
]

# List of sample products with their descriptions and images (fake URLs for demonstration)
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
# Insert countries into the database
def insert_countries():
    # Create a session
    session = SessionLocal()
    
    # Insert each country
    try:
        for index, country_name in enumerate(countries, start=1):
            country = Country(country_id=index, country_name=country_name)
            session.add(country)
        
        # Commit the transaction
        session.commit()
        print("Countries inserted successfully.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()
# Insert admin user, categories, products, and product items
def insert_data():
    session = SessionLocal()
    
    try:
        # Insert admin user
        passwordHash = hash_password("adminpassword123")
        admin_user = SiteUser(
            user_name="admin",
            email_address="admin@example.com",
            phone_number="1234567890",
            password=passwordHash  # Ideally hashed
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
                description=product["description"],
                product_image=product["image"],
                category_id=random_category.category_id
            )
            session.add(new_product)
            session.commit()  # Commit product to get its ID

            # Insert a product item for this product
            product_item = ProductItem(
                product_id=new_product.product_id,
                price=Decimal(random.uniform(10, 1000)).quantize(Decimal("0.01")),  # Random price between 10 and 1000
                SKU=f"SKU-{random.randint(1000, 9999)}",
                is_in_stock=True,
                product_image=new_product.product_image
            )
            session.add(product_item)

        # Commit all inserts
        session.commit()
        print("Admin user, categories, products, and product items inserted successfully.")

    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

# Call the function to insert data
insert_data() #auto trigger when import
# Call the function to insert countries
insert_countries()
