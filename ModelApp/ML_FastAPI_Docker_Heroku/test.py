import requests

url = "https://recommend-api-458172285932.asia-east1.run.app/search"
data = {
    "query": "laptop"
}

response = requests.post(url, json=data)

# Print the response from the server
print(response.json())
