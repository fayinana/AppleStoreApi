## Cart API Documentation

All endpoints related to the cart require **authentication** via a **JWT token**. Users must pass the token in the Authorization header with the format `Bearer <token>`.

---

## Endpoints

### Cart Routes

1. **`POST /api/v1/cart`**

   - **Description**: Add a product to the cart.
   - **Request Body**:
     ```json
     {
       "productId": "PRODUCT_ID",
       "quantity": 2
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "cart": {
           "_id": "CART_ID",
           "user": "USER_ID",
           "products": [
             {
               "product": "PRODUCT_ID",
               "quantity": 2,
               "price": 999,
               "name": "iPhone 14 Pro"
             }
           ],
           "totalPrice": 1998
         }
       }
     }
     ```

2. **`GET /api/v1/cart`**

   - **Description**: Retrieve the user's cart.
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "cart": {
           "_id": "CART_ID",
           "user": "USER_ID",
           "products": [
             {
               "product": "PRODUCT_ID",
               "quantity": 2,
               "price": 999,
               "name": "iPhone 14 Pro"
             }
           ],
           "totalPrice": 1998
         }
       }
     }
     ```

3. **`PATCH /api/v1/cart/:id`**

   - **Description**: Update the quantity of a product in the cart.
   - **Request Body**:
     ```json
     {
       "quantity": 3
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "cart": {
           "_id": "CART_ID",
           "user": "USER_ID",
           "products": [
             {
               "product": "PRODUCT_ID",
               "quantity": 3,
               "price": 999,
               "name": "iPhone 14 Pro"
             }
           ],
           "totalPrice": 2997
         }
       }
     }
     ```

4. **`DELETE /api/v1/cart/:id`**

   - **Description**: Remove a product from the cart.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Product removed from cart successfully."
     }
     ```

5. **`DELETE /api/v1/cart`**

   - **Description**: Clear all items from the cart.
   - **Response**:
     ```json
     {
       "status": "success",
       "message": "Cart cleared successfully."
     }
     ```

### Cart Checkout Routes

1. **`POST /api/v1/cart/checkout`**

   - **Description**: Checkout and create an order for the items in the cart.
   - **Request Body**:
     ```json
     {
       "address": "123 Main St, City, Country",
       "paymentMethod": "Credit Card"
     }
     ```
   - **Response**:
     ```json
     {
       "status": "success",
       "data": {
         "order": {
           "_id": "ORDER_ID",
           "user": "USER_ID",
           "cart": "CART_ID",
           "totalPrice": 2997,
           "shippingAddress": "123 Main St, City, Country",
           "paymentMethod": "Credit Card",
           "status": "Processing"
         }
       }
     }
     ```

---

### Notes:

- **Authentication**: All cart routes require the user to be authenticated. The JWT token should be passed in the Authorization header in the format: `Bearer <token>`.
- **Total Price Calculation**: The `totalPrice` in the cart reflects the sum of the prices of the products multiplied by their respective quantities.
- **Cart Checkout**: The checkout process requires the user to provide an address and payment method.
