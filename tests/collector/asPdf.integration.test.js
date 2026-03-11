const asPdf = require("../../collector/processSingleFile/convert/asPDF/index");
const path = require("path");
const fs = require("fs");
const { assetsFolder } = require("../../collector/utils/files");

// Manually load .env from various locations if available
[
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../server/.env"),
    path.resolve(__dirname, "../../collector/.env")
].forEach(envPath => {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || "";
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
});

describe("asPdf MinerU Integration Test", () => {
  const testPdfPath = path.resolve(__dirname, "../resources/test-doc.pdf");
  const expectedMdPath = path.resolve(__dirname, "../resources/test-doc.md");

  beforeAll(() => {
    if (!process.env.MINERU_API_ENDPOINT) {
      console.warn("MINERU_API_ENDPOINT not set, skipping integration test.");
    }
  });

  test("should successfully process test-doc.pdf via MinerU", async () => {
    if (!process.env.MINERU_API_ENDPOINT) return;

    console.log(`Testing against MinerU at: ${process.env.MINERU_API_ENDPOINT}`);

    const result = await asPdf({
      fullFilePath: testPdfPath,
      filename: "test-doc.pdf",
      options: { parseOnly: true }
    });

    expect(result.success).toBe(true);
    expect(result.documents.length).toBeGreaterThan(0);
    
    const content = result.documents[0].pageContent;
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);

    // If we have an expected markdown, we can check some keywords
    if (fs.existsSync(expectedMdPath)) {
        const expectedMd = fs.readFileSync(expectedMdPath, "utf8");
        // Check for some key phrases from the document
        expect(content).toContain("Huawei OceanStor A800");
        expect(content).toContain("Ultra Performance");
    }

    console.log("Integration test passed!");
  }, 60000); // 1 minute timeout for real API call
});
