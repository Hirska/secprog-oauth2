# OAuth 2.0 server with authorization code flow

This repository includes simple OAuth 2.0 server with authorization code flow. Application includes login page which asks permission from user to give third-party application access to specific scopes. Client must be registered to ask access, but currently dynamic client registration is not included.

In this repository, Authorization code flow for OAuth is implemented. Flow is implemented for confidential clients with client secret and public clients with PKCE ([Proof Key for Code Exchange](https://oauth.net/2/pkce/)). Implemente flow is shown in diagram below.

Currently dynamic client registration is not implemented as this repository as this repository is used only to illustrate authorization code flow. Dummy clients are added when server is started but clients could be added straight to database if needed.

When client is registered, following properties are required.

- redirectUris. These include all redirectUris that could be used when requesting authorization code for this client
- confidential. Is client confidential or not. This is used to determine if PKCE or client secret should be user
- clientSecret. If client is confidential, client secret should be added

![Authorization flow](authorization_flow.png)

Flow starts with application requesting authorization code flow. In this stage, user agent (browser such as Chrome) is redirected to authorization servers log in screen. Query parameters must include *redirect_uri*, *response_type* and _client_id_. If client is public, PKCE specific *code_challenge* is required and* code_challenge_method*is optional. Optional parameters are*scope*, *state*.

- _redirect_uri_ is uri where user agent is redirected after erronous or successful authorization.
- _response_type_ is used to tell authorization server, which grant type is executed. **Only code is supported** (code stands for authorization code flow).
- _client_id_ is id which is assigned to client on registration.
- _code_challenge_ is dynamically generated code in application. Should be cryptographically random string.
- _code_challenge_method_ has either value _plain_ or _s256_. This depends on if code challenge is SHA256 hash of the string or plain string. If code\*challenge*method is omitted, server will assume it to be \_plain*
- *scope* is scope which application will get access to users data.
- *state* is random string which is used to prevent CSRF attacks. Authorization server returns state back unmodified.

Example. https://localhost:3000/authorize?client_id=f461489a-a604-4cb6-a1e7-98a01eee1d66&response_type=code&scope=profile&code_challenge=abc&code_challenge_method=s256&redirect_uri=http://localhost:3000/callback

![Log in](log_in.png)

If user signs in with correct username and password, user agent is redirected back to given redirect uri with authorization_code as uri parameter. If user cancels request, agent is redirected back to redirect uri with error-response.

Example. http://localhost:3000/callback?code=108788d45bb5c0e40374c30911bc169fb83548c1df9f7c2037ecc7413e9e0fdc

Authorization code is used to obtain access token. Access token request uses JSON-body and it should include following parameters

- *grant_type* **required**. Is used to tell authorization server, which grant type was used for authorization request.http://localhost:3000/callback?code=108788d45bb5c0e40374c30911bc169fb83548c1df9f7c2037ecc7413e9e0fdc
- *code* **required**. Code obtained in authorization-request
- *client_id* **required**. Client which was used to obtain initial authorization code.
- *redirect_uri* **required**. Redirect uri which was used in initial authorization-request.
- *code_verifier* **required if code_challenge was used**. Original code before encryption.
- *client_secret* **required if confidential client**. Client secret which was added to client on creation.

## Structure of the program

Program is made with Node.js, Express.js and Handlebars as template-engine. Source-code is located in src-folder.

### controllers

Controllers include routing to specified urls with business logic attached to them. Routes are connected in index.ts and business logic is located in files Authorize, Register, Token.

Authorize handles authorization request validation, authorization code generation and errors for invalid authorization request. Error is shown to user or redirected to original request-site depending on parameter. If redirect_uri or client_id is invalid, error is shown in authorization server with alert. If error occurs in any other parameter, request is redirected to redirect_uri with error message.

Register handles user registration. User is registered with email and password where password is hashed with bcrypt.

Token handles token generation and authorization code validation. If authorization code is valid and valid credentials are given, token is generated and returned to user.

### errors

Errors include

### middleware

### models

### setup

### utils

### views

## Secure programming solutions

## Security testing

## Improvements
