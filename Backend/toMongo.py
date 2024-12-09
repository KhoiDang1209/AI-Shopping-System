from pymongo.mongo_client import MongoClient
from pymongo import DESCENDING
MONGODB_URI = "mongodb+srv://khoibk123123:khoibk123@recommenddtb.4in6a.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI)
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"An error occurred: {e}")
db = client["Recommend"]
user_collection = db["User"]
class newUser:
    def __init__(self, user_collection):
        self.user_collection = user_collection

    def get_max_user_id(self):
        try:
            pipeline = [
                {"$addFields": {"user_id_int": {"$toInt": "$user_id"}}},
                {"$sort": {"user_id_int": DESCENDING}},
                {"$limit": 1}
            ]
            result = list(self.user_collection.aggregate(pipeline))
            if result:
                return result[0]["user_id_int"]
            else:
                return 0
        except Exception as e:
            print(f"An error occurred while getting max user_id: {e}")
            return 0
    def insert_new_user(self, user_data):
        try:
            max_user_id = self.get_max_user_id()
            next_user_id = max_user_id + 1
            user_data["user_id"] = str(next_user_id)
            result = self.user_collection.insert_one(user_data)
            return f"User inserted with ID: {result.inserted_id} and user_id: {next_user_id}"
        except Exception as e:
            return f"An error occurred: {e}"
new_user=newUser(user_collection)
def insert_new_user_to_mongo(user_data):
    new_user.insert_new_user(user_data)