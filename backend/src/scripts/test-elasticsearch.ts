import "dotenv/config";
import { testElasticsearchConnection } from "../config/elasticsearch";

async function main() {
  try {
    await testElasticsearchConnection();
    console.log("Phase 6 connection test passed!");
  } catch (error) {
    console.error("Connection test failed:", error);
    process.exitCode = 1;
  }
}

void main();