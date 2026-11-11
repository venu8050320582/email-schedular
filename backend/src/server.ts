
import "dotenv/config";
import { testRedisConnection } from "./config/redis";
import express from "express";
import cors from "cors";
import searchRoutes from "./routes/search.routes";

import { testDatabaseConnection } from "./config/database";

import emailRoutes from "./routes/email.routes";

import { errorHandler } from "./middleware/email.middleware";

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

// Welcome API
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Email Scheduler Backend Running!"
    });

});

// Health API
app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Backend is healthy"
    });

});

// Email routes
app.use("/api/emails", emailRoutes);

app.use("/api/search", searchRoutes);
// Error middleware must be last
app.use(errorHandler);

// Start server
const PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {

    try {

        await testDatabaseConnection();

        await testRedisConnection();

        app.listen(PORT, () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error("Server startup failed:", error);

        process.exit(1);
    }
};

void startServer();
