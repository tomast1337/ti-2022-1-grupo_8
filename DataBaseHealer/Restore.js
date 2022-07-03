// Esse arquivo restaura o banco de dados do arquivo JSON.
// O arquivo JSON é salvo em ./DataBaseHealer/BackUp.json

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const prettier = require("prettier");
const fs = require("fs");
require("dotenv").config();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

if (!username || !password) {
    throw new Error("MongoDB username or password not found 🥺");
}

if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB URI not found 🥺");
}

const uri = process.env.MONGODB_URI.replace("<username>", username).replace(
    "<password>",
    password
);

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const databaseName = "PizzariaOn";

// Read data from the file 
const readData = async () => {
    const data = JSON.parse(fs.readFileSync("./DataBaseHealer/BackUp.json"));
    return data;
};

const getConnection = async () => {
    const connection = await client.connect();
    return connection;
};

// Create if not exists the database
const createDatabaseAndCollections = async (data) => {
    const connection = await getConnection();
    const database = connection.db(databaseName);
    const collections = await database.collections();
    // get the names of the collections form data keys
    const collectionNames = Object.keys(data);
    console.log(`Collections ${collections.length} 📚`);
    if (collections.length === 0) {
        collectionNames.forEach(async (collectionName) => {
            await database.createCollection(collectionName);
        });
    }
    console.log("Created collections 📚");
}

// Insert data into the database
const insertData = async () => {
    const data = await readData();
    createDatabaseAndCollections(data);
    const connection = await getConnection();
    const database = connection.db(databaseName);
    console.log("Restoring data ❤️‍🩹");
    for (const collectionName in Object.keys(data)) {
        const collection = database.collection(collectionName);
        const documents = data[collectionName];
        await collection.insertMany(documents);
        console.log(`Inserted ${documents.length} documents into ${collectionName} 📚`);
    }
    console.log("Restoring data finished 🏁");
}

// main function
const main = async () => {
    await insertData();
    // Exit 0
    process.exit(0);
}

// Run the main function
main();