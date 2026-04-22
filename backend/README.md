# Online Store API

Online Store API is a RESTful backend service for an e-commerce platform.  
It provides endpoints for managing users, authentication, products, and orders, and is designed to be scalable, secure, and easy to deploy.

The application is containerized using Docker and can be run locally or on any Linux server.

---

##  Live Demo

 
>## 🌐 Live Demo

- API: http://82.165.138.175:3000
- Swagger UI: http://82.165.138.175:3000/api/docs
- Health Check: http://82.165.138.175:3000/health


---

##  What This Application Does

This API represents the backend of an online store and supports the following core features:

### Authentication & Users
- User registration and login
- JWT-based authentication
- Role-based access control (user / admin)
- Protected routes for authenticated users

### Products
- Create, read, update, and delete products
- Pagination and filtering
- Public product listing
- Admin-only product management

### Orders
- Create orders for authenticated users
- View user orders
- Admin access to all orders

### API Documentation
- Interactive API documentation using Swagger
- JSON schema available for integration with other services

---

##  How the Application Works

1. The client sends HTTP requests to the API
2. Requests are validated and authenticated using JWT
3. Business logic is handled in controllers
4. Data is stored in MongoDB using Mongoose models
5. Errors are handled centrally and returned in a consistent format

The application follows a modular structure with clear separation between routes, controllers, models, and utilities.

---

## Technologies Used

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose ODM

### Authentication & Security
- JSON Web Tokens (JWT)
- Password hashing with bcrypt

### Documentation
- Swagger (OpenAPI)

### Testing
- Jest
- Supertest
- mongodb-memory-server (for isolated tests)

### DevOps & Tooling
- Docker
- Docker Compose
- GitHub Actions (CI)

---

## Project Structure
```
.
├── app.js
├── server.js
├── config/
├── controllers/
├── routes/
├── models/
├── utils/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

## Run Locally with Docker (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Steps

```bash
git clone https://github.com/abir1985-devops/online-store-api.git
cd online-store-api

cp .env.example .env
docker compose up --build
```

---

## Access the API

Once running, the API is available at:

- **Base URL:** http://localhost:3000  
- **Swagger UI:** http://localhost:3000/api/docs  
- **Health Check:** http://localhost:3000/health  

---

## Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
PORT=3000
DATABASE=mongodb://mongo:27017/online-store
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

> MongoDB runs inside Docker and is configured via `docker-compose.yml`.  
> No local MongoDB installation is required.

---

##  Run Tests

```bash
npm install
npm test
```

Tests are also executed automatically in **GitHub Actions** on every push.

---

## API Documentation

Swagger UI:
```
/api/docs
```

Swagger JSON:
```
/api/docs.json
```

---

## Health Check

```http
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

This endpoint is used for container health checks and production deployments.


---

## Deployment

The application is designed to be deployed on any Linux server that supports Docker.

Typical deployment flow:
1. Provision a Linux VPS
2. Install Docker & Docker Compose
3. Clone this repository
4. Run `docker compose up -d`

A live deployment 

- **Base URL:** http://localhost:3000  
- **Swagger UI:** http://localhost:3000/api/docs  
- **Health Check:** http://localhost:3000/health  

---

---

## Notes

- Environment variables are not committed to the repository.
- The application can run anywhere Docker is available.
- The same Docker Compose setup is used for local development and production.
