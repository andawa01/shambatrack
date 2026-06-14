import dotenv from "dotenv";
import app from "./app.js";
import connectMongoDB from "./config/mongodb.js";
import { seedSystemAdmin } from "./seed/systemAdmin.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMongoDB();

  //await seedSystemAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
