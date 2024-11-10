## Products and Reviews API Documentation

All endpoints related to products and reviews require **authentication** via a **JWT token**. Users must pass the token in the Authorization header with the format `Bearer <token>`.

---

## Endpoints

### Product Routes

1. **`POST /api/v1/products`**

   - **Description**: Create a new product.
   - **Request Body**:
     ```json
     {
       "name": "iPhone 14 Pro",
       "category": "Smartphone",
       "description": "Latest model with advanced features.",
       "price": 999,
       "stock": 50,
       "coverImage": "https://example.com/image.jpg",
       "images": [
         "https://example.com/image1.jpg",
         "https://example.com/image2.jpg"
       ],
       "specifications": [
         { "key": "Battery Life", "value": "20 hours" },
         { "key": "Camera", "value": "48 MP" }
       ]
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "product": {
           "_id": "PRODUCT_ID",
           "name": "iPhone 14 Pro",
           "category": "Smartphone",
           "price": 999,
           "stock": 50,
           "coverImage": "https://example.com/image.jpg",
           "images": [
             "https://example.com/image1.jpg",
             "https://example.com/image2.jpg"
           ],
           "specifications": [
             { "key": "Battery Life", "value": "20 hours" },
             { "key": "Camera", "value": "48 MP" }
           ],
           "ratingsAverage": 4,
           "ratingsQuantity": 0
         }
       }
     }
     ```

2. **`GET /api/v1/products`**

   - **Description**: Retrieve all products.
   - **Response**:
     ```json
     {
       "status": "success",
       "results": 10,
       "data": {
         "products": [
           {
             "_id": "PRODUCT_ID",
             "name": "iPhone 14 Pro",
             "category": "Smartphone",
             "price": 999,
             "ratingsAverage": 4.5,
             "ratingsQuantity": 10
           }
         ]
       }
     }
     ```

3. **`GET /api/v1/products/:id`**

   - **Description**: Retrieve a single product by ID.
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "product": {
           "_id": "PRODUCT_ID",
           "name": "iPhone 14 Pro",
           "category": "Smartphone",
           "price": 999,
           "ratingsAverage": 4.5,
           "ratingsQuantity": 10,
           "reviews": [
             {
               "_id": "REVIEW_ID",
               "review": "Great product!",
               "rating": 5,
               "user": {
                 "_id": "USER_ID",
                 "name": "John Doe"
               }
             }
           ]
         }
       }
     }
     ```

4. **`PATCH /api/v1/products/:id`**

   - **Description**: Update a product by ID.
   - **Request Body**:
     ```json
     {
       "name": "iPhone 14 Pro Max"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "product": {
           "_id": "PRODUCT_ID",
           "name": "iPhone 14 Pro Max",
           "category": "Smartphone",
           "price": 999
         }
       }
     }
     ```

5. **`DELETE /api/v1/products/:id`**

   - **Description**: Delete a product by ID.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Product deleted successfully."
     }
     ```

### Review Routes

1. **`POST /api/v1/products/:productId/reviews`**

   - **Description**: Create a review for a specific product.
   - **Request Body**:
     ```json
     {
       "review": "Amazing product!",
       "rating": 5
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "review": {
           "_id": "REVIEW_ID",
           "review": "Amazing product!",
           "rating": 5,
           "product": "PRODUCT_ID",
           "user": "USER_ID"
         }
       }
     }
     ```

2. **`GET /api/v1/products/:productId/reviews`**

   - **Description**: Get all reviews for a specific product.
   - **Response**:
     ```json
     {
       "status": "success",
       "results": 2,
       "data": {
         "reviews": [
           {
             "_id": "REVIEW_ID",
             "review": "Amazing product!",
             "rating": 5,
             "user": {
               "_id": "USER_ID",
               "name": "John Doe"
             }
           }
         ]
       }
     }
     ```

3. **`PATCH /api/v1/products/:productId/reviews/:reviewId`**

   - **Description**: Update a review for a specific product.
   - **Request Body**:
     ```json
     {
       "review": "Updated review",
       "rating": 4
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "review": {
           "_id": "REVIEW_ID",
           "review": "Updated review",
           "rating": 4
         }
       }
     }
     ```

4. **`DELETE /api/v1/products/:productId/reviews/:reviewId`**

   - **Description**: Delete a review by ID.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Review deleted successfully."
     }
     ```
