# User Registration API Documentation

## Overview

This document provides details about the API endpoints for user registration, including generating and verifying OTPs. The registration process ensures user authentication through email and phone number verification.

---

## API Endpoints

### 1. Request OTP

#### Endpoint

`POST /auth/request-otp`

#### Description

Generates a One-Time Password (OTP) for new user registration and sends it to the provided email address.

#### Request Body

```json
{
  "phoneNumber": "string",
  "email": "string",
  "fullName": "string"
}
```

| Field       | Type   | Required | Description                           |
| ----------- | ------ | -------- | ------------------------------------- |
| phoneNumber | string | Yes      | User's phone number. Must be unique.  |
| email       | string | Yes      | User's email address. Must be unique. |
| fullName    | string | Yes      | User's full name.                     |

#### Response

**Success (200)**

```json
{
  "requestType": "REGISTRATION_OTP_REQUEST",
  "success": true,
  "code": "OTP_SENT",
  "message": "OTP sent successfully",
  "statusCode": 200,
  "fields": {
    "email": "string",
    "phoneNumber": "string"
  }
}
```

**Failure (409)** - User already exists

```json
{
  "requestType": "REGISTRATION_OTP_REQUEST",
  "success": false,
  "code": "USER_EXISTS",
  "message": "A user with this email or phone number already exists",
  "statusCode": 409,
  "fields": {
    "email": "string",
    "phoneNumber": "string"
  }
}
```

**Failure (500)** - Server error

```json
{
  "requestType": "REGISTRATION_OTP_REQUEST",
  "success": false,
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred",
  "statusCode": 500,
  "fields": {
    "email": "string",
    "phoneNumber": "string"
  }
}
```

---

### 2. Verify OTP

#### Endpoint

`POST /auth/verify-otp`

#### Description

Verifies the OTP sent to the user's email address and completes the registration process.

#### Request Body

```json
{
  "email": "string",
  "otp": "string"
}
```

| Field | Type   | Required | Description                 |
| ----- | ------ | -------- | --------------------------- |
| email | string | Yes      | User's email address.       |
| otp   | string | Yes      | One-Time Password received. |

#### Response

**Success (200)** - Verification complete

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": true,
  "error": false,
  "code": "VERIFICATION_COMPLETE",
  "message": "Email verified successfully",
  "statusCode": 200,
  "token": {
    "token": "string",
    "expiresIn": "string"
  }
}
```

**Failure (400)** - Missing OTP

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "OTP_MISSING",
  "message": "OTP is required for verification",
  "statusCode": 400
}
```

**Failure (404)** - User not found

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "statusCode": 404
}
```

**Failure (410)** - OTP expired

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "OTP_EXPIRED",
  "message": "OTP has expired. Please request a new one",
  "statusCode": 410,
  "expiredAt": "string"
}
```

