import requests

url = "https://recommend-api-458172285932.us-central1.run.app/search"
data = {
    "query": "lingerie"
}

response = requests.post(url, json=data)

# Print the response from the server
print(response.json())
