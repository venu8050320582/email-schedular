
import { Queue } from "bullmq";

import redisConnection from "../config/redis";

// Create email queue
export const emailQueue = new Queue("email-queue", {
    connection: redisConnection,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 5000
        },

        removeOnComplete: {
            age: 86400,
            count: 1000
        },

        removeOnFail: false
    }
});

console.log("Email Queue Initialized!");
