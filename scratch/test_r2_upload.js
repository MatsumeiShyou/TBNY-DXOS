import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// 手動で .env をパース
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, value] = line.split("=");
  if (key && value) env[key.trim()] = value.trim();
});

const config = {
  accessKeyId: env.VITE_R2_ACCESS_KEY_ID,
  secretAccessKey: env.VITE_R2_SECRET_ACCESS_KEY,
  endpoint: env.VITE_R2_ENDPOINT,
  bucket: env.VITE_R2_BUCKET_NAME,
};

console.log("--- R2 Connection Test (Standalone) ---");
console.log("Endpoint:", config.endpoint);
console.log("Bucket:", config.bucket);

if (!config.accessKeyId) {
  console.error("Error: VITE_R2_ACCESS_KEY_ID is missing in .env");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function runTest() {
  try {
    console.log("\n1. Testing ListObjects...");
    const listRes = await client.send(new ListObjectsV2Command({ Bucket: config.bucket }));
    console.log("Success! Current objects count:", listRes.KeyCount || 0);

    console.log("\n2. Testing Upload (test-cli.txt)...");
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: "test-cli.txt",
      Body: "Hello R2 from CLI test script at " + new Date().toISOString(),
      ContentType: "text/plain",
    }));
    console.log("Upload Success!");

  } catch (err) {
    console.error("\n[ERROR] Connection failed:");
    console.error(err.message || err);
    if (err.name === 'InvalidAccessKeyId') console.error("-> Access Key ID が間違っている可能性があります。");
    if (err.name === 'SignatureDoesNotMatch') console.error("-> Secret Access Key が間違っている可能性があります。");
  }
}

runTest();
