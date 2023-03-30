# IVO


## Project structure
keywords: Node.js, Typescript, Lerna, BullMQ, Cosmos DB, Reddis

**Packages:**

**Apps (server apps)**

**Receiver**: gateway for incoming JSON (HotelTime) into the application structure  
**MyStay**:  gateway for incoming JSON (MyStay) into the application structure  
**Personalisation**: application connected via queue for processing in personalization  
**Monitoring**: separate application for monitoring and jobs  

**Libs**

**Common**: common utils, types, loggers etc.  
**Database**: database connectors, repos, utils  

## Technical guide

**Cosmos DB** 

 - connection to remote Azure Cosmos DB 
 -  local Azure Cosmos DB emulator:  
 -- run with *CosmosDB.Emulator.exe /EnableMongoDbEndpoint=3.6* flag for smooth connection of Mongo GUI (Studio 3T etc) and application development in more recent versions of MongoDB  
 -- it is possible to switch on and off the rate limiter and to scale it (because of the limit of request units)  
 -- has its own data explorer  https://localhost:8081/_explorer/index.html and provides the credentials needed to connect locally  

MongoDB and drivers compatibility:
https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/connect-using-mongoose

Mongoose: poor compatibility up to version 5.13.15 which does not fit current versions of typescript

MongoDB driver: 

 - Azure Cosmos DB for MongoDB is compatible with the server version 4.2, 4.0, 3.6, and 3.2. (5.x only preview)  
 -  for https://www.mongodb.com/docs/drivers/node/current/compatibility/ the latest driver for compatibility was chosen for its possible compatibility with server version 4.2  
 - 5+ MongoDB features must be avoided  
 - due to the above, Mongoose was not used, but a pure Node.js driver with custom type checking  
 - Cosmos DB "request units" and pricing must be considered https://cosmos.azure.com/capacitycalculator/ https://azure.microsoft.com/en-us/pricing/details/cosmos-db/autoscale-provisioned/  
 - GridFS storage integrated in the project, for storing objects larger than **2MB** (current limit of Cosmos DB)



**BullMQ** 

BullMQ was chosen as message broker - because of good compatibility with Node.js, Typescript and prime integration to Redis server https://docs.bullmq.io/ 

 - push/pull aka producer/consumer schema  
 - buildin ioredis integration (redis driver)  
 - death letter queue functionality  
 - possibility of resending  
 - monitoring via @bull-board lib https://github.com/felixmosh/bull-board   
 - possible to monitor/resend communication via GUI on **/bull/admin** URL from Receiver HTTP server  

**Logging**

- combination of Node.js AsyncLocalStorage (Als) and winstonjs logger
- entering the application on the HTTP server side, a new branch of the asynchronous Als runtime is created, which holds context(requestId) across the entire flow of the package
- then the context (requestId) is passed through the queue and workers to other applications, which create a new asynchronous flow with the original requestId
- example: http post > receiver package > express > requestId > als run > queue with requestId > personalisation package > worker subscribe > als run > requestId > logger with requestId


## App schema
TODO

## API
use https://swagger.io/ as HTTP API browser  
 - URL: **/api/docs** 
## Install, run, cmds, scripts..

- git clone
- yarn install (install npm packages)
- yarn run devel:build (build all packages (npx lerna run build))
- cd packages/xxx 
- create + fill .env file (system variables, secrets)  
- yarn run start

## Deploy, CI, GIT

TODO



