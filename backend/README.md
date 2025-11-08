# 1v1me Backend

Spring Boot backend API for 1v1me.

## Development

Run the application:
```bash
./mvnw spring-boot:run
```

The API will be available at [http://localhost:8080](http://localhost:8080)

## Build

```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Database

The application uses H2 in-memory database for development.

Access the H2 console at: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

- JDBC URL: `jdbc:h2:mem:1v1me`
- Username: `sa`
- Password: (leave empty)

## API Endpoints

- `GET /api/health` - Health check

## Tech Stack

- Java 17
- Spring Boot 3.2
- Spring Data JPA
- H2 Database
- Maven
- Lombok

