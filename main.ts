import {
    Document,
    VectorStoreIndex,
    PostgresDocumentStore,
    PostgresIndexStore,
    storageContextFromDefaults,
  } from "llamaindex"
import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config();
  const { Client } = pg
  
  
  
  
  // Configure PostgreSQL client
  const pgClient = new Client({
    user: process.env.PGUSER || 'postgres',            // 'postgres' is the default user
    host: process.env.PGHOST || 'localhost',           // You connected to 'localhost'
    database: process.env.PGDATABASE || 'postgres',    // Default database is 'postgres'
    password: process.env.PGPASSWORD || 'example',     // The password you set in the `docker-compose.yml` file
    port: Number(process.env.PGPORT) || 5432,          // Default PostgreSQL port is 5432
  });
  
  // Function to initialize and configure storage context
  async function initializeStorageContext() {
    try {
      // Connect to the PostgreSQL client
      await pgClient.connect();
      console.log("Connected to PostgreSQL!");
  
      // Configure the storage context for the Postgres document and index stores
      const storageContext = await storageContextFromDefaults({
        docStore: new PostgresDocumentStore({
          client: pgClient
        }),
        indexStore: new PostgresIndexStore({
          client: pgClient,
        }),
      });
  
      return storageContext;
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  
  // Function to create and index a document
  async function createAndIndexDocument(storageContext: any) {
    try {
      const document = new Document({ text: "Test Text" });
      const index = await VectorStoreIndex.fromDocuments([document], {
        storageContext,
      });
      console.log("Index created:xxxx", index, '&&&&&&&&&&&&&&&&&');
    } catch (error) {
      console.error("Error creating and indexing document:", error);
    }
  }
  
  // Main function to run the flow
  async function main() {
    let storageContext: any = null;
  
    try {
      storageContext = await initializeStorageContext();
      await createAndIndexDocument(storageContext);
    } catch (error) {
      console.error("An error occurred during the main process:", error);
    } finally {
      // Close the PostgreSQL connection when done
      if (pgClient) {
        await pgClient.end();
        console.log("PostgreSQL connection closed.");
      }
    }
  }
  
  // Execute the main function
  main();
  