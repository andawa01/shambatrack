import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/authRoute.js";
//import cooperativeRoutes from "./routes/cooperativeRoutes.js";
import systemAdminRoutes from "./routes/systemAdminRoutes.js";
import coopAdminRoutes from "./routes/coopAdminRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditLogRoutes from "./routes/auditLogRoute.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load("./docs/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/test", testRoutes);
app.use("/api", authRoutes);
//app.use("/api/cooperatives", cooperativeRoutes);
app.use("/api/system", systemAdminRoutes);
app.use("/api/coop-admin", coopAdminRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api", auditLogRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ShambaTrack API Running",
  });
});

export default app;
