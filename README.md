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
 - je nutno pocitat s Cosmos DB "request units" a pricingem  https://cosmos.azure.com/capacitycalculator/  https://azure.microsoft.com/en-us/pricing/details/cosmos-db/autoscale-provisioned/  
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
TBD

## App schema
TODO

## API
use https://swagger.io/ as HTTP API browser  
 - URL: **/api/docs** 
## Install, run, cmds, scripts..

TODO.

## Deploy, CI, GIT

TODO



