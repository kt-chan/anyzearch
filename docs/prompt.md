# Task 1

### **Role**

You are an expert Full-stack Engineer specializing in Node.js, stream processing, and document conversion. Your task is to refactor the  **AnyZearch** (fork from AnythingLLM) document processing pipeline to integrate the **MinerU FastAPI** service, handling its compressed `.tar.gz` output and mapping it to the internal workspace schema.

### **Technical Context**

AnythingLLM's `collector` currently expects raw text or simple PDF objects. You will modify this to:

1. Send the PDF to `http://localhost:8080/v1/pdf/parse`.
2. Receive an `application/gzip` binary stream.
3. Extract the `.md` (Markdown) file for text indexing and the `/images` folder for visual context.

### **Scanning & Analysis Phase**

Analyze these files to determine the best point for "In-Flight" extraction:

* **Collector:** `@collector/processSingleFile/convert/asPDF/index.js` — Determine how to swap `pdf-parse` for a custom `fetch` call and a decompression library (e.g., `tar` or `zlib`).
* **Storage Logic:** Check `@collector/utils/index.js` or similar to see how processed files are moved to the `storage/documents` directory.
* **Server:** `@server/endpoints/workspaces.js` — Ensure the API can handle the newly extracted image references from MinerU.

### **Implementation Requirements**

* **Stream Handling & Extraction:**
* Use a streaming approach to handle the `application/gzip` response to minimize memory footprint.
* Extract the primary `.md` file. This content will become the `textContent` of the document object.
* Extract the accompanying `images/` directory and store it in a path accessible by the AnythingLLM frontend (e.g., within the workspace's upload directory).


* **Reference Remapping:**
* MinerU produces Markdown with local image paths. You must update these paths in the `.md` string to match the final storage location in AnythingLLM so that images render correctly in the chat UI.


* **Service Fallback:**
* If the MinerU service fails or the `.tar.gz` is corrupted, default back to the local `asPDF` logic to prevent "silent failures" in the upload UI.


* **Environment Configuration:**
* Define `MINERU_API_ENDPOINT` and `MINERU_ENABLE_IMAGES=true` in the `.env` file.



### **Strict Constraints**
* **Memory Management:** Do not load the entire `.tar.gz` into a buffer if possible; use `node:stream` pipes for extraction.
* **Proxy Compatibility:** Respect the existing `HTTP_PROXY` and `NO_PROXY` settings for the `localhost` MinerU call.
* **Cleanup:** Ensure temporary `.tar.gz` files or extraction artifacts are purged after the embedding process is complete.
* **Environment** 
1. This is a windows environment, running in powershell. 
2. The test pdf and its markdown output is available at @tests/resources/. 
3. you should test against the mineru endpoints provided at @.env file at root directory



# Task 2