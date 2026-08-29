# API-SPECIFICATION

## User

### Signup

**Endpoint:**`GET /api/user/signup`
**Request:**

```

{
    Header:Nothing,
    Body:Nothing
}
```

**Response:**

- SUCCESS 200 OK
  {}

**Endpoint:**`POST /api/user/signup`
**example:**

**Request:**

```
{
  full_name:johndoe
  email:johndoe@gmail.com
  phone_number:21652169
  password:password@123
}
```

**Response:**

**Status:** `200 OK`

```
{
  message:successfully signed up
}
```

**Status:** `InternalServerError 500`
**example:**

```
Headers:
{
    message:error occured while signing up
}
```

### Login

**Endpoint:**`GET /api/user/login`
**Request:**
{Header:Nothing,Body:Nothing}
**Response:**

- SUCCESS 200 OK
  {}

**Endpoint:**`POST /api/user/login`

**Request:**

```
{
  email:johndoe@gmail.com
  password:password@123
}
```

**Response:**

**Status:** `200 OK`
**example:**

```
{
  message:successfully logged in
}
```

**Status:** `InternalServerError 500`
**example:**

```
{
    message:error occured while logging in
}
```

**Status:** `Bad Request 400`
**example:**

```
Headers:
{
    message:Wrong email or password
}
```

### Creating new printer job

**Endpoint:**`GET /api/user/new_printer_job`
**Request:**

```

{
    Header:{
        Authentication Token:fasfsshhslog,
    }
    Body:{}
}
```

**Response:**

- SUCCESS 200 OK
  {}

**Endpoint:**`POST /api/user/new_printer_job`
**example:**

**Request:**

```
Headers:
  Authentication Token:fajflassjfaslf
{
  full_name:johndoe
  email:johndoe@gmail.com
  phone_number:21652169
  password:password@123
}
```

**Response:**

**Status:** `200 OK`

```
{
  message:successfully signed up
}
```

**Status:** `InternalServerError 500`
**example:**

```
Headers:
{
    message:error occured while signing up
}
```
