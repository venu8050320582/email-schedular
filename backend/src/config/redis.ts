
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
});

redisConnection.on("connect", () => {
    console.log("Redis Connected Successfully!");
});

redisConnection.on("error", (error) => {
    console.error("Redis Error:", error.message);
});

export const testRedisConnection = async () => {
    const result = await redisConnection.ping();

    if (result !== "PONG") {
        throw new Error("Redis connection failed");
    }

    return result;
};

export default redisConnection;
