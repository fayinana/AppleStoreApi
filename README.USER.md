---

## Authentication

All API requests, except for registration, login, and password reset, require authentication. To authenticate, you must obtain a **JWT token** by logging in and passing it in the headers of subsequent requests.

- **Authorization header format**: `Bearer <token>`

---

## Endpoints

### Authentication Routes

1. `**_POST /api/v1/auth/register_**`

   - **Description**: Register a new user.
   - **Request Body**:
     ```json
     {
       "firstName": "John",
       "lastName": "Doe",
       "email": "johndoe@example.com",
       "password": "password123",
       "passwordConfirm": "password123"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "token": "JWT_TOKEN_HERE",
       "user": {
         "_id": "USER_ID",
         "firstName": "John",
         "lastName": "Doe",
         "email": "johndoe@example.com",
         "cart": [],
         "order": []
       }
     }
     ```

2. **POST /api/v1/auth/login**

   - **Description**: Log in to an existing user account.
   - **Request Body**:
     ```json
     {
       "email": "johndoe@example.com",
       "password": "password123"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "token": "JWT_TOKEN_HERE",
       "user": {
         "_id": "USER_ID",
         "firstName": "John",
         "lastName": "Doe",
         "email": "johndoe@example.com"
       }
     }
     ```

3. **POST /api/v1/auth/logout**

   - **Description**: Log out the currently logged-in user.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Successfully logged out."
     }
     ```

4. **POST /api/v1/auth/forgotPassword**

   - **Description**: Request a password reset link.
   - **Request Body**:
     ```json
     {
       "email": "johndoe@example.com"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Password reset token sent to your email address."
     }
     ```

5. **POST /api/v1/auth/resetPassword/:token**

   - **Description**: Reset the password using a token received via email.
   - **Request Body**:
     ```json
     {
       "password": "newPassword123",
       "passwordConfirm": "newPassword123"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "token": "JWT_TOKEN_HERE",
       "user": {
         "_id": "USER_ID",
         "firstName": "John",
         "lastName": "Doe",
         "email": "johndoe@example.com"
       }
     }
     ```

6. **POST /api/v1/auth/updatePassword**

   - **Description**: Update the password of the currently logged-in user.
   - **Request Body**:
     ```json
     {
       "passwordCurrent": "currentPassword123",
       "password": "newPassword123",
       "passwordConfirm": "newPassword123"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "token": "JWT_TOKEN_HERE",
       "user": {
         "_id": "USER_ID",
         "firstName": "John",
         "lastName": "Doe",
         "email": "johndoe@example.com"
       }
     }
     ```

### User Routes

1. **GET /api/v1/users/me**

   - **Description**: Get the logged-in user's profile.
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "user": {
           "_id": "USER_ID",
           "firstName": "John",
           "lastName": "Doe",
           "email": "johndoe@example.com"
         }
       }
     }
     ```

2. **PATCH /api/v1/users/updateMe**

   - **Description**: Update the profile of the logged-in user.
   - **Request Body**:
     ```json
     {
       "firstName": "John",
       "lastName": "Doe"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "user": {
           "_id": "USER_ID",
           "firstName": "John",
           "lastName": "Doe",
           "email": "johndoe@example.com"
         }
       }
     }
     ```

3. **DELETE /api/v1/users/deleteMe**

   - **Description**: Delete the account of the currently logged-in user.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Account deleted successfully."
     }
     ```

4. **GET /api/v1/users/:id**

   - **Description**: Get a user by ID (Admin only).
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "user": {
           "_id": "USER_ID",
           "firstName": "John",
           "lastName": "Doe",
           "email": "johndoe@example.com"
         }
       }
     }
     ```

---

## Error Handling

If an error occurs, the API will respond with an appropriate HTTP status code and a message indicating the cause of the error. Common error responses include:

- **400 Bad Request**: When the request is malformed or missing required data.
- **401 Unauthorized**: When the user is not authenticated or the provided token is invalid.
- **403 Forbidden**: When the user does not have permission to perform an action.
- **404 Not Found**: When the requested resource does not exist.
- **500 Internal Server Error**: For any unexpected server errors.

---

## Security

- **JWT Tokens**: All sensitive routes are protected using JSON Web Tokens (JWT). After registering or logging in, you will receive a JWT that must be sent in the `Authorization` header as a `Bearer token` for authenticated requests.
- **Password Handling**: Passwords are hashed using bcrypt and are never stored in plain text. Password reset tokens are hashed before being stored.

---

## Rate Limiting

To ensure fair usage and prevent abuse, the API may limit the number of requests a user can make in a given timeframe. Exceeding the rate limit will result in a `429 Too Many Requests` error.
