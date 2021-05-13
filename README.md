# OAuth 2.0 server with authorization code flow

Repository includes OAuth 2.0 server with authorization code flow. Server is implemented as  course work for COMP.SEC.300 Secure programming course. Application is work in progress.

## Requirements

- Docker 18.06.0+

OR

- Node 14.16.0+
- MongoDB 4.4.4+ running on your computer

## How to set up

Application expects repository to include self signed certificate for HTTPS. Run following command to generate certificate:

- *openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365*

Create *.env* file. Required fields are in *.env.example*

Run following command to run the system with **docker**:

- *docker compose up* to start MongoDB and server with docker

Run system **locally**

- *npm install* to install dependencies

- *npm run dev* to start development server **or** *npm run prod* to start production server

Server runs in https://localhost:3000

## Further documentation

Read further documentation from [here](documentation/documentation.md). Documentation includes introduction to codebase, security considerations and instruction on how to use the system.