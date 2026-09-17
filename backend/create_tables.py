from database import engine, Base
from models import Project

Base.metadata.create_all(bind=engine)

print("PROJECT TABLE CREATED SUCCESSFULLY!")