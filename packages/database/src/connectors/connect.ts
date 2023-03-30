import {MongoClient} from 'mongodb';

const getDbClient = () => {
    return {
        cosmosDb,
    };
};

const cosmosDb = (uri: string) => {
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
