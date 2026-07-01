# 🏥 Kent Web

Kent Web is a full-stack healthcare management platform built using **React**, **Node.js**, **Express.js**, and **MongoDB**. The platform provides a secure and user-friendly environment where users can register, log in, consult doctors, manage healthcare services, and access medical-related features through a modern web interface.

---

# 🚀 Features

## 👤 User Authentication
- Secure User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected User Profile

## 👨‍⚕️ Doctor Management
- Add Doctor
- View Doctors *(In Progress)*
- Update Doctor *(Upcoming)*
- Delete Doctor *(Upcoming)*

## 📅 Appointment Management *(Upcoming)*
- Book Appointment
- View Appointments
- Cancel Appointment

## 💊 Medicine Services *(Upcoming)*
- Browse Medicines
- Product Categories
- Search Medicines
- Order Medicines

## 🧪 Lab Test Services *(Upcoming)*
- Browse Available Lab Tests
- Book Lab Tests

## 🛒 Additional Features
- Shopping Cart
- User Profile
- Contact Page
- Responsive User Interface

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- JavaScript (ES6+)
- CSS3

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Token)
- bcryptjs

---

# 📁 Project Structure

```
Kent Web
│
├── Backend
│   ├── src
│   │   ├── controllers
│   │   │   ├── auth.controller.js
│   │   │   └── doctor.controller.js
│   │   │
│   │   ├── db
│   │   │   └── database.js
│   │   │
│   │   ├── middleware
│   │   │   └── auth.middleware.js
│   │   │
│   │   ├── models
│   │   │   ├── atanu.user.model.js
│   │   │   ├── atanu.doctor.model.js
│   │   │   ├── atanu.category.model.js
│   │   │   ├── atanu.product.model.js
│   │   │   ├── atanu.labtest.model.js
│   │   │   ├── atanu.order.model.js
│   │   │   └── atanu.appointmentbooking.model.js
│   │   │
│   │   ├── routes
│   │   │   ├── auth.routes.js
│   │   │   └── doctor.routes.js
│   │   │
│   │   ├── app.js
│   │   ├── constants.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── .env
│
└── Project (Frontend)
    ├── src
    │   ├── assets
    │   ├── components
    │   ├── Home
    │   ├── Login
    │   ├── Profile
    │   ├── ConsultDoctor
    │   ├── ContactUS
    │   ├── Lab Tests
    │   ├── ProductDescription
    │   ├── Cart
    │   ├── data
    │   ├── App.jsx
    │   ├── Layout.jsx
    │   └── main.jsx
    │
    ├── public
    ├── package.json
    └── vite.config.js
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone <repository-url>
```

---

## Backend Setup

```bash
cd Backend
npm install
npm run dev
```

Backend will run on:

```
http://localhost:4000
```

---

## Frontend Setup

```bash
cd Project
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

# 🔐 Environment Variables

Create a `.env` file inside the **Backend** folder.

```env
PORT=4000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/signup` | Register User |
| POST | `/api/auth/login` | Login User |
| GET | `/api/auth/profile` | Get User Profile |

---

## Doctor

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/doctor` | Add Doctor |
| GET | `/api/doctor` | Get All Doctors *(Upcoming)* |
| GET | `/api/doctor/:id` | Get Doctor Details *(Upcoming)* |
| PUT | `/api/doctor/:id` | Update Doctor *(Upcoming)* |
| DELETE | `/api/doctor/:id` | Delete Doctor *(Upcoming)* |

---

# 🔒 Security

- Passwords are securely hashed using **bcrypt**.
- JWT is used for user authentication and authorization.
- Protected routes are accessible only to authenticated users.
- MongoDB validation ensures data integrity.

---

# 📊 Current Project Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Completed |
| Doctor Management | 🟡 In Progress |
| Appointment Management | ⏳ Planned |
| Medicine Management | ⏳ Planned |
| Lab Test Services | ⏳ Planned |
| Order Management | ⏳ Planned |
| Frontend Integration | 🟡 In Progress |

---

# 🚀 Future Enhancements

- Appointment Booking System
- Medicine Ordering
- Lab Test Booking
- Search & Filter
- Image Upload Support
- Online Payment Integration
- Email Notifications
- Admin Dashboard
- Doctor Dashboard
- Deployment on Cloud Platform

---

# 🤝 Project Information

Kent Web is a custom healthcare management platform developed for a client. The project is currently under active development, with new features and improvements being added to enhance functionality, security, and user experience.
