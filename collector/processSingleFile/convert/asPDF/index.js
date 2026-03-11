const { v4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const tar = require("tar");
const { Readable } = require("stream");
const {
  createdDate,
  trashFile,
  writeToServerDocuments,
  assetsFolder,
} = require("../../../utils/files");
const { tokenizeString } = require("../../../utils/tokenizer");
const { default: slugify } = require("slugify");
const PDFLoader = require("./PDFLoader");
const OCRLoader = require("../../../utils/OCRLoader");

async function useMinerU(fullFilePath, filename, options, docId) {
  const mineruEndpoint = process.env.MINERU_API_ENDPOINT;
  if (!mineruEndpoint) return { success: false };

  console.log(`[asPDF] Sending ${filename} to MinerU at ${mineruEndpoint}...`);

  try {
    const fileBuffer = fs.readFileSync(fullFilePath);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fileBuffer], { type: "application/pdf" }),
      filename
    );

    if (process.env.MINERU_ENABLE_IMAGES === "true") {
      formData.append("enable_images", "true");
    }

    const response = await fetch(mineruEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`[asPDF] MinerU responded with status ${response.status}`);
      return { success: false };
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/gzip")) {
      console.error(
        `[asPDF] MinerU responded with unexpected content-type: ${contentType}`
      );
      return { success: false };
    }

    const tempExtractPath = path.resolve(
      __dirname,
      "../../../storage/tmp",
      docId
    );
    if (!fs.existsSync(tempExtractPath))
      fs.mkdirSync(tempExtractPath, { recursive: true });

    const stream = Readable.fromWeb(response.body);
    const extract = tar.x({ cwd: tempExtractPath });

    await new Promise((resolve, reject) => {
      stream
        .pipe(zlib.createGunzip())
        .pipe(extract)
        .on("finish", resolve)
        .on("error", reject);
    });

    const extractedItems = fs.readdirSync(tempExtractPath);
    if (extractedItems.length === 0)
      throw new Error("MinerU output is empty.");

    const fullExtractedPath = path.join(tempExtractPath, extractedItems[0]);
    if (!fs.lstatSync(fullExtractedPath).isDirectory()) {
      // If it's not a directory, maybe it extracted directly into tempExtractPath
      // But usually MinerU tars a single folder.
    }

    // Try to find .md file in fullExtractedPath or tempExtractPath
    let mdFilePath = fs
      .readdirSync(fullExtractedPath)
      .find((f) => f.endsWith(".md"));
    let searchPath = fullExtractedPath;

    if (!mdFilePath) {
      mdFilePath = fs.readdirSync(tempExtractPath).find((f) => f.endsWith(".md"));
      searchPath = tempExtractPath;
    }

    if (!mdFilePath) throw new Error("No .md file found in MinerU output");

    let mdContent = fs.readFileSync(path.join(searchPath, mdFilePath), "utf8");

    // Handle images and other content
    const targetDocContentDir = path.join(assetsFolder, "doc-content", docId);
    if (!fs.existsSync(targetDocContentDir))
      fs.mkdirSync(targetDocContentDir, { recursive: true });

    // Copy original PDF
    fs.copyFileSync(fullFilePath, path.join(targetDocContentDir, filename));

    // Save updated Markdown
    const fileStem = path.parse(filename).name;
    const targetMdPath = path.join(targetDocContentDir, `${fileStem}.md`);

    const imagesDir = path.join(searchPath, "images");
    if (
      fs.existsSync(imagesDir) &&
      process.env.MINERU_ENABLE_IMAGES === "true"
    ) {
      const targetImagesDir = path.join(targetDocContentDir, "images");
      if (!fs.existsSync(targetImagesDir))
        fs.mkdirSync(targetImagesDir, { recursive: true });

      const images = fs.readdirSync(imagesDir);
      for (const image of images) {
        fs.copyFileSync(
          path.join(imagesDir, image),
          path.join(targetImagesDir, image)
        );
      }

      // Remap links in mdContent for the stored file to be relative.
      const diskMdContent = mdContent.replace(
        /!\[(.*?)\]\(images\/(.*?)\)/g,
        `![$1](./images/$2)`
      );
      fs.writeFileSync(targetMdPath, diskMdContent, "utf8");

      // Remap links in mdContent for the database/UI to be absolute.
      mdContent = mdContent.replace(
        /!\[(.*?)\]\(images\/(.*?)\)/g,
        `![$1](/system/doc-content/${docId}/images/$2)`
      );
    } else {
      // If no images, still save the md file
      fs.writeFileSync(targetMdPath, mdContent, "utf8");
    }

    // Cleanup
    try {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    } catch (e) {
      console.error(`[asPDF] Could not cleanup temp path ${tempExtractPath}:`, e.message);
    }

    return {
      success: true,
      pageContent: mdContent,
    };
  } catch (e) {
    console.error(`[asPDF] MinerU processing error:`, e.message);
    return { success: false };
  }
}

async function asPdf({ fullFilePath = "", filename = "", options = {} }) {
  const docId = v4();

  if (process.env.MINERU_API_ENDPOINT) {
    const mineruResult = await useMinerU(
      fullFilePath,
      filename,
      options,
      docId
    );
    if (mineruResult.success) {
      const content = mineruResult.pageContent;
      const data = {
        id: docId,
        url: "file://" + fullFilePath,
        title: filename,
        docAuthor: "MinerU extracted",
        description: "Processed via MinerU service.",
        docSource: "pdf file uploaded by the user.",
        chunkSource: "",
        published: createdDate(fullFilePath),
        wordCount: content.split(" ").length,
        pageContent: content,
        token_count_estimate: tokenizeString(content),
      };

      const document = writeToServerDocuments({
        data,
        filename: `${slugify(filename)}-${data.id}`,
        options: { parseOnly: options.parseOnly },
      });
      trashFile(fullFilePath);
      console.log(
        `[SUCCESS]: ${filename} converted via MinerU & ready for embedding.\n`
      );
      return { success: true, reason: null, documents: [document] };
    }
    console.log(`[asPDF] MinerU failed or returned no content, falling back to local parse.`);
  }

  const pdfLoader = new PDFLoader(fullFilePath, {
    splitPages: true,
  });

  console.log(`-- Working ${filename} --`);
  const pageContent = [];
  let docs = await pdfLoader.load();

  if (docs.length === 0) {
    console.log(
      `[asPDF] No text content found for ${filename}. Will attempt OCR parse.`
    );
    docs = await new OCRLoader({
      targetLanguages: options?.ocr?.langList,
    }).ocrPDF(fullFilePath);
  }

  for (const doc of docs) {
    console.log(
      `-- Parsing content from pg ${
        doc.metadata?.loc?.pageNumber || "unknown"
      } --`
    );
    if (!doc.pageContent || !doc.pageContent.length) continue;
    pageContent.push(doc.pageContent);
  }

  if (!pageContent.length) {
    console.error(`[asPDF] Resulting text content was empty for ${filename}.`);
    trashFile(fullFilePath);
    return {
      success: false,
      reason: `No text content found in ${filename}.`,
      documents: [],
    };
  }

  const content = pageContent.join("");
  const data = {
    id: docId,
    url: "file://" + fullFilePath,
    title: filename,
    docAuthor: docs[0]?.metadata?.pdf?.info?.Creator || "no author found",
    description: docs[0]?.metadata?.pdf?.info?.Title || "No description found.",
    docSource: "pdf file uploaded by the user.",
    chunkSource: "",
    published: createdDate(fullFilePath),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content),
  };

  const document = writeToServerDocuments({
    data,
    filename: `${slugify(filename)}-${data.id}`,
    options: { parseOnly: options.parseOnly },
  });
  trashFile(fullFilePath);
  console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
  return { success: true, reason: null, documents: [document] };
}

module.exports = asPdf;
