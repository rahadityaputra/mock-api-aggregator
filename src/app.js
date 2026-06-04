import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import path from "node:path";

import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import openApiSpec from "./docs/openapi.js";

const app = express();

// Keep the mock API permissive so it behaves like a local marketplace sandbox.
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Marketplace",
            "X-Webhook-Secret",
            "X-Internal-Secret",
        ],
        credentials: false,
    }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api-docs.json", (req, res) => {
    res.status(200).json(openApiSpec);
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { explorer: true }),
);

const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

app.get("/", (req, res) => {
    res.status(200).json({
        name: "Mock Multi-Marketplace Backend",
        version: "1.0.0",
        description: "Marketplace simulator for Shopee, Tokopedia, and Lazada",
        baseUrl: "/api",
        endpoints: {
            health: "GET /health",
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                profile: "GET /api/auth/me",
            },
            marketplace: {
                note: "Replace :marketplace with shopee | tokopedia | lazada",
                products: {
                    list: "GET /api/:marketplace/products",
                    detail: "GET /api/:marketplace/products/:id",
                    create: "POST /api/:marketplace/products",
                    update: "PATCH /api/:marketplace/products/:id",
                    delete: "DELETE /api/:marketplace/products/:id",
                    updateStock: "PATCH /api/:marketplace/products/:id/stock",
                },
                orders: {
                    create: "POST /api/:marketplace/orders",
                    list: "GET /api/:marketplace/my-orders",
                    detail: "GET /api/:marketplace/orders/:id",
                },
                webhook: {
                    receiver: "POST /api/webhooks/:marketplace",
                },
                operations: {
                    simulateError: "POST /api/:marketplace/simulate-error",
                },
            },
        },
    });
});

app.use("/api", apiRoutes);
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "Mock Marketplace API",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
