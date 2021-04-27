# OAuth 2.0 server with authorization code flow

This repository includes simple OAuth 2.0 server with authorization code flow. Application includes login page which asks permission from user to give third-party application access to specific scopes. Client must be registered to ask access, but currently dynamic client registration is not included.

## Structure of the program

Program is made with Node.js, Express.js and Handlebars as template-engine. Program is implemented with MVC-architecture, where views are handlebar-files, controllers handle endpoints and business-logic and models include data which is used to handle all interactions. Error-folder includes errors which are specific to OAuth 2.0 reference.

## Secure programming solutions

## Security testing

## Improvements
