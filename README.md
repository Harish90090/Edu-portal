# **📚 Edu-Portal: Full-Stack Educational Resource Platform**

## **🌟 Overview**

**Edu-Portal** is a robust, full-stack platform designed to help students, educators, and lifelong learners organize, share, and access educational content efficiently. Built with the powerful MERN stack, this application provides a seamless, dynamic user experience and a scalable backend architecture.

### **Key Features**

✅ Authentication & Authorization: Secure user registration, login, and protected routes.  
✅ CRUD Functionality: Complete management of educational resources (create, read, update, delete).  
✅ Responsive Design: Optimized for seamless viewing on all devices (mobile, tablet, and desktop).  
✅ Scalable API: Structured Express.js backend for fast and reliable data handling.  
✅ MongoDB Integration: Non-relational database for flexible and quick storage of educational materials.

## **🛠 Tech Stack**

The Edu-Portal is built using the industry-standard MERN stack.

| Category | Technology | Description |
| :---- | :---- | :---- |
| **Frontend** | **Html,css,js**| Building the dynamic and responsive user interface. |
| **Backend** | **Node.js** & **Express.js** | Creating a fast, scalable, and non-blocking API server. |
| **Database** | **MongoDB** & **Mongoose** | Flexible NoSQL database with object data modeling (ODM). |
| **Styling** | *** CSS3** or Custom CSS | Used for utility-first, responsive design and styling. |
| **State Management** | **Context API** / **Redux** (or similar) | Efficient global state management in the React application. |

## **🚀 Local Setup & Installation**

Follow these steps to get a development copy of the project running on your local machine.

### **Prerequisites**

* Node.js (v14+)  
* MongoDB Instance (Local or Cloud like MongoDB Atlas)  
* Git

### **Step 1: Clone the Repository**

git clone \[https://github.com/Harish90090/Edu-portal.git\](https://github.com/Harish90090/Edu-portal.git)  
cd Edu-portal

### **Step 2: Configure Environment Variables**

Create a file named .env in the root directory and add the following variables.

\# MongoDB Connection String (Replace with your Atlas or local URL)  
MONGO\_URI=mongodb+srv://\<username\>:\<password\>@clustername.mongodb.net/EduPortalDB?retryWrites=true\&w=majority

\# Port for the Express server  
PORT=5000 

### **Step 3: Install Backend Dependencies**

Navigate to the project root and install the server dependencies.

npm install

### **Step 4: Install Frontend Dependencies**

Navigate into the frontend directory and install the client dependencies.

cd frontend  
npm install  
cd ..

### **Step 5: Run the Project**

You need to run both the client and the server simultaneously.

**In Terminal 1 (Run Backend):**

\# Start the Express server  
npm run server   
\# (Assuming your package.json has a "server" script for "node server.js")

*The backend should run on http://localhost:5000 (or the port defined in your .env file).*

**In Terminal 2 (Run Frontend):**

cd frontend  
npm run dev   
\# (Or 'npm start' if using Create-React-App)

*The frontend should open automatically, typically on http://localhost:3000.*

## **🌐 Deployment**

This application is designed for easy deployment to cloud services like **Render, Vercel, or Netlify** (for the frontend) and **Render or Heroku** (for the backend).

For a unified deployment (single service), follow this standard configuration:

1. **Build Command (Render/Heroku):**  
   cd frontend && npm install && npm run build && cd .. && npm install

2. **Start Command:**  
   node server.js

3. Ensure your API calls in the frontend use **relative paths** (e.g., /api/resources) for production, not hardcoded localhost or full Render URLs.

## **🤝 Contributing**

Contributions, issues, and feature requests are welcome\! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/Harish90090/Edu-portal/issues) or submit a Pull Request.

1. Fork the Project.  
2. Create your Feature Branch (git checkout \-b feature/AmazingFeature).  
3. Commit your Changes (git commit \-m 'Add some AmazingFeature').  
4. Push to the Branch (git push origin feature/AmazingFeature).  
5. Open a Pull Request.

## **📄 License**

Distributed under the MIT License. See LICENSE for more information.

**Made with ❤️ by Harish**
