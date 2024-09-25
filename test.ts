import {
    Document,
    VectorStoreIndex,
    PostgresDocumentStore,
    PostgresIndexStore,
    storageContextFromDefaults,
  } from "llamaindex";
  import pg from 'pg';
  
  const { Client } = pg;
  
  // Configure PostgreSQL client
  const pgClient = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
  });
  
  // Function to initialize and configure storage context
  async function initializeStorageContext() {
    try {
      await pgClient.connect();
      console.log("Connected to PostgreSQL!");
  
      // Initialize PostgresDocumentStore and PostgresIndexStore
      const docStore = new PostgresDocumentStore({
        client: pgClient
      });
  
      const indexStore = new PostgresIndexStore({
        client: pgClient,
      });
  
      // Configure storage context
      const storageContext = await storageContextFromDefaults({
        docStore,
        indexStore,
      });
  
      return { storageContext, docStore }; // Return both the storageContext and docStore
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      throw error; // Rethrow to handle in the caller
    }
  }
  
  // Function to retrieve a document using PostgresDocumentStore
  async function retrieveDocument(docStore: PostgresDocumentStore, documentId: string) {
    try {
      const document = await docStore.getDocument(documentId); // Retrieve document by ID
      if (document) {
        console.log("Document retrieved:", document);
      } else {
        console.log("No document found with the given ID.");
      }
    } catch (error) {
      console.error("Error retrieving document:", error);
    }
  }

  // Function to create and index a document
  async function createAndIndexDocument(storageContext: any) {
    try {
      const document = new Document({ text: "Test Text" });
      const index = await VectorStoreIndex.fromDocuments([document], {
        storageContext,
      });
      console.log("Index created:", index);
      // const documentId = index.
    
    } catch (error) {
      console.error("Error creating and indexing document:", error);
    }
  }
  
  // Main function to run the flow
  async function main() {
    let storageContext: any = null;
    let docStore: PostgresDocumentStore | null = null;
  
    try {
      // Initialize storage context and docStore
      const result = await initializeStorageContext();
      storageContext = result.storageContext;
      docStore = result.docStore;
  
      // Optionally create and index a document
      await createAndIndexDocument(storageContext);
  
      // Retrieve a document by ID
      const documentId = 'your_document_id_here'; // Use the actual document ID you want to retrieve
      await retrieveDocument(docStore, documentId);
  
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
  
  