import pandas as pd
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo.mongo_client import MongoClient
MONGODB_URI = "mongodb+srv://khoibk123123:khoibk123@recommenddtb.4in6a.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGODB_URI)

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"An error occurred: {e}")

db = client["Recommend"]

user_collection = db["User"]
rating_collection = db["Rating"]
product_collection = db["Product"]
association_collection = db["Association"]
interest_collection = db["Interest"]
user_df = pd.DataFrame(list(user_collection.find()))
rating_df = pd.DataFrame(list(rating_collection.find()))
product_df = pd.DataFrame(list(product_collection.find()))
association_df = pd.DataFrame(list(association_collection.find()))
interest_df=pd.DataFrame(list(interest_collection.find()))
if '_id' in user_df.columns:
    user_df.drop(columns=['_id'], inplace=True)

if '_id' in rating_df.columns:
    rating_df.drop(columns=['_id'], inplace=True)

if '_id' in product_df.columns:
    product_df.drop(columns=['_id'], inplace=True)

if '_id' in association_df.columns:
    association_df.drop(columns=['_id'], inplace=True)

class SearchRecommendation:
    def __init__(self, product):
        self.product = product
        self.product['processed_name'] = self.product['name'].str.lower()
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.product['processed_name'])

    def search(self, query, top_n=40):
        query_vector = self.vectorizer.transform([query.lower()])
        cosine_similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        results_df = pd.DataFrame({
            'id': self.product['id'].astype(str),
            'name': self.product['name'],
            'cosine_similarity': cosine_similarities
        })
        results_df = results_df.sort_values(by='cosine_similarity', ascending=False)
        return results_df['id'].head(top_n).tolist()

search_model = SearchRecommendation(product_df)

class RecommendTrendModel:
    def __init__(self, user_data, ratings_data, product_data):
        self.user_data = user_data
        self.ratings_data = ratings_data
        self.product_data = product_data

    @staticmethod
    def calculate_similarity(user1, user2):
        gender_sim = 1 if user1['gender'] == user2['gender'] else 0
        age_sim = 1 - abs(user1['age'] - user2['age']) / 100
        if user1['city'] == user2['city']:
            location_sim = 1
        else:
            location_sim = 0.5
        total_similarity = 0.2 * gender_sim + 0.6 * age_sim + 0.2 * location_sim
        return total_similarity

    def find_top_similar_users(self, user_info):
        similarities = []
        for _, other_user in self.user_data.iterrows():
            similarity = self.calculate_similarity(user_info, other_user)
            similarities.append((other_user['user_id'], similarity))
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [user_list[0] for user_list in similarities[:20]]

    def collaborative_filtering_recommendations(self, user_info, top_n=20):
        top_similar_users = self.find_top_similar_users(user_info)
        filtered_ratings_data = self.ratings_data[self.ratings_data['user_id'].isin(top_similar_users)]
        user_item_matrix = filtered_ratings_data.pivot_table(
            index='user_id',
            columns='productid',
            values='rating',
            aggfunc='mean'
        ).fillna(0)
        user_similarity = cosine_similarity(user_item_matrix)
        recommended_items = set()
        for target_user_id in top_similar_users:
            try:
                target_user_index = user_item_matrix.index.get_loc(target_user_id)
            except KeyError:
                continue
            user_similarities = user_similarity[target_user_index]
            similar_users_indices = user_similarities.argsort()[::-1][1:]
            for user_index in similar_users_indices:
                rated_by_similar_user = user_item_matrix.iloc[user_index]
                not_rated_by_target_user = (rated_by_similar_user > 0) & (user_item_matrix.iloc[target_user_index] == 0)
                recommended_items.update(user_item_matrix.columns[not_rated_by_target_user][:top_n])
                if len(recommended_items) >= top_n:
                    break
        recommended_items_details = self.ratings_data[
            self.ratings_data['productid'].isin(recommended_items)
        ][['productid', 'rating']].drop_duplicates()
        recommended_items_with_names = recommended_items_details.merge(
        self.product_data[['id', 'name']],
        left_on='productid',
        right_on='id',
        how='inner')
        top_recommendations = recommended_items_with_names.sort_values(by='rating', ascending=False ).head(top_n)
        return top_recommendations['productid'].tolist()

    def most_trending_products(self, top_n=20):
        trending_products = self.product_data.sort_values(
            by=['ratings', 'no_of_ratings'], ascending=False
        ).head(top_n)
        return trending_products['id'].tolist()

    def recommend(self, user_info, top_n=20):
        collaborative_recommendations = self.collaborative_filtering_recommendations(user_info, top_n=top_n)
        trending_recommendations = self.most_trending_products(top_n=top_n)
        recommendations = collaborative_recommendations + trending_recommendations
        return recommendations

