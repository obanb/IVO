import {MongoClient} from 'mongodb';

const getDbClient = () => {
    return {
        cosmosDb,
    };
};

const cosmosDb = () => {
    const uri =
        'mongodb://localhost:C2y6yDjf5%2FR%2Bob0N8A7Cgv30VRDJIWEHLM%2B4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw%2FJw%3D%3D@localhost:10255/admin?ssl=true';

    const options = {
        connectTimeoutMS: 3600000,
        socketTimeoutMS: 3600000,
        useUnifiedTopology: true,
        //needed for local development with Azure CosmosDb emulator
        rejectUnauthorized: false,
        retrywrites: false,
    };

    const client = new MongoClient(uri, options);

    return client;
};

export const connect = {
    getDbClient,
};
