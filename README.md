# 🛍️ Amazon Clone - Intelligent Recommendation Engine

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)

> A high-performance, asynchronous recommendation microservice designed for an E-commerce platform. This project implements a **Hybrid Filtering Strategy** to deliver personalized product suggestions with **low-latency inference**.

## 🚀 Overview

While this project serves as the backend for an Amazon-like platform, the core focus is on the **AI-driven Recommendation Module**. It addresses common challenges in e-commerce systems, such as the **Cold-Start Problem** and **Real-time Latency**, by leveraging modern Deep Learning techniques and Database Optimizations.

Built with **FastAPI**, this service ensures high throughput and automatic documentation generation.

## ✨ Key Features

* **Hybrid Recommendation System:**
    * Combines **Collaborative Filtering** (User behavior patterns) and **Content-Based Filtering** (Product metadata similarity).
    * Dynamically adjusts weights based on user history depth.
* **Cold-Start Solution:**
    * **New Users:** Falls back to a "Trending/Popular" strategy mixed with demographic-based suggestions.
    * **New Items:** Uses content embeddings (Description/Tags) to recommend new products similar to what users already like.
* **High-Performance Architecture:**
    * **FastAPI:** Utilizes asynchronous request handling (`async`/`await`) for non-blocking I/O.
    * **MongoDB Optimization:** Implemented **Compound Indexing** to reduce query execution time to **<50ms** for retrieval tasks.
* **Scalable Design:** Designed as a standalone microservice that can be containerized and deployed independently.

## 🧠 The AI Architecture

The recommendation logic is composed of three main layers:

### 1. Candidate Generation
* **Neural Collaborative Filtering (NCF):** Uses **PyTorch** to learn user-item interaction embeddings (Matrix Factorization).
* **Content Similarity:** Computes Cosine Similarity between product feature vectors (TF-IDF/BERT embeddings of product descriptions).

### 2. Scoring & Ranking
* The system calculates a hybrid score:
    $$Score_{final} = \alpha \cdot Score_{CF} + (1 - \alpha) \cdot Score_{Content}$$
* $\alpha$ is a dynamic hyperparameter that increases as the user interacts with more items.

### 3. Retrieval & Optimization
* Instead of scanning the entire database, candidate sets are retrieved using **MongoDB Compound Indexes** (e.g., `{category: 1, rating_avg: -1}`).

## 🛠️ Tech Stack

* **Framework:** FastAPI (Python)
* **ML & DL:** PyTorch, scikit-learn, NumPy, Pandas
* **Database:** MongoDB (Motor for async driver)
* **Server:** Uvicorn
* **Containerization:** Docker

## 📂 Project Structure

```bash
├── app/
│   ├── api/
│   │   ├── endpoints/      # Recommendation routes
│   │   └── deps.py         # Dependencies
│   ├── core/
│   │   ├── config.py       # Env variables
│   │   └── security.py     # Auth logic
│   ├── db/
│   │   └── mongodb.py      # Async Mongo connection & indexes
│   ├── models/             # Pydantic models & DB Schemas
│   └── services/
│       ├── recommender.py  # Main Hybrid Logic
│       ├── collab_model.py # PyTorch NCF Model
│       └── content_model.py# Content-based logic
├── data/                   # Datasets
├── ml_weights/             # Saved model artifacts (.pth)
├── requirements.txt
└── main.py                 # App Entry point