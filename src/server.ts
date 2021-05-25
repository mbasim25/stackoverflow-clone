import http from "http";
import { PrismaClient } from "@prisma/client";
import app from "./app";
import { secrets } from "./utils";

// Create the server
const server = http.createServer(app);

// Create prisma object
const prisma = new PrismaClient();

// Start listening
server.listen(secrets.PORT, () => {
  console.log(`💻 App listening on port http://localhost:${secrets.PORT}`);
});

export { prisma };
