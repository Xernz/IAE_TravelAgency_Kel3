# Logging, Monitoring, and Error Handling Patterns

This document describes the cross-cutting concerns implemented across all microservices in the Travel Agency System, including logging, monitoring, and error handling. These patterns ensure observability, reliability, and maintainability for all backend services.

## 1. Structured Logging with Winston
- Each service uses a Winston-based logger (`src/logger.js`) for structured logging.
- All incoming requests are logged with method, URL, and client IP.
- Errors are logged with stack traces and timestamps.
- Logs are written to both the console and to rotating files in a shared `logs` directory (e.g., `booking-service-error.log`, `booking-service-combined.log`).
- Log files are separated per service for clarity.

**Example logger setup:**
```js
const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/service-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/service-combined.log' })
  ],
});
```

## 2. Centralized Error Handling
- Each service uses an Express error handler middleware.
- All unhandled errors are logged and a consistent JSON error response is returned to the client:
  ```json
  { "status": "error", "message": "Internal server error" }
  ```
- This prevents leaking stack traces to clients and ensures consistent error reporting.

## 3. Health Check Endpoints
- Every service exposes a `/health` endpoint that returns a JSON object with status, service name, and the current timestamp.
- This enables basic monitoring and can be used for readiness/liveness checks in deployment environments.

**Example response:**
```json
{
  "status": "ok",
  "service": "booking-service",
  "time": "2025-06-07T10:43:00Z"
}
```

## 4. Usage Pattern in Each Service
- All services (`users-service`, `flight-service`, `hotel-service`, `local-travel-service`, `train-service`, `booking-service`, `payment-service`) follow this pattern:
  - Import and use the logger for all logs (replace `console.log` with `logger.info` or `logger.error`).
  - Add request logging middleware at the top of the middleware stack.
  - Add `/health` endpoint for monitoring.
  - Add error handler middleware at the end of the middleware stack.

## 5. Log Directory
- All logs are written to a top-level `logs` directory.
- Ensure this directory exists or is created at service startup.
- Log files are named per service for easy identification.

## 6. Extensibility
- This pattern can be extended with:
  - Log rotation and retention policies (Winston supports this via additional transports).
  - Integration with external log aggregation/monitoring tools (e.g., ELK, Datadog).
  - Health endpoints can be extended to check database or downstream service connectivity.

---

**For more details, see each service's `src/logger.js` and `src/index.js` files.**