trend_recommendation_model=RecommendTrendModel(user_df,rating_df,product_df)


class InterestRecommendationModel:
    def __init__(self, user_data, ratings_data, product_data):
        # Store the datasets in attributes
        self.user_data = user_data
        self.ratings_data = ratings_data
        self.product_data = product_data

    @staticmethod
    def calculate_similarity(user1, user2):
        gender_sim = 1 if user1['gender'] == user2['gender'] else 0
        age_sim = 1 - abs(user1['age'] - user2['age']) / 100
        if user1['city'] == user2['city']:
            location_sim = 1
        else:
            location_sim = 0.5
        total_similarity = 0.2 * gender_sim + 0.6 * age_sim + 0.2 * location_sim
        return total_similarity

    def find_top_similar_users(self, user_info):
        similarities = []
        for i, other_user in self.user_data.iterrows():
            similarity = self.calculate_similarity(user_info, other_user)
            similarities.append((other_user['user_id'], similarity))
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [user_list[0] for user_list in similarities[:20]]

    def collaborative_filtering_recommendations(self, user_info, top_n=20):
        top_similar_users = self.find_top_similar_users(user_info)
        filtered_ratings_data = self.ratings_data[self.ratings_data['user_id'].isin(top_similar_users)]
        user_item_matrix = filtered_ratings_data.pivot_table(
            index='user_id',
            columns='productid',
            values='rating',
            aggfunc='mean'
        ).fillna(0)
        user_similarity = cosine_similarity(user_item_matrix)
        recommended_items = set()
        for target_user_id in top_similar_users:
            try:
                target_user_index = user_item_matrix.index.get_loc(target_user_id)
            except KeyError:
                continue
            user_similarities = user_similarity[target_user_index]
            similar_users_indices = user_similarities.argsort()[::-1][1:]
            for user_index in similar_users_indices:
                rated_by_similar_user = user_item_matrix.iloc[user_index]
                not_rated_by_target_user = (rated_by_similar_user > 0) & (user_item_matrix.iloc[target_user_index] == 0)
                recommended_items.update(user_item_matrix.columns[not_rated_by_target_user][:top_n])
                if len(recommended_items) >= top_n:
                    break
        recommended_items_details = self.ratings_data[
            self.ratings_data['productid'].isin(recommended_items)
        ][['productid', 'rating']].drop_duplicates()
        recommended_items_with_names = recommended_items_details.merge(
        self.product_data[['id', 'name']],
        left_on='productid',
        right_on='id',
        how='inner')
        top_recommendations = recommended_items_with_names.sort_values(by='rating', ascending=False ).head(top_n)
        return top_recommendations['productid'].tolist()

    def highest_rated_products_by_interest(self, user_info, top_n=20):
        user_interest = list(map(int, user_info['interest']))
        filtered_products = self.product_data[self.product_data['main_category_encoded'].isin(user_interest)]
        top_products = filtered_products.sort_values(
            by=['ratings', 'no_of_ratings'], ascending=False
        ).head(top_n)
        return top_products['id'].tolist()

    def recommend(self, user_info, top_n=20):
        collaborative_recommendations = self.collaborative_filtering_recommendations(user_info, top_n=top_n)
        interest_based_recommendations = self.highest_rated_products_by_interest(user_info, top_n=top_n)
        recommendations = collaborative_recommendations+interest_based_recommendations
        return recommendations

