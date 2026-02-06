
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

## Features

-   **User Authentication**: Register, Login, Profile management
-   **Product Management**: Admin interface to Add, Edit, Delete products
-   **Shopping Cart**: Add items, view summary, checkout
-   **Orders**: Order history, status tracking
-   **Search & Filter**: Find products by name, category, price