**Failure (423)** - Account locked

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "ACCOUNT_LOCKED",
  "message": "Account locked due to too many failed attempts",
  "statusCode": 423,
  "unlockAt": {
    "unlocksAt": "string",
    "lockDuration": "string"
  }
}
```

**Failure (500)** - Server error

```json
{
  "requestType": "REGISTRATION_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

## Error Codes

| Code           | Description                                          |
| -------------- | ---------------------------------------------------- |
| OTP_SENT       | OTP sent successfully.                               |
| USER_EXISTS    | User with the given email or phone number exists.    |
| OTP_MISSING    | OTP is required for verification.                    |
| USER_NOT_FOUND | No user found with the given email.                  |
| OTP_EXPIRED    | OTP has expired.                                     |
| ACCOUNT_LOCKED | User account locked due to multiple failed attempts. |
| SERVER_ERROR   | An unexpected error occurred on the server.          |

### 3. Request OTP for Login

#### Endpoint

`<span>POST /auth/request-otp</span>`

#### Description

Generates a One-Time Password (OTP) for user login and sends it to the provided email address.

#### Request Body

```
{
  "email": "string"
}
```

| Field | Type   | Required | Description           |
| ----- | ------ | -------- | --------------------- |
| email | string | Yes      | User's email address. |

#### Response

**Success (200)**

```
{
  "requestType": "LOGIN_OTP_REQUEST",
  "success": true,
  "code": "OTP_SENT",
  "message": "OTP sent successfully",
  "statusCode": 200,
  "fields": {
    "email": "string"
  }
}
```

**Failure (403)** - User not found or inactive

```
{
  "requestType": "LOGIN_OTP_REQUEST",
  "success": false,
  "code": "USER_NOT_FOUND",
  "message": "User not found. Please register first",
  "statusCode": 403,
  "fields": {
    "email": "string"
  }
}
```

**Failure (500)** - Server error

```
{
  "requestType": "LOGIN_OTP_REQUEST",
  "success": false,
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred",
  "statusCode": 500,
  "fields": {
    "email": "string"
  }
}

---

### 4. Verify OTP for Login
#### Endpoint
`POST /auth/verify-otp`

#### Description
Verifies the OTP sent to the user's email address and completes the login process.

#### Request Body
```json
{
  "email": "string",
  "otp": "string"
}
```

| Field | Type   | Required | Description                 |
| ----- | ------ | -------- | --------------------------- |
| email | string | Yes      | User's email address.       |
| otp   | string | Yes      | One-Time Password received. |

#### Response

**Success (200)** - Verification complete

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": true,
  "error": false,
  "code": "VERIFICATION_COMPLETE",
  "message": "Email verified successfully",
  "statusCode": 200,
  "token": {
    "token": "string",
    "expiresIn": "string"
  }
}
```

**Failure (400)** - Missing OTP

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "OTP_MISSING",
  "message": "OTP is required for login verification",
  "statusCode": 400
}
```

**Failure (404)** - User not found

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "statusCode": 404
}
```

**Failure (410)** - OTP expired

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "OTP_EXPIRED",
  "message": "OTP has expired. Please request a new one",
  "statusCode": 410,
  "expiredAt": "string"
}
```

**Failure (423)** - Account locked

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "ACCOUNT_LOCKED",
  "message": "Account locked due to too many failed attempts",
  "statusCode": 423,
  "unlockAt": {
    "unlocksAt": "string",
    "lockDuration": "string"
  }
}
```

**Failure (500)** - Server error

```
{
  "requestType": "LOGIN_OTP_VERIFICATION",
  "success": false,
  "error": true,
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

## Error Codes

| Code           | Description                                          |
| -------------- | ---------------------------------------------------- |
| OTP_SENT       | OTP sent successfully.                               |
| USER_EXISTS    | User with the given email or phone number exists.    |
| OTP_MISSING    | OTP is required for verification.                    |
| USER_NOT_FOUND | No user found with the given email.                  |
| OTP_EXPIRED    | OTP has expired.                                     |
| ACCOUNT_LOCKED | User account locked due to multiple failed attempts. |
| SERVER_ERROR   | An unexpected error occurred on the server.          |

---

### Property API Documentation

### 1. Add Property

#### Endpoint

`<span>POST /property/add</span>`

#### Description

Allows users to add a new property to the platform.

#### Request Body

```
{
  "name": "string",
  "location": "string",
  "price": "number",
  "description": "string",
  "ownerId": "string"
}
```

| Field       | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| name        | string | Yes      | The name of the property.                    |
| location    | string | Yes      | The location of the property.                |
| price       | number | Yes      | The price of the property.                   |
| description | string | No       | A brief description of the property.         |
| ownerId     | string | Yes      | The unique identifier of the property owner. |

#### Response

**Success (201)** - Property added successfully

```
{
  "success": true,
  "message": "Property added successfully",
  "propertyId": "string"
}
```

**Failure (400)** - Missing required fields

```
{
  "success": false,
  "message": "Missing required fields"
}
```

**Failure (500)** - Server error

```
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

### 2. Get Property Details

#### Endpoint

`<span>GET /property/:id</span>`

#### Description

Retrieves the details of a specific property using its unique identifier.

#### Request Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| id        | string | Yes      | The unique identifier of the property. |

#### Response

**Success (200)** - Property details retrieved

```
{
  "success": true,
  "property": {
    "id": "string",
    "name": "string",
    "location": "string",
    "price": "number",
    "description": "string",
    "ownerId": "string"
  }
}
```

**Failure (404)** - Property not found

```
{
  "success": false,
  "message": "Property not found"
}
```

**Failure (500)** - Server error

```
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

### 3. Update Property

#### Endpoint

`<span>PUT /property/:id</span>`

#### Description

Updates the details of a specific property.

#### Request Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| id        | string | Yes      | The unique identifier of the property. |

#### Request Body

```
{
  "name": "string",
  "location": "string",
  "price": "number",
  "description": "string"
}
```

| Field       | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| name        | string | No       | The updated name of the property.        |
| location    | string | No       | The updated location of the property.    |
| price       | number | No       | The updated price of the property.       |
| description | string | No       | The updated description of the property. |

#### Response

**Success (200)** - Property updated successfully

```
{
  "success": true,
  "message": "Property updated successfully"
}
```

**Failure (400)** - Invalid request body

```
{
  "success": false,
  "message": "Invalid request body"
}
```

**Failure (404)** - Property not found

```
{
  "success": false,
  "message": "Property not found"
}
```

**Failure (500)** - Server error

```
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

### 4. Delete Property

#### Endpoint

`<span>DELETE /property/:id</span>`

#### Description

Deletes a specific property using its unique identifier.

#### Request Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| id        | string | Yes      | The unique identifier of the property. |

#### Response

**Success (200)** - Property deleted successfully

```
{
  "success": true,
  "message": "Property deleted successfully"
}
```

**Failure (404)** - Property not found

```
{
  "success": false,
  "message": "Property not found"
}
```

**Failure (500)** - Server error

```
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---


# Payment API

This API handles payment processing, order creation, verification of payments, and retrieval of payment details using Razorpay.

## Features

- **Create Order:** Generates a new order and saves it in the database.
- **Verify Payment:** Verifies payment authenticity using Razorpay's signature verification.
- **Fetch Payment Details:** Retrieves payment information by payment ID or order ID.

## Endpoints

### 1. Create New Order

**URL:** `/create-order`

**Method:** `POST`

**Description:** Creates a new order with Razorpay and stores the details in the database.

**Request Body:**

```json
{
  "amount": 1000,
  "currency": "INR",
  "customerDetails": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "contact": "9876543210"
  }
}
```

**Response:**

- `200 OK`: Order created successfully.
- `400 Bad Request`: Invalid input (e.g., amount < 100 paisa).
- `500 Internal Server Error`: Order creation failed.

### 2. Verify Payment

**URL:** `/verify-payment`

**Method:** `POST`

**Description:** Verifies Razorpay's signature to ensure the payment is authentic.

**Request Body:**

```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_xyz456",
  "razorpay_signature": "signature_abc789"
}
```

**Response:**

- `200 OK`: Payment verified successfully.
- `400 Bad Request`: Invalid signature or verification failed.
- `500 Internal Server Error`: Verification process failed.

### 3. Get Payment Details

**URL:** `/payment/:id`

**Method:** `GET`

**Description:** Retrieves payment details by payment ID or order ID.

**Response:**

- `200 OK`: Payment details retrieved successfully.
- `404 Not Found`: Payment not found.
- `500 Internal Server Error`: Failed to fetch payment details.



# Newsletter API

This API allows users to subscribe to a newsletter, either individually or in bulk. It includes endpoints to manage subscriptions and is backed by a MongoDB database.

## Features

- **Single Subscription:** Add a single email to the newsletter list.
- **Bulk Subscription:** Add multiple emails to the newsletter list at once.

## Endpoints

### 1. Subscribe to Newsletter

**URL:** `/`

**Method:** `POST`

**Description:** Adds a new email to the newsletter list.

**Request Body:**

```json
{
  "email": "example@example.com"
}
```

**Response:**

- `201 Created`: Email successfully added.
- `400 Bad Request`: Invalid email or email already exists.

### 2. Bulk Subscribe to Newsletter

**URL:** `/bulk`

**Method:** `POST`

**Description:** Adds multiple emails to the newsletter list in one request.

**Request Body:**

```json
{
  "emails": [
    "example1@example.com",
    "example2@example.com"
  ]
}
```

**Response:**

- `201 Created`: Emails successfully added.
- `400 Bad Request`: One or more emails are invalid or already exist.

## Database Schema

The newsletter emails are stored in a MongoDB database using the following schema:

```javascript
const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Newsletter', NewsletterSchema);
```


# Host Routes API

This API manages hosts and their properties, providing endpoints to fetch, add, and manage host-related data. The database uses MongoDB, and the models for `Host` and `Property` are linked via references.

## Features

- **Fetch All Hosts:** Retrieve all hosts along with their properties.
- **Fetch Single Host:** Retrieve a single host and their properties by ID.
- **Add Property for a Host:** Add a new property for a specific host.
- **Get Host Properties:** Retrieve all properties associated with a specific host.

## Endpoints

### 1. Get All Hosts and Their Properties

**URL:** `/`

**Method:** `GET`

**Description:** Retrieves all hosts and their associated properties.

**Response:**

- `200 OK`: Successfully fetched all hosts.
- `500 Internal Server Error`: Error fetching hosts.

### 2. Get a Single Host and Their Properties

**URL:** `/:hostId`

**Method:** `GET`

**Description:** Fetches a single host by ID and their associated properties.

**Response:**

- `200 OK`: Successfully fetched the host.
- `404 Not Found`: Host not found.
- `500 Internal Server Error`: Error fetching the host.

### 3. Add a New Property for a Host

**URL:** `/:hostId/properties`

**Method:** `POST`

**Description:** Adds a new property for a specific host by their ID.

**Request Body:**

```json
{
  "name": "Property Name",
  "location": "Property Location",
  "price": 1000,
  "description": "A brief description of the property"
}
```

**Response:**

- `201 Created`: Property added successfully.
- `400 Bad Request`: Invalid input data.
- `500 Internal Server Error`: Error adding the property.

### 4. Get All Properties of a Specific Host

**URL:** `/:hostId/properties`

**Method:** `GET`

**Description:** Retrieves all properties managed by a specific host.

**Response:**

- `200 OK`: Successfully fetched the properties.
- `404 Not Found`: Host not found.
- `500 Internal Server Error`: Error fetching the properties.

## Database Schema

### Host Schema

The `Host` model stores information about hosts and their associated properties:

```javascript
const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Host', hostSchema);
```


# Booking API

The Booking API allows users to create, manage, and interact with property bookings. Hosts can confirm or cancel bookings, while users can view and manage their reservations.

## Features

- Create new bookings.
- View all bookings (admin/host-specific).
- Retrieve bookings by user or host.
- Update booking details (e.g., change dates, status).
- Cancel or confirm bookings.
- Mark bookings as paid.
- Delete bookings (admin or system cleanup).

## Endpoints

### 1. Create a New Booking

**URL:** `/`

**Method:** `POST`

**Description:** Create a new booking for a property.

**Request Body:**

```json
{
  "userId": "userId",
  "propertyId": "propertyId",
  "hostId": "hostId",
  "checkIn": "2024-01-01T00:00:00.000Z",
  "checkOut": "2024-01-05T00:00:00.000Z",
  "price": 500,
  "currency": "USD"
}
```

**Response:**

- `201 Created`: Booking successfully created.
- `400 Bad Request`: Missing or invalid data.

### 2. Get All Bookings

**URL:** `/`

**Method:** `GET`

**Description:** Retrieve all bookings (admin or host-specific).

**Response:**

- `200 OK`: List of bookings.
- `500 Internal Server Error`: Failed to fetch bookings.

### 3. Get Bookings by User

**URL:** `/user/:userId`

**Method:** `GET`

**Description:** Retrieve all bookings for a specific user.

**Response:**

- `200 OK`: List of user bookings.
- `404 Not Found`: User not found.

### 4. Get Bookings by Host

**URL:** `/host/:hostId`

**Method:** `GET`

**Description:** Retrieve all bookings managed by a specific host.

**Response:**

- `200 OK`: List of host bookings.
- `404 Not Found`: Host not found.

### 5. Get Booking by ID

**URL:** `/:bookingId`

**Method:** `GET`

**Description:** Retrieve details of a specific booking.

**Response:**

- `200 OK`: Booking details.
- `404 Not Found`: Booking not found.

### 6. Update a Booking

**URL:** `/:bookingId`

**Method:** `PUT`

**Description:** Update booking details (e.g., dates, status).

**Request Body:**

```json
{
  "checkIn": "2024-01-10T00:00:00.000Z",
  "checkOut": "2024-01-15T00:00:00.000Z"
}
```

**Response:**

- `200 OK`: Booking updated.
- `400 Bad Request`: Invalid data.
- `404 Not Found`: Booking not found.

### 7. Cancel a Booking

**URL:** `/:bookingId/cancel`

**Method:** `PATCH`

**Description:** Cancel a booking and calculate the refund.

**Response:**

- `200 OK`: Booking canceled with refund amount.
- `404 Not Found`: Booking not found.

### 8. Confirm a Booking

**URL:** `/:bookingId/confirm`

**Method:** `PATCH`

**Description:** Confirm a booking (host action).

**Response:**

- `200 OK`: Booking confirmed.
- `404 Not Found`: Booking not found.

### 9. Mark Booking as Paid

**URL:** `/:bookingId/pay`

**Method:** `PATCH`

**Description:** Mark a booking as paid.

**Response:**

- `200 OK`: Booking marked as paid.
- `404 Not Found`: Booking not found.

### 10. Delete a Booking

**URL:** `/:bookingId`

**Method:** `DELETE`

**Description:** Delete a booking (admin or system cleanup).

**Response:**

- `200 OK`: Booking deleted.
- `404 Not Found`: Booking not found.

## Database Schema

The bookings are stored in a MongoDB database using the following schema:

```javascript
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  cancellationPolicy: {
    type: String,
    enum: ['strict', 'moderate', 'flexible'],
    default: 'moderate'
  },
  refundAmount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
```


# Calendar API

The Calendar API allows users to manage availability, reservations, and blocked dates for specific experiences. It provides endpoints for querying availability, blocking dates, and marking dates as unavailable or reserved.

## Features

- **Manage Availability:** Add, update, or retrieve availability details for experiences.
- **Reservation Integration:** Links to the Booking API for reserved and pending statuses.
- **Date Blocking:** Allows hosts to block specific dates.

## Endpoints

### 1. Get Availability for an Experience

**URL:** `/:experienceId`

**Method:** `GET`

**Description:** Retrieves the availability for a specific experience.

**Response:**

- `200 OK`: Returns availability details.
- `404 Not Found`: Experience not found.

### 2. Block or Unblock a Date

**URL:** `/:experienceId/block`

**Method:** `PUT`

**Description:** Blocks or unblocks a specific date for an experience.

**Request Body:**

```json
{
  "date": "2024-12-10",
  "block": true
}
```

**Response:**

- `200 OK`: Date successfully blocked/unblocked.
- `404 Not Found`: Experience not found.

### 3. Mark Date as Unavailable

**URL:** `/:experienceId/unavailable`

**Method:** `PUT`

**Description:** Marks a date as unavailable for booking.

**Request Body:**

```json
{
  "date": "2024-12-11"
}
```

**Response:**

- `200 OK`: Date successfully marked as unavailable.
- `404 Not Found`: Experience not found.

### 4. Share Availability Information

**URL:** `/share`

**Method:** `POST`

**Description:** Shares availability or booking information for an experience with another user.

**Request Body:**

```json
{
  "experienceId": "<experience-id>",
  "email": "user@example.com"
}
```

**Response:**

- `200 OK`: Share request processed.
- `400 Bad Request`: Invalid request data.

## Database Schema

The availability details are stored in a MongoDB database using the following schema:

```javascript
const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  dates: [
    {
      date: { type: Date, required: true },
      available: { type: Boolean, default: true },
      blocked: { type: Boolean, default: false },
      reservationStatus: {
        type: String,
        enum: ['reserved', 'pending', 'available', 'unavailable'],
        default: 'available'
      },
      bookingDetails: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        createdAt: { type: Date, default: Date.now }
      }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Calendar = mongoose.model('Calendar', calendarSchema);
module.exports = Calendar;
```


# Experience API

The Experience API allows users to create, manage, and explore various experiences hosted by individuals or organizations. It includes features for filtering, updating, and retrieving experiences and their availability.

## Features

- **Create Experiences:** Allows hosts to create and list experiences.
- **Manage Experiences:** Hosts can update or delete their experiences.
- **Search Experiences:** Users can search for experiences with filters like location, price, and ratings.
- **Availability Integration:** Provides information about available dates for booking an experience.

## Endpoints

### 1. Create an Experience

**URL:** `/`

**Method:** `POST`

**Description:** Creates a new experience.

**Request Body:**

```json
{
  "title": "Sunset Kayaking",
  "description": "Experience kayaking during sunset with a guide.",
  "hostId": "<host-id>",
  "location": {
    "type": "Point",
    "coordinates": [12.9716, 77.5946]
  },
  "price": 50,
  "currency": "USD",
  "duration": "3 hours",
  "groupSize": 10,
  "activities": ["Kayaking", "Photography"],
  "includes": ["Guide", "Life Jacket"],
  "language": "English",
  "images": ["image1.jpg", "image2.jpg"],
  "featured": true
}
```

**Response:**

- `201 Created`: Experience successfully created.
- `400 Bad Request`: Missing or invalid fields.

### 2. Get All Experiences

**URL:** `/`

**Method:** `GET`

**Description:** Retrieves all experiences with optional filters.

**Query Parameters:**

- `location` - Location coordinates to filter by proximity.
- `price` - Price range filter.
- `duration` - Duration filter.
- `featured` - Filter featured experiences.

**Response:**

- `200 OK`: List of experiences.
- `500 Internal Server Error`: Failed to fetch experiences.

### 3. Get a Single Experience by ID

**URL:** `/:id`

**Method:** `GET`

**Description:** Retrieves details of a specific experience by its ID.

**Response:**

- `200 OK`: Experience details.
- `404 Not Found`: Experience not found.

### 4. Update an Experience

**URL:** `/:id`

**Method:** `PUT`

**Description:** Updates details of an existing experience.

**Response:**

- `200 OK`: Experience updated successfully.
- `404 Not Found`: Experience not found.

### 5. Delete an Experience

**URL:** `/:id`

**Method:** `DELETE`

**Description:** Deletes an experience by its ID.

**Response:**

- `200 OK`: Experience deleted successfully.
- `404 Not Found`: Experience not found.

### 6. Get Experiences by Host

**URL:** `/host/:hostId`

**Method:** `GET`

**Description:** Retrieves all experiences listed by a specific host.

**Response:**

- `200 OK`: List of host experiences.
- `404 Not Found`: Host not found.

### 7. Get Availability for an Experience

**URL:** `/:experienceId/availability`

**Method:** `GET`

**Description:** Retrieves the availability of a specific experience.

**Response:**

- `200 OK`: List of available dates.
- `404 Not Found`: Experience not found or no calendar exists.

## Database Schema

The experiences are stored in a MongoDB database using the following schema:

```javascript
const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  duration: { type: String, required: true },
  groupSize: { type: Number, required: true },
  activities: [String],
  includes: [String],
  language: { type: String, default: 'English' },
  images: { type: [String], required: true },
  ratings: {
    overall: { type: Number, min: 0, max: 5, default: 0 },
    experienceQuality: { type: Number, min: 0, max: 5, default: 0 },
    guideFriendliness: { type: Number, min: 0, max: 5, default: 0 },
    valueForMoney: { type: Number, min: 0, max: 5, default: 0 }
  },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Experience = mongoose.model('Experience', experienceSchema);
module.exports = Experience;
```


# Chat API Documentation

The Chat API facilitates real-time messaging between users and hosts, enabling seamless communication similar to Airbnb's chat system. The API supports WebSocket-based real-time updates and RESTful endpoints for chat history retrieval.

---

## Features

- **Real-Time Messaging**: WebSocket-based communication for instant updates.
- **Message History**: Retrieve chat history for specific bookings or participants.
- **Automated Messages**: Supports automated notifications or booking updates.

---

## WebSocket Implementation

### Connection Endpoint

**URL:** `wss://<server-url>/api/v1/chat`

**Description:** Establishes a WebSocket connection for real-time messaging.

**Connection Parameters:**

```json
{
  "userId": "<user-id>",
  "bookingId": "<booking-id>"
}
```

**WebSocket Events:**

- **Join Chat:**
  **Event Name:** `join`
  **Payload:**

  ```json
  {
    "chatId": "<chat-id>"
  }
  ```
- **Send Message:**
  **Event Name:** `sendMessage`
  **Payload:**

  ```json
  {
    "chatId": "<chat-id>",
    "message": "<message-text>"
  }
  ```
- **Receive Message:**
  **Event Name:** `receiveMessage`
  **Payload:**

  ```json
  {
    "chatId": "<chat-id>",
    "message": {
      "sender": "<user-id>",
      "text": "<message-text>",
      "createdAt": "<timestamp>"
    }
  }
  ```

---

## RESTful Endpoints

### 1. Get All Chats for a User

**URL:** `/chats/user/:userId`

**Method:** `GET`

**Description:** Retrieves all chats associated with a specific user.

**Response:**

- `200 OK`: List of chats.
- `404 Not Found`: No chats found for the user.

### 2. Get Chat by Booking ID

**URL:** `/chats/booking/:bookingId`

**Method:** `GET`

**Description:** Retrieves a chat associated with a specific booking.

**Response:**

- `200 OK`: Chat details.
- `404 Not Found`: Chat not found for the booking.

### 3. Create a New Chat

**URL:** `/chats`

**Method:** `POST`

**Description:** Creates a new chat instance between participants.

**Request Body:**

```json
{
  "participants": ["<user-id>", "<host-id>"],
  "bookingId": "<booking-id>"
}
```

**Response:**

- `201 Created`: Chat created successfully.
- `400 Bad Request`: Invalid request body.

### 4. Add a Message to Chat

**URL:** `/chats/:chatId/messages`

**Method:** `POST`

**Description:** Adds a new message to a specific chat.

**Request Body:**

```json
{
  "sender": "<user-id>",
  "message": "<message-text>"
}
```

**Response:**

- `201 Created`: Message added successfully.
- `404 Not Found`: Chat not found.

### 5. Retrieve Chat History

**URL:** `/chats/:chatId`

**Method:** `GET`

**Description:** Retrieves the complete message history for a specific chat.

**Response:**

- `200 OK`: Chat history.
- `404 Not Found`: Chat not found.

---

## Database Schema

```javascript
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  automated: { type: Boolean, default: false }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
```

---

`<pre class="!overflow-visible"><div class="contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary dark:bg-gray-950">``</div></pre>`
