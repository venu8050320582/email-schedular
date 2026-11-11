import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Simply call config() without arguments. 
// If your server is run from inside the backend folder, it will automatically find the .env file.
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "email_scheduler",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const testDatabaseConnection = async () => {
    try {
        const [result] = await pool.query("SELECT 1 AS result");
        console.log("MySQL Connected Successfully!");
        return result;
    } catch (error) {
        console.error("MySQL Connection Failed:", error);
        throw error;
    }
};

export default pool;