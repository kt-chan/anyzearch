const asPdf = require("../../collector/processSingleFile/convert/asPDF/index");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { PassThrough, Readable } = require("stream");
const tar = require("tar");
const zlib = require("zlib");

// Mocking dependencies
jest.mock("fs");
jest.mock("tar", () => ({
  x: jest.fn(),
}));
jest.mock("zlib", () => ({
  createGunzip: jest.fn(),
}));
jest.mock("../../collector/utils/files", () => ({
  createdDate: jest.fn(() => "2026-03-11"),
  trashFile: jest.fn(),
  writeToServerDocuments: jest.fn((args) => ({
    ...args.data,
    location: "custom-documents/test.json",
  })),
  assetsFolder: "/mock/assets",
}));
jest.mock("../../collector/utils/tokenizer", () => ({
  tokenizeString: jest.fn(() => 100),
}));
jest.mock("../../collector/processSingleFile/convert/asPDF/PDFLoader", () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue([{ pageContent: "local content", metadata: {} }]),
  }));
});
jest.mock("../../collector/utils/OCRLoader", () => {
  return jest.fn().mockImplementation(() => ({
    ocrPDF: jest.fn().mockResolvedValue([{ pageContent: "ocr content", metadata: {} }]),
  }));
});

describe("asPdf with MinerU integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    
    // Default fetch mock
    global.fetch = jest.fn();

    // Default stream mocks
    zlib.createGunzip.mockImplementation(() => new PassThrough());
    tar.x.mockImplementation(() => {
        const s = new PassThrough();
        process.nextTick(() => s.emit('finish'));
        return s;
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("should use MinerU when MINERU_API_ENDPOINT is set and service succeeds", async () => {
    process.env.MINERU_API_ENDPOINT = "http://localhost:8080/v1/pdf/parse";
    process.env.MINERU_ENABLE_IMAGES = "true";

    const mockMdContent = "MinerU extracted content with image: ![img](images/fig1.png)";
    
    // Mock fs.readFileSync for the input PDF
    fs.readFileSync.mockReturnValue(Buffer.from("pdf data"));
    // Mock fs.existsSync
    fs.existsSync.mockReturnValue(true);
    // Mock fs.readdirSync to find .md and images
    fs.readdirSync.mockImplementation((p) => {
      if (p.includes("images")) return ["fig1.png"];
      return ["output", "test.md", "images"];
    });
    // Mock fs.lstatSync for directory check
    fs.lstatSync.mockReturnValue({ isDirectory: () => true });
    // Mock fs.readFileSync for the extracted .md file
    fs.readFileSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.endsWith(".md")) return mockMdContent;
      return Buffer.from("pdf data");
    });

    // Mock fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/gzip" },
      body: { getReader: () => {} } // Minimal mock for Readable.fromWeb
    });

    // Mock Readable.fromWeb
    const ReadableFromWebSpy = jest.spyOn(Readable, 'fromWeb').mockImplementation(() => {
      const s = new PassThrough();
      process.nextTick(() => s.end());
      return s;
    });
    
    const result = await asPdf({
      fullFilePath: "/path/to/test.pdf",
      filename: "test.pdf",
      options: {}
    });

    expect(result.success).toBe(true);
    expect(result.documents[0].pageContent).toContain("/system/doc-images/");
    expect(result.documents[0].pageContent).toContain("MinerU extracted content");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/pdf/parse",
      expect.any(Object)
    );
    
    ReadableFromWebSpy.mockRestore();
  });

  test("should fallback to local parsing when MinerU fails", async () => {
    process.env.MINERU_API_ENDPOINT = "http://localhost:8080/v1/pdf/parse";
    
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    const result = await asPdf({
      fullFilePath: "/path/to/test.pdf",
      filename: "test.pdf",
      options: {}
    });

    expect(result.success).toBe(true);
    expect(result.documents[0].pageContent).toBe("local content");
    expect(result.documents[0].docAuthor).not.toBe("MinerU extracted");
  });

  test("should use local parsing when MINERU_API_ENDPOINT is not set", async () => {
    delete process.env.MINERU_API_ENDPOINT;

    const result = await asPdf({
      fullFilePath: "/path/to/test.pdf",
      filename: "test.pdf",
      options: {}
    });

    expect(result.success).toBe(true);
    expect(result.documents[0].pageContent).toBe("local content");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
