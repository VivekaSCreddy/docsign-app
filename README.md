# 📄 DocSign — Digital Document Signing Platform

A full-stack web application to upload, sign, and verify PDF documents electronically. Share a public verification link with anyone to prove document authenticity.

🌐 **Live Demo:** [docsign-app-ten.vercel.app](https://docsign-app-ten.vercel.app)  
⚙️ **Backend API:** [docsign-backend-uuk6.onrender.com](https://docsign-backend-uuk6.onrender.com)

---

## ✨ Features

- 📤 Upload PDF documents securely
- ✍️ Sign documents digitally (draw or type signature)
- 🔗 Share public verification links
- ✅ Verify document authenticity via public links
- 🔐 JWT-based authentication (register/login)
- 📧 Email verification on registration
- 🔑 Forgot password / reset password flow
- 🛡️ Admin panel to manage users and documents
- 📋 Audit logs for all document activity
- ☁️ Cloud storage via Cloudinary

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
docsign-app/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Landing, Login, Register, Dashboard, Sign, Verify, Admin
│   │   ├── components/     # PrivateRoute, etc.
│   │   ├── context/        # AuthContext
│   │   └── api/            # Axios instance
└── server/                 # Node.js backend
    ├── routes/             # auth, documents, admin, verify
    ├── models/             # User, Document, AuditLog
    ├── middleware/         # authMiddleware, upload
    └── utils/              # email, hash
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/VivekaSCreddy/docsign-app.git
cd docsign-app
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend:
```bash
node index.js
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create a `.env` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## 🛡️ Admin Setup

To access the Admin Panel, a user must have the `role: "admin"` field set in MongoDB.

### Steps to create an admin:

1. Register a new account normally on the app
2. Open **MongoDB Atlas** → your database → `users` collection
3. Find the user you want to make admin
4. Edit the document and add/update:
   ```json
   { "role": "admin" }
   ```
5. Save — that user can now access `/admin` route

### Admin Capabilities:
- View all registered users
- View all uploaded documents
- View audit logs
- Manage user roles

> ⚠️ Never share admin credentials publicly. Share them securely via a private channel.

---

## ⚠️ Note on localStorage

This app uses `localStorage` to persist the JWT token for authentication. This is suitable for a demo/portfolio project. For production-grade security, consider using `httpOnly` cookies instead to protect against XSS attacks.

---

## 📦 Deployment

| Service | Purpose | Config |
|---|---|---|
| **Vercel** | Frontend hosting | Root dir: `client`, Framework: Vite |
| **Render** | Backend hosting | Root dir: `server`, Start: `node index.js` |

### Environment Variables on Vercel:
```
VITE_API_URL=https://docsign-backend-uuk6.onrender.com
```

### Environment Variables on Render:
```
MONGO_URI, JWT_SECRET, CLIENT_URL, CLOUDINARY_*, EMAIL_USER, EMAIL_PASS
```

---

## 📸 Screenshots

### 🏠 Landing Page
<img width="1920" height="1020" alt="Landing Page" src="https://github.com/user-attachments/assets/938eeee9-5e90-4aa0-ab52-3b7d8e4f2ad2" />

### 📝 Register
<img width="1920" height="1020" alt="Register Page" src="https://github.com/user-attachments/assets/a1fb617a-5728-4dd7-ad3d-2b405d25422c" />

### 🔐 Login
<img width="1920" height="1020" alt="Login Page" src="https://github.com/user-attachments/assets/3593fd91-1aed-47cb-8b48-dc0af849af30" />

### 📊 User Dashboard
<img width="1920" height="1020" alt="User Dashboard" src="https://github.com/user-attachments/assets/9bd8169f-4cf6-4fc5-ab62-af7164184632" />

### 🛡️ Admin Dashboard
<img width="1920" height="1020" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/6b1b6558-bd47-4a19-8882-06b7911ee16e" />




---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

**Viveka S C Reddy**  
GitHub: [@VivekaSCreddy](https://github.com/VivekaSCreddy)