interest_recommendation_model = InterestRecommendationModel(user_df,rating_df,product_df)

class AssociationRecommendationModel:
    def __init__(self, product, rules):
        self.product = product
        self.rules = rules

    def get_top_associated_categories(self, item_ids, n=3):
        top_associated_categories = set()

        for item_id in item_ids:
            item_info = self.product[self.product['id'] == item_id]
            if item_info.empty:
                print(f"Item with ID {item_id} not found in dataset.")
                continue

            item_category = f"{item_info.iloc[0]['main_category']} - {item_info.iloc[0]['sub_category']}"
            relevant_rules = self.rules[self.rules['antecedents'].apply(lambda x: item_category in x)]
            if relevant_rules.empty:
                continue

            relevant_rules = relevant_rules.sort_values(by='lift', ascending=False).head(n)
            for _, row in relevant_rules.iterrows():
                for category_set in [row['antecedents'], row['consequents']]:
                    if isinstance(category_set, str):
                        for category in category_set.split(", "):
                            if category != item_category:
                                top_associated_categories.add(category)
        top_categories_list = list(top_associated_categories)[:n]
        return top_categories_list


    def get_top_rated_items(self, associated_categories, top_n=5):
        top_items = []
        for category in associated_categories:
            try:
                main_category, sub_category = category.split(" - ")
            except ValueError:
                print(f"Invalid category format: {category}")
                continue
            category_items = self.product[
                (self.product['main_category'] == main_category) &
                (self.product['sub_category'] == sub_category)
            ]
            top_rated_items = category_items.sort_values(by='ratings', ascending=False).head(top_n)
            top_items.extend(top_rated_items['id'].tolist())
        return top_items

    def recommend(self, item_ids, associated_n=5, top_n=5):
        top_associated_categories = self.get_top_associated_categories(item_ids, n=associated_n)
        top_rated_items = self.get_top_rated_items(top_associated_categories, top_n=top_n)
        return top_rated_items

associate_model=AssociationRecommendationModel(product_df,association_df)

class ItemRecommendationModel:
    def __init__(self, product):
        self.product = product
        self.product['processed_name'] = self.product['name'].str.lower()

        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.product['processed_name'])

    def find_similar_items(self, item_id, top_n=20):
        if item_id not in self.product['id'].values:
            print(f"Item ID {item_id} not found in dataset.")
            return []

        item_index = self.product[self.product['id'] == item_id].index[0]
        item_vector = self.tfidf_matrix[item_index]
        cosine_similarities = cosine_similarity(item_vector, self.tfidf_matrix).flatten()
        similar_indices = cosine_similarities.argsort()[-top_n - 1:-1][::-1]
        similar_items = self.product.iloc[similar_indices]['id']  # Extract the 'id' column
        similar_items_list = similar_items.tolist()  # Convert the Series to a list
        return similar_items_list


item_recommendation_model = ItemRecommendationModel(product_df)

class CollabRecommendationModel:
    def __init__(self, user_data, product_data, ratings_data):
        self.user_data = user_data
        self.product_data = product_data
        self.ratings_data = ratings_data

    @staticmethod
    def calculate_similarity(user1, user2):
        gender_sim = 1 if user1['gender'] == user2['gender'] else 0
        age_sim = 1 - abs(user1['age'] - user2['age']) / 100
        if user1['city'] == user2['city']:
            location_sim = 1
        else:
            location_sim = 0.5
        total_similarity = 0.2 * gender_sim + 0.6 * age_sim + 0.2 * location_sim
        return total_similarity

    def find_top_similar_users(self, user_info):
        similarities = []
        for _, other_user in self.user_data.iterrows():
            similarity = self.calculate_similarity(user_info, other_user)
            similarities.append((other_user['user_id'], similarity))
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [user[0] for user in similarities[:50]]

    def collaborative_filtering_recommendations(self, user_id, user_info, top_n=40):
        top50_similar_users = self.find_top_similar_users(user_info)
        filtered_ratings_data = self.ratings_data[self.ratings_data['user_id'].isin(top50_similar_users)]
        user_item_matrix = filtered_ratings_data.pivot_table(
            index='user_id',
            columns='productid',
            values='rating',
            aggfunc='mean'
        ).fillna(0)

        user_similarity = cosine_similarity(user_item_matrix)
        recommended_items = set()
        for target_user_id in top50_similar_users:
            try:
                target_user_index = user_item_matrix.index.get_loc(target_user_id)
            except KeyError:
                continue

            user_similarities = user_similarity[target_user_index]
            similar_users_indices = user_similarities.argsort()[::-1][1:]

            for user_index in similar_users_indices:
                rated_by_similar_user = user_item_matrix.iloc[user_index]
                not_rated_by_target_user = (rated_by_similar_user > 0) & (user_item_matrix.iloc[target_user_index] == 0)
                recommended_items.update(user_item_matrix.columns[not_rated_by_target_user][:top_n])
                if len(recommended_items) >= top_n:
                    break
        recommended_items_details = self.ratings_data[
            self.ratings_data['productid'].isin(recommended_items)
        ][['productid', 'rating']].drop_duplicates()
        recommended_items_with_names = recommended_items_details.merge(
            self.product_data[['id', 'name']],
            left_on='productid',
            right_on='id',
            how='inner'
        )
        top_recommendations = recommended_items_with_names.sort_values(
            by='rating', ascending=False
        ).head(top_n)

        return top_recommendations['productid'].tolist()

    def recommend(self, user_id, user_info, top_n=40):
        return self.collaborative_filtering_recommendations(user_id, user_info, top_n=top_n)

collaborative_recommendation_model = CollabRecommendationModel(user_df,product_df,rating_df)


def get_search_recommendations(query:str):
    search_result = search_model.search(query)
    return search_result
def get_trend_recommendations(user_id:str):
    user_id = str(user_id)
    user_record = user_collection.find_one({"user_id": user_id})
    if not user_record:
        return {"error": "User or interest information not found for the given userID"}
    user_info = {
        "age": user_record["age"],
        "gender": user_record["gender"],
        "city": user_record["city"],
    }
    trend_results = trend_recommendation_model.recommend(user_info)
    return trend_results
def get_interest_recommendations(user_id:str):
    user_id=str(user_id)
    user_record = user_collection.find_one({"user_id": user_id})
    interest_record = interest_collection.find_one({"user_id": user_id})
    if not user_record or not interest_record:
        return {"error": "User or interest information not found for the given userID"}
    user_info = {
        "age": user_record["age"],
        "gender": user_record["gender"],
        "city": user_record["city"],
        "interest": interest_record["interests"]
    }
    interest_results = interest_recommendation_model.recommend(user_info)
    return interest_results
def get_item_recommendation(item_id:str):
    item_result=item_recommendation_model.find_similar_items(item_id)
    return item_result
def get_association_recommendations(ids: list[str]):
    asso_results = associate_model.recommend(ids)
    return asso_results
def get_collaborative_recommendations(user_id:str):
    user_record=user_collection.find_one({"user_id": user_id})
    if not user_record:
        return {"error": "User or interest information not found for the given userID"}
    user_info = {
        "age": user_record["age"],
        "gender": user_record["gender"],
        "city": user_record["city"],
    }
    collab_results = collaborative_recommendation_model.recommend(user_id,user_info)
    return collab_results