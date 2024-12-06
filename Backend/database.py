from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


#URL_DATABASE = 'postgresql://postgres:bin04102004@localhost:5432/AI_Shopping_System_Test'
URL_DATABASE = 'postgresql://postgres:postgres@localhost:5432/AI-shoppingDB'

#URL_DATABASE = 'postgresql://postgres:123456@localhost:5433/AI-shoppingDB'
engine = create_engine(URL_DATABASE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()