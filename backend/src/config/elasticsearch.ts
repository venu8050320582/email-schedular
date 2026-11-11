import "dotenv/config";
import { Client } from "@elastic/elasticsearch";

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

export const testElasticsearchConnection = async () => {
  try {
    const result = await elasticClient.ping();

    console.log("Elasticsearch Connected!", result);
  } catch (error) {
    console.error("Elasticsearch Connection Failed:", error);
    throw error;
  }
};

export default elasticClient;