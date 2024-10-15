import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

import os
from scipy.sparse import coo_matrix

import spacy
from spacy.lang.en.stop_words import STOP_WORDS

# Ensure inline plots are displayed in Jupyter notebooks
# %matplotlib inline  # Uncomment if using Jupyter

# -------------------------------
# 1. Data Loading and Initial Exploration
# -------------------------------

# Define the file path
data_file = 'marketing_sample_for_walmart_com-walmart_com_product_review__20200701_20201231__5k_data.tsv'

# Check if the file exists
if not os.path.exists(data_file):
    raise FileNotFoundError(f"The file '{data_file}' was not found in the directory '{os.getcwd()}'.")

# Load the dataset
train_data = pd.read_csv(data_file, sep='\t')

# Display the first few columns to verify
print("Columns in the dataset:")
print(train_data.columns.tolist())

# Select relevant columns
train_data = train_data[['Uniq Id', 'Product Id', 'Product Rating', 'Product Reviews Count',
                         'Product Category', 'Product Brand', 'Product Name', 'Product Image Url',
                         'Product Description', 'Product Tags']]

# Display first few rows
print("\nFirst 3 rows of the dataset:")
print(train_data.head(3))

# Check the 'Product Tags' column
print("\nSample 'Product Tags':")
print(train_data['Product Tags'].head())

# Display the shape of the DataFrame
print(f"\nDataset shape: {train_data.shape}")

# -------------------------------
# 2. Data Cleaning
# -------------------------------

# Check for missing values
print("\nMissing values before cleaning:")
print(train_data.isnull().sum())

# Fill missing values without using inplace=True
train_data['Product Rating'] = train_data['Product Rating'].fillna(0)
train_data['Product Reviews Count'] = train_data['Product Reviews Count'].fillna(0)
train_data['Product Category'] = train_data['Product Category'].fillna('')
train_data['Product Brand'] = train_data['Product Brand'].fillna('')
train_data['Product Description'] = train_data['Product Description'].fillna('')

# Verify no missing values remain
print("\nMissing values after cleaning:")
print(train_data.isnull().sum())

# Check for duplicate rows
duplicate_count = train_data.duplicated().sum()
print(f"\nNumber of duplicate rows: {duplicate_count}")

# Optionally, remove duplicate rows if any
if duplicate_count > 0:
    train_data = train_data.drop_duplicates()
    print(f"Duplicate rows removed. New shape: {train_data.shape}")

# -------------------------------
# 3. Renaming Columns for Convenience
# -------------------------------

# Define the mapping of current column names to shorter names
column_name_mapping = {
    'Uniq Id': 'ID',
    'Product Id': 'ProdID',
    'Product Rating': 'Rating',
    'Product Reviews Count': 'ReviewCount',
    'Product Category': 'Category',
    'Product Brand': 'Brand',
    'Product Name': 'Name',
    'Product Image Url': 'ImageURL',
    'Product Description': 'Description',
    'Product Tags': 'Tags'
}

# Rename the columns using the mapping
train_data.rename(columns=column_name_mapping, inplace=True)

# Extract numeric values from 'ID' and 'ProdID'
train_data['ID'] = train_data['ID'].astype(str).str.extract(r'(\d+)').astype(float)
train_data['ProdID'] = train_data['ProdID'].astype(str).str.extract(r'(\d+)').astype(float)

# Display updated columns
print("\nUpdated columns:")
print(train_data.columns.tolist())

# -------------------------------
# 4. Basic Statistics and Visualization
# -------------------------------

# Basic statistics
num_users = train_data['ID'].nunique()
num_items = train_data['ProdID'].nunique()
num_ratings = train_data['Rating'].nunique()
print(f"\nNumber of unique users: {num_users}")
print(f"Number of unique items: {num_items}")
print(f"Number of unique ratings: {num_ratings}")

# -------------------------------
# 5. Data Visualization
# -------------------------------

# Pivot the DataFrame for heatmap
# To create a meaningful heatmap, we need both users and ratings.
# However, with 1721 users and 36 ratings, the heatmap would be too large.
# Instead, consider aggregating data or visualizing a subset.

# Example: Heatmap of Rating Distribution
rating_distribution = train_data['Rating'].value_counts().sort_index()

plt.figure(figsize=(8, 6))
sns.heatmap(rating_distribution.to_frame(), annot=True, fmt='d', cmap='coolwarm', cbar=True)
plt.title('Heatmap of Rating Distribution')
plt.xlabel('Ratings')
plt.ylabel('Count')
plt.show()

# Distribution of interactions
plt.figure(figsize=(12, 5))

# Interactions per User
plt.subplot(1, 2, 1)
sns.histplot(train_data['ID'].value_counts(), bins=10, kde=False, color='blue', edgecolor='black')
plt.xlabel('Interactions per User')
plt.ylabel('Number of Users')
plt.title('Distribution of Interactions per User')

# Interactions per Item
plt.subplot(1, 2, 2)
sns.histplot(train_data['ProdID'].value_counts(), bins=10, kde=False, color='green', edgecolor='black')
plt.xlabel('Interactions per Item')
plt.ylabel('Number of Items')
plt.title('Distribution of Interactions per Item')

plt.tight_layout()
plt.show()

# Most popular items
popular_items = train_data['ProdID'].value_counts().head(5)
plt.figure(figsize=(8, 6))
sns.barplot(x=popular_items.index.astype(int), y=popular_items.values, palette='Reds')
plt.title("Top 5 Most Popular Items")
plt.xlabel('Product ID')
plt.ylabel('Number of Interactions')
plt.show()

# Most rated counts
rating_counts = train_data['Rating'].value_counts().sort_index()
plt.figure(figsize=(8, 6))
sns.barplot(x=rating_counts.index, y=rating_counts.values, palette='Blues')
plt.title("Distribution of Product Ratings")
plt.xlabel('Ratings')
plt.ylabel('Count')
plt.show()

# -------------------------------
# 6. Text Processing with spaCy
# -------------------------------

# Ensure spaCy model is installed
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model 'en_core_web_sm' not found. Installing...")
    import subprocess
    import sys
    subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
    nlp = spacy.load("en_core_web_sm")
    print("Model 'en_core_web_sm' installed and loaded successfully.")

def clean_and_extract_tags(text):
    """
    Cleans the input text by lowering the case, removing stop words and non-alphanumeric tokens.
    Returns a comma-separated string of tags.
    """
    doc = nlp(text.lower())
    tags = [token.text for token in doc if token.text.isalnum() and token.text not in STOP_WORDS]
    return ', '.join(tags)

# Columns to extract tags from
columns_to_extract_tags_from = ['Category', 'Brand', 'Description']

# Apply cleaning function to specified columns
for column in columns_to_extract_tags_from:
    train_data[column] = train_data[column].astype(str).apply(clean_and_extract_tags)

# Concatenate the cleaned tags from all relevant columns
train_data['Tags'] = train_data[columns_to_extract_tags_from].apply(lambda row: ', '.join(row), axis=1)

# Display updated Tags
print("\nSample Tags after cleaning:")
print(train_data['Tags'].head())

# -------------------------------
# 7. Rating-Based Recommendation System (Trending Products)
# -------------------------------

# Calculate average ratings
average_ratings = train_data.groupby(['Name', 'ReviewCount', 'Brand', 'ImageURL'])['Rating'].mean().reset_index()

# Sort items by average rating in descending order
top_rated_items = average_ratings.sort_values(by='Rating', ascending=False)

# Select top 10 rated items
rating_base_recommendation = top_rated_items.head(10)

# Convert 'Rating' and 'ReviewCount' to integer type for display
rating_base_recommendation['Rating'] = rating_base_recommendation['Rating'].round().astype(int)
rating_base_recommendation['ReviewCount'] = rating_base_recommendation['ReviewCount'].astype(int)

print("\nRating-Based Recommendation System (Top 10 Trending Products):")
print(rating_base_recommendation[['Name', 'Rating', 'ReviewCount', 'Brand', 'ImageURL']])

# -------------------------------
# 8. Content-Based Recommendation System
# -------------------------------

def content_based_recommendations(train_data, item_name, top_n=10):
    """
    Generates content-based recommendations for a given item using TF-IDF and cosine similarity.
    """
    # Check if the item exists in the dataset
    if item_name not in train_data['Name'].values:
        print(f"Item '{item_name}' not found in the dataset.")
        return pd.DataFrame()
    
    # Initialize TF-IDF Vectorizer
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    
    # Fit and transform the 'Tags' column
    tfidf_matrix_content = tfidf_vectorizer.fit_transform(train_data['Tags'])
    
    # Compute cosine similarity matrix
    cosine_similarities_content = cosine_similarity(tfidf_matrix_content, tfidf_matrix_content)
    
    # Get the index of the target item
    item_index = train_data[train_data['Name'] == item_name].index[0]
    
    # Get similarity scores for the target item
    similar_items = list(enumerate(cosine_similarities_content[item_index]))
    
    # Sort items based on similarity scores (descending order)
    similar_items = sorted(similar_items, key=lambda x: x[1], reverse=True)
    
    # Exclude the target item itself and select top_n similar items
    top_similar_items = similar_items[1:top_n+1]
    
    # Get the indices of the top similar items
    recommended_item_indices = [x[0] for x in top_similar_items]
    
    # Retrieve the details of recommended items
    recommended_items_details = train_data.iloc[recommended_item_indices][['Name', 'ReviewCount', 'Brand', 'ImageURL', 'Rating']]
    
    return recommended_items_details

# Example 1: Content-Based Recommendations
item_name_1 = 'OPI Infinite Shine, Nail Lacquer Nail Polish, Bubble Bath'
content_based_rec_1 = content_based_recommendations(train_data, item_name_1, top_n=8)
print(f"\nContent-Based Recommendations for '{item_name_1}':")
print(content_based_rec_1)

# Example 2: Another Content-Based Recommendation
item_name_2 = 'Kokie Professional Matte Lipstick, Hot Berry, 0.14 fl oz'
content_based_rec_2 = content_based_recommendations(train_data, item_name_2, top_n=8)
print(f"\nContent-Based Recommendations for '{item_name_2}':")
print(content_based_rec_2)

# -------------------------------
# 9. Collaborative Filtering Recommendation System
# -------------------------------

def collaborative_filtering_recommendations(train_data, target_user_id, top_n=10):
    """
    Generates collaborative filtering recommendations for a given user based on user similarity.
    """
    # Create the user-item matrix
    user_item_matrix = train_data.pivot_table(index='ID', columns='ProdID', values='Rating', aggfunc='mean').fillna(0)
    
    # Calculate user similarity matrix using cosine similarity
    user_similarity = cosine_similarity(user_item_matrix)
    
    # Check if the target user exists
    if target_user_id not in user_item_matrix.index:
        print(f"User ID {target_user_id} not found in the dataset.")
        return pd.DataFrame()
    
    # Get the index of the target user
    target_user_index = user_item_matrix.index.get_loc(target_user_id)
    
    # Get similarity scores for the target user
    user_similarities = user_similarity[target_user_index]
    
    # Sort users by similarity score in descending order (excluding the target user)
    similar_users_indices = user_similarities.argsort()[::-1][1:]
    
    # Initialize a set to store recommended item IDs
    recommended_items = set()
    
    # Iterate through similar users to find items to recommend
    for user_idx in similar_users_indices:
        # Get the items rated by the similar user
        similar_user_ratings = user_item_matrix.iloc[user_idx]
        
        # Identify items not rated by the target user
        not_rated_by_target = similar_user_ratings[user_item_matrix.iloc[target_user_index] == 0]
        
        # Recommend items with the highest ratings by similar users
        top_items = not_rated_by_target[not_rated_by_target > 0].sort_values(ascending=False).head(top_n).index.tolist()
        
        # Add to the recommendation set
        recommended_items.update(top_items)
        
        # Break if we have enough recommendations
        if len(recommended_items) >= top_n:
            break
    
    # Limit to top_n recommendations
    recommended_items = list(recommended_items)[:top_n]
    
    # Retrieve the details of recommended items
    recommended_items_details = train_data[train_data['ProdID'].isin(recommended_items)][['Name', 'ReviewCount', 'Brand', 'ImageURL', 'Rating']]
    
    return recommended_items_details

# Example: Collaborative Filtering Recommendations
target_user_id_1 = 4
collaborative_filtering_rec_1 = collaborative_filtering_recommendations(train_data, target_user_id_1, top_n=5)
print(f"\nCollaborative Filtering Recommendations for User {target_user_id_1}:")
print(collaborative_filtering_rec_1)

# -------------------------------
# 10. Hybrid Recommendation System
# -------------------------------

def hybrid_recommendations(train_data, target_user_id, item_name, top_n=10):
    """
    Combines content-based and collaborative filtering recommendations.
    """
    # Get content-based recommendations
    content_based_rec = content_based_recommendations(train_data, item_name, top_n)
    
    # Get collaborative filtering recommendations
    collaborative_filtering_rec = collaborative_filtering_recommendations(train_data, target_user_id, top_n)
    
    # Combine and deduplicate recommendations
    hybrid_rec = pd.concat([content_based_rec, collaborative_filtering_rec]).drop_duplicates().head(top_n)
    
    return hybrid_rec

# Example 1: Hybrid Recommendations
target_user_id_2 = 4
item_name_3 = "OPI Nail Lacquer Polish .5oz/15mL - This Gown Needs A Crown NL U11"
hybrid_rec_1 = hybrid_recommendations(train_data, target_user_id_2, item_name_3, top_n=10)
print(f"\nHybrid Recommendations for User {target_user_id_2} and Item '{item_name_3}':")
print(hybrid_rec_1)

# Example 2: Another Hybrid Recommendation
target_user_id_3 = 10
item_name_4 = 'Black Radiance Perfect Tone Matte Lip Crème, Succulent Plum'
hybrid_rec_2 = hybrid_recommendations(train_data, target_user_id_3, item_name_4, top_n=10)
print(f"\nHybrid Recommendations for User {target_user_id_3} and Item '{item_name_4}':")
print(hybrid_rec_2)

# -------------------------------
# 11. Summary and Next Steps
# -------------------------------

print("\nRecommendation systems have been successfully implemented.")
