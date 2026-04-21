# 🚀 How to Deploy your Grocery Tracker to Render.com

I have prepared your project for production. Follow these steps to put it online:

## 1. Push your code to GitHub
Make sure all the changes I made (settings.py, requirements.txt, .env.example) are pushed to your GitHub repository.

## 2. Create a New Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your **grocery_list** repository.

## 3. Configure the Web Service
During the setup, fill in these fields:
*   **Name:** `grocery-tracker` (or anything you like)
*   **Runtime:** `Python 3`
*   **Build Command:** 
    ```bash
    pip install -r requirements.txt; python manage.py collectstatic --noinput; python manage.py migrate
    ```
*   **Start Command:** 
    ```bash
    gunicorn grocery_project.wsgi
    ```

## 4. Set Environment Variables
In the **Environment** section of Render, click "Add Environment Variable" and add these:

| Key | Value |
| :--- | :--- |
| `SECRET_KEY` | (Copy your long secret key from settings.py or make a new one) |
| `DEBUG` | `False` |
| `PYTHON_VERSION` | `3.10.12` |

## 5. (Optional) Database
If you want to keep your grocery items forever, click **New +** -> **PostgreSQL** on Render. 
Once created, copy the **Internal Database URL** and add it as an Environment Variable named `DATABASE_URL` in your Web Service.

---
**Your Grocery Tracker will be live at the URL Render gives you!**
