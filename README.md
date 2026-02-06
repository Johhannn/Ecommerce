
# E-commerce Project

A full-stack e-commerce application built with Django (backend) and React (frontend).

## Project Structure

- `ecommerce/` - Django Rest Framework backend
- `frontend/` - React + Vite frontend

## Setup Instructions

### Backend (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd ecommerce
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r ../requirements.txt 
    # Or if requirements are inside ecommerce dir
    pip install -r requirements.txt
    ```
    *(Note: Ensure requirements.txt exists and is up to date)*

4.  **Set up environment variables:**
    - Create a `.env` file in the `ecommerce/` directory.
    - Add necessary secrets (SECRET_KEY, DB config, Razorpay keys, etc.).

5.  **Run migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

## Technology Stack

-   **Backend**: Django 5, Django Rest Framework (DRF), SimpleJWT, Razorpay
-   **Frontend**: React.js, Vite, Bootstrap 5, Axios, React Router Dom
-   **Database**: SQLite (default), PostgreSQL (compatible)

## Features

### User Features
-   **Authentication**: User Registration, Login (JWT), Password Reset.
-   **Product Browsing**: Search, Filter by Category/Price, Pagination.
-   **Product Details**: Image gallery, stock status, related products.
-   **Shopping Cart**: Persistent cart (session/database), real-time updates.
-   **Checkout**: Address management, Razorpay payment gateway integration.
-   **Orders**: View order history, download invoices, track status.
-   **Wishlist**: Save favorite items for later.
-   **User Profile**: Manage saving addresses and personal details.
-   **Reviews**: Rate and review products.

### Admin Features
-   **Dashboard**: Sales overview, recent orders, revenue charts.
-   **Product Management**: Add, Edit, Delete products with image support.
-   **Order Management**: Update order status (Pending, Shipped, Delivered).
-   **User Management**: View customer details.

