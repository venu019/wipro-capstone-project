# Bus Ticket Booking System

A comprehensive, production-ready **Bus Ticket Booking System** built using Java (Spring Boot, Spring Security, MySQL) for the backend and React for the frontend. Features include JWT authentication, real-time seat selection, booking and cancellation functionality, and an admin dashboard for managing buses, trips, routes, and bookings.

***

## Features

- **User Registration & Login** (JWT Authentication)  
- **Role-based Access Control** (User and Admin)  
- **Bus & Route Management** (Admin)  
- **Trip Scheduling & Fare Assignment**  
- **Seat Selection with Real-Time Availability**  
- **Passenger Details Form with Validation** (Formik + Yup)  
- **Booking Creation and Cancellation**  
- **Booking Summary and Payment Tracking**  
- **Admin Dashboard:** Statistics on bookings, buses, active/cancelled trips  
- **React Frontend with Responsive UI**  
- **Secure REST API** using Spring Security  
- **Microservices Architecture:** Separate services for User, Trip, Booking, and Bus/Route  

***

## Technology Stack

| Layer           | Technology                              |
|-----------------|----------------------------------------|
| Backend         | Java, Spring Boot, Spring Security, OpenFeign |
| Database        | MySQL                                  |
| Frontend        | React (Formik/Yup, Axios, Bootstrap)   |
| Authentication  | JWT                                    |
| Service Discovery | Eureka                               |
| Containerization | Docker (optional)                      |

***

## Getting Started

### Prerequisites

- JDK 17 or higher  
- Node.js v16 or higher  
- MySQL Server  
- Maven  
- (Optional) Docker & Docker Compose  

### Backend Setup

```bash[
git clone https://github.com/venu019/wipro-capstone-project.git
cd wipro-capstone-project/backend
```

1. Create a MySQL database (e.g., `busbooking`).
2. Update database credentials in each Spring Boot service's `application.properties` file.
3. Run each microservice:

```bash
cd user-service
mvn spring-boot:run

cd ../busroute-service
mvn spring-boot:run

cd ../trip-service
mvn spring-boot:run

cd ../booking-service
mvn spring-boot:run

cd ../api-gateway
mvn spring-boot:run

cd ../eureka-server
mvn spring-boot:run
```

*Alternatively, use Docker Compose for multi-service deployment.*

### Frontend Setup

```bash
cd wipro-capstone-project
npm install
npm start
```

- The app will be accessible at [http://localhost:3000](http://localhost:3000).

***

## Usage

- **Customer:** Register, login, search trips, select and book seats, view/cancel bookings.  
- **Admin:** Login, manage buses/routes/trips, pricing, cancel trips, view reports and stats.

### Booking Flow

1. Search for buses by origin, destination, date, and type.  
2. Select a trip and choose available seats visually on a seat map.  
3. Enter passenger details and contact information.  
4. Confirm booking; admin manages confirmation and cancellation if required.

***

## Project Structure

```
/user-service        # User authentication and roles
/busroute-service    # Bus and route management
/trip-service        # Trip scheduling and seat inventory
/booking-service     # Booking, cancellation, and payment
/api-gateway         # Routing and security (optional)
/eureka-server       # Service discovery (optional)
/frontend            # React user and admin app
```

***

## Contributing

Contributions, bug reports, feature requests are welcome! Please open issues or submit pull requests.

***
