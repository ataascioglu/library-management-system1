# 📚 BookNest - Modern Library Management System

A full-stack library management web application built with **Node.js (Express)**, **MongoDB**, and a responsive vanilla JavaScript frontend. Features real-time updates, JWT authentication, and a RESTful API architecture.

---

## 🎯 Features

- **User Authentication** - Secure signup/login with JWT tokens
- **Book Management** - Full CRUD operations for books
- **Borrow/Return System** - Track book availability in real-time
- **Real-time Updates** - Socket.io for live book status changes
- **Security** - Helmet.js CSP, bcrypt password hashing, JWT validation
- **Responsive UI** - Mobile-friendly interface

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js v4.18.2
- **Database:** MongoDB with Mongoose ODM v7.3.4
- **Authentication:** JWT (jsonwebtoken v9.0.0) + bcryptjs v2.4.3
- **Real-time:** Socket.io v4.6.1
- **Security:** Helmet v7.0.0, CORS v2.8.5
- **Logging:** Winston v3.18.3, Morgan v1.10.1

### Frontend
- **Vanilla JavaScript** (ES6+)
- **Fetch API** for HTTP requests
- **LocalStorage** for token management
- **CSS3** with responsive design

### DevOps
- **Deployment:** Railway
- **Version Control:** Git & GitHub
- **Environment:** dotenv v16.0.3

---

## 📁 Project Structure

```
BookNest/
├── backend/
│   ├── config.js              # Environment configuration
│   ├── server.js              # Server entry point
│   ├── app.js                 # Express app setup
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Loan.js
│   │   └── Reservation.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── loanRoutes.js
│   │   └── reservationRoutes.js
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── loanController.js
│   │   └── reservationController.js
│   ├── middlewares/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/                 # Utilities
│   │   └── logger.js
│   ├── public/                # Static frontend files
│   │   ├── index.html         # Login page
│   │   ├── signup.html        # Registration page
│   │   ├── books.html         # Books dashboard
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── books.js
│   │   └── styles.css
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16.0.0 or higher
- **MongoDB** Atlas account or local MongoDB instance
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ataascioglu/BookNest.git
   cd BookNest
   ```

2. **Navigate to backend folder**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create environment file**

   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/booknest
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the server**

   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

6. **Open the application**

   Navigate to `http://localhost:5000` in your browser

---

## 📡 API Documentation

### Base URL
- **Local:** `http://localhost:5000/api`
- **Production:** `https://library-management-system-production-5be5.up.railway.app/api`

### Authentication

All endpoints (except signup/login) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

#### **POST** `/users/register`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### **POST** `/users/login`
Login and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### **GET** `/users/me`
Get current user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

---

### Books

#### **GET** `/books`
Get all books (requires authentication)

**Response:** `200 OK`
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category": "Fiction",
    "isAvailable": true,
    "borrowedBy": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

#### **POST** `/books/:id/borrow`
Borrow a book (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Book borrowed successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "Book already borrowed"
}
```

---

#### **POST** `/books/:id/return`
Return a borrowed book (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Book returned successfully"
}
```

**Error Response:** `403 Forbidden`
```json
{
  "message": "You can only return books you borrowed"
}
```

---

#### **POST** `/books`
Create a new book (requires authentication)

**Request Body:**
```json
{
  "title": "1984",
  "author": "George Orwell",
  "category": "Dystopian Fiction"
}
```

**Response:** `201 Created`
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "1984",
  "author": "George Orwell",
  "category": "Dystopian Fiction",
  "isAvailable": true,
  "borrowedBy": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

#### **PATCH** `/books/:id/status`
Update book availability status (requires authentication)

**Request Body:**
```json
{
  "isAvailable": false
}
```

**Response:** `200 OK`
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "1984",
  "author": "George Orwell",
  "category": "Dystopian Fiction",
  "isAvailable": false,
  "borrowedBy": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

---

### Loans

#### **GET** `/loans`
Get all loans (admin) or user's loans (requires authentication)

#### **POST** `/loans`
Create a new loan record (requires authentication)

#### **PUT** `/loans/:id/return`
Mark a loan as returned (requires authentication)

---

### Reservations

#### **GET** `/reservations`
Get all reservations (requires authentication)

#### **POST** `/reservations`
Reserve a book (requires authentication)

#### **DELETE** `/reservations/:id`
Cancel a reservation (requires authentication)

---

## 🔐 Authentication Flow

1. User registers via `/api/users/register`
2. User logs in via `/api/users/login` and receives JWT token
3. Frontend stores token in `localStorage`
4. All subsequent requests include token in header:
   ```javascript
   fetch('https://api-url/books', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   })
   ```
5. Server validates token via `authMiddleware.js`
6. Protected routes check `req.user` for authorization

---

## 🌐 Deployment

### Railway Deployment

This project is deployed on [Railway](https://railway.app).

**Live URL:** https://library-management-system-production-5be5.up.railway.app

#### Deployment Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Railway**
   - Login to Railway dashboard
   - Create new project from GitHub repo
   - Select `backend` as root directory

3. **Set Environment Variables**

   In Railway dashboard, add:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway auto-deploys on git push
   - Monitor logs in Railway dashboard

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/booknest` |
| `JWT_SECRET` | Secret key for JWT signing | `mySecretKey123!@#` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## 🛡️ Security Features

- **JWT Authentication** - Stateless token-based auth with 1-day expiration
- **Password Hashing** - bcrypt with salt rounds for secure storage
- **Helmet.js** - Sets security HTTP headers (CSP, XSS protection)
- **CORS** - Configured for cross-origin requests
- **Input Validation** - Server-side validation for all inputs
- **Error Handling** - Centralized error middleware prevents info leakage

---

## 🧪 Testing

### Using Postman/Thunder Client

1. **Login to get token:**
   ```
   POST http://localhost:5000/api/users/login
   Body: { "email": "test@example.com", "password": "password123" }
   ```

2. **Copy token from response**

3. **Test protected route:**
   ```
   GET http://localhost:5000/api/books
   Headers: Authorization: Bearer <paste_token_here>
   ```

---

## 📝 Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Ata Ascioglu**

- GitHub: [@ataascioglu](https://github.com/ataascioglu)

---

## 🙏 Acknowledgments

- Express.js documentation
- MongoDB documentation
- Railway deployment platform
- Socket.io for real-time features
