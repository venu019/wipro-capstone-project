Bus Ticket Booking System (Microservices without API Gateway)
A modular Microservices Architecture for online Bus Ticket Booking, built with Spring Boot and React. Each backend service operates independently without an API Gateway or service discovery, with the frontend directly communicating to each microservice.

Architecture Overview
Microservices:

User Service: Authentication, user registration, roles, JWT security.

Bus & Route Service: Manage buses, routes, seat layouts.

Trip Service: Create trips, schedule fares, real-time seat availability.

Booking Service: Hold seats, booking confirmation, cancellation, and payment integration.

Frontend: React app that calls backend services directly.

Databases: Separate MySQL schemas for services or shared DB with service-specific tables.

No API Gateway: Frontend manages direct calls to each service's REST endpoints.

Security: Spring Security + JWT tokens passed from frontend to microservices for authorization.

Features
Role-based access control (User/Admin).

Real-time seat selection and booking.

Passenger details with form validation.

Booking lifecycle management including cancellation and refunds.

Admin dashboard for operational insights.

Responsive UI built with React and Bootstrap.

Secure HTTP endpoints with JWT authentication.

Independent microservice deployments.

Service Endpoints and Ports
Service	Base URL	Main Endpoints
User Service	http://localhost:9001/api/v1/	/auth/login, /auth/register
Bus/Route	http://localhost:9002/api/v1/	/buses, /routes
Trip Service	http://localhost:9003/api/v1/	/trips, /trips/search, /trips/{id}/seats
Booking Service	http://localhost:9004/api/v1/	/bookings/hold, /bookings/confirm, /bookings/{id}/cancel
Setup Instructions
Prerequisites
Java 17+

Node.js 16+

MySQL Server

Backend Setup
Clone the repo and navigate to each microservice folder.

Configure MySQL connection in each service’s application.properties.

Build & run each service independently:

text
cd user-service
mvn spring-boot:run
cd ../busroute-service
mvn spring-boot:run
# similarly for trip-service and booking-service
Frontend Setup
Navigate to React frontend folder.

Install dependencies:

text
npm install
Run the React app:

text
npm start
Frontend-Backend Interaction
The frontend directly calls microservices via base URLs above.

JWT received on login is sent in Authorization headers for subsequent requests.

The frontend handles API errors like 401 (unauthorized) or 409 (seat conflict).

