const fs = require("fs");
const path = require("path");
const archiver = require('archiver');
const { v5: uuidv5 } = require("uuid");
const { Document } = require("../../models/documents");
const { DocumentSyncQueue } = require("../../models/documentSyncQueue");
const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const ENABLE_S3 = process.env.ENABLE_S3 ? true : false;
const s3Client = ENABLE_S3 ? new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_AK,
    secretAccessKey: process.env.S3_SK,
  },
  s3ForcePathStyle: true, // MinIO 需要设置为 true
  forcePathStyle: true, // 同上，确保路径风格访问
}) : null;

const documentsPath =
  process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, `../../storage/documents`)
    : path.resolve(process.env.STORAGE_DIR, `documents`);
const sourcePath =
  process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, `../../storage/objects`)
    : path.resolve(process.env.STORAGE_DIR, `objects`);
const vectorCachePath =
  process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, `../../storage/vector-cache`)
    : path.resolve(process.env.STORAGE_DIR, `vector-cache`);


// Should take in a folder that is a subfolder of documents
// eg: youtube-subject/video-123.json
async function fileData(filePath = null) {
  if (!filePath) throw new Error("No docPath provided in request");
  const fullFilePath = path.resolve(documentsPath, normalizePath(filePath));
  if (!fs.existsSync(fullFilePath) || !isWithin(documentsPath, fullFilePath))
    return null;

  const data = fs.readFileSync(fullFilePath, "utf8");
  return JSON.parse(data);
}

async function viewLocalFiles() {
  if (!fs.existsSync(documentsPath)) fs.mkdirSync(documentsPath);
  const liveSyncAvailable = await DocumentSyncQueue.enabled();
  const directory = {
    name: "documents",
    type: "folder",
    items: [],
  };

  for (const file of fs.readdirSync(documentsPath)) {
    if (path.extname(file) === ".md") continue;
    const folderPath = path.resolve(documentsPath, file);
    const isFolder = fs.lstatSync(folderPath).isDirectory();
    if (isFolder) {
      const subdocs = {
        name: file,
        type: "folder",
        items: [],
      };
      const subfiles = fs.readdirSync(folderPath);

      for (const subfile of subfiles) {
        if (path.extname(subfile) !== ".json") continue;
        const filePath = path.join(folderPath, subfile);
        const rawData = fs.readFileSync(filePath, "utf8");
        const cachefilename = `${file}/${subfile}`;
        const { pageContent, ...metadata } = JSON.parse(rawData);
        const pinnedInWorkspaces = await Document.getOnlyWorkspaceIds({
          docpath: cachefilename,
          pinned: true,
        });
        const watchedInWorkspaces = liveSyncAvailable
          ? await Document.getOnlyWorkspaceIds({
            docpath: cachefilename,
            watched: true,
          })
          : [];

        subdocs.items.push({
          name: subfile,
          type: "file",
          ...metadata,
          cached: await cachedVectorInformation(cachefilename, true),
          pinnedWorkspaces: pinnedInWorkspaces,
          canWatch: liveSyncAvailable
            ? DocumentSyncQueue.canWatch(metadata)
            : false,
          // Is file watched in any workspace since sync updates all workspaces where file is referenced
          watched: watchedInWorkspaces.length !== 0,
        });
      }
      directory.items.push(subdocs);
    }
  }

  // Make sure custom-documents is always the first folder in picker
  directory.items = [
    directory.items.find((folder) => folder.name === "custom-documents"),
    ...directory.items.filter((folder) => folder.name !== "custom-documents"),
  ].filter((i) => !!i);

  return directory;
}

// Searches the vector-cache folder for existing information so we dont have to re-embed a
// document and can instead push directly to vector db.
async function cachedVectorInformation(filename = null, checkOnly = false) {
  if (!filename) return checkOnly ? false : { exists: false, chunks: [] };

  const digest = uuidv5(filename, uuidv5.URL);
  const file = path.resolve(vectorCachePath, `${digest}.json`);
  const exists = fs.existsSync(file);

  if (checkOnly) return exists;
  if (!exists) return { exists, chunks: [] };

  console.log(
    `Cached vectorized results of ${filename} found! Using cached data to save on embed costs.`
  );
  const rawData = fs.readFileSync(file, "utf8");
  return { exists: true, chunks: JSON.parse(rawData) };
}

// vectorData: pre-chunked vectorized data for a given file that includes the proper metadata and chunk-size limit so it can be iterated and dumped into Pinecone, etc
// filename is the fullpath to the doc so we can compare by filename to find cached matches.
async function storeVectorResult(vectorData = [], filename = null) {
  if (!filename) return;
  console.log(
    `Caching vectorized results of ${filename} to prevent duplicated embedding.`
  );
  if (!fs.existsSync(vectorCachePath)) fs.mkdirSync(vectorCachePath);

  const digest = uuidv5(filename, uuidv5.URL);
  const writeTo = path.resolve(vectorCachePath, `${digest}.json`);
  fs.writeFileSync(writeTo, JSON.stringify(vectorData), "utf8");
  return;
}

async function getSourceDocument(document = null) {
  if (!document) return;

  if (ENABLE_S3) {
    return getS3Document(document);
  }
  else {
    return getLocalFSDocument(document);
  }

}

async function getLocalFSDocument(document = null) {
  if (!document || !document.rawLocation) return;

  const location = document.rawLocation;
  try {
    // Create a readable stream
    const stream = fs.createReadStream(location, {
      encoding: 'utf8', // Specify the encoding (optional)
      highWaterMark: 64 * 1024 // Specify the buffer size (optional, default is 64KB)
    });
    return stream;
  } catch (error) {
    console.error("read local fs error:", error);
  }
}

async function getS3Document(document = null) {
  if (!document || !document.rawLocation) return;

  const objectKey = document.rawLocation;

  const getObjectCommand = new GetObjectCommand({
    Bucket: "default",
    Key: objectKey,
  });

  try {
    const response = await s3Client.send(getObjectCommand);
    const stream = response.Body;
    return stream
  } catch (e) {
    console.error(e.message, e);
    throw new Error("Invalid s3 getObjectCommand.");
  }
}

async function moveSourceDocument(from, to) {
  if (!from || !to) return;

  const fromMetaFilePath = path.join(documentsPath, normalizePath(from));
  const toMetaFilePath = path.join(documentsPath, normalizePath(to));

  const fromSourceFilePath = path.join(sourcePath, normalizePath(from));
  const toSourceFilePath = path.join(sourcePath, normalizePath(to));

  // Read metadata json file, update objectkey
  if (
    !fs.existsSync(fromMetaFilePath) ||
    !fs.lstatSync(fromMetaFilePath).isFile()
  ) return;

  try {
    const metadataFile = fs.readFileSync(fromMetaFilePath, 'utf8');
    const metaData = JSON.parse(metadataFile);

    if (ENABLE_S3) {
      let fromObjectKey = metaData.rawLocation;
      let destinationObjectKey = path.join(path.dirname(to), path.basename(fromObjectKey)).replaceAll("\\", "/");
      metaData.rawLocation = destinationObjectKey;
      // Update metadata json file
      const updatedData = JSON.stringify(metaData, null, 2); // Pretty print with 2 spaces
      fs.writeFileSync(toMetaFilePath, updatedData, 'utf8');
      // Update source file
      moveS3Document(fromObjectKey, destinationObjectKey);
    } else {
      let fromLocation = metaData.rawLocation;
      let destinationFilePath = path.join(path.dirname(toSourceFilePath), path.basename(fromLocation));
      metaData.rawLocation = destinationFilePath;
      // Update metadata json file
      const updatedData = JSON.stringify(metaData, null, 2); // Pretty print with 2 spaces
      fs.writeFileSync(toMetaFilePath, updatedData, 'utf8');
      // Update Source file
      movelocalFSDocument(fromLocation, destinationFilePath)
    }
    // Remove old metadata file
    fs.rmSync(fromMetaFilePath);
  } catch (error) {
    console.error('Error in moving files:', error);
    //remove temp file in case of error
    if (
      fs.existsSync(toMetaFilePath) &&
      fs.lstatSync(toMetaFilePath).isFile()
    ) fs.rmSync(toMetaFilePath);
  }
}

async function movelocalFSDocument(fromLocation = null, toLocation = null) {
  if (!fromLocation || !toLocation) return;
  try {
    fs.mkdirSync(path.dirname(toLocation), { recursive: true });;
    fs.renameSync(fromLocation, toLocation);
    console.log("completed move file");
    return;
  } catch (error) {
    console.error("Error rename object:", error);
    throw new Error("Invalid fs rename operation.");
  }
}

async function moveS3Document(fromObjectKey = null, toObjectKey = null) {
  if (!fromObjectKey || !toObjectKey) return;

  const copyObjectCommand = new CopyObjectCommand({
    Bucket: "default",
    CopySource: `default/${fromObjectKey}`,
    Key: toObjectKey,
  });

  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: "default",
    Key: fromObjectKey,
  });

  try {
    await s3Client.send(copyObjectCommand);
    await s3Client.send(deleteObjectCommand);
    console.log("completed object copy");
    return;
    // 复制成功，可以继续后续操作
  } catch (error) {
    console.error("Error copying object:", error);
    throw new Error("Invalid s3 copyObjectCommand.");
  }
}

//@DEBUG @ktchan @S3A @TODO @(4) Delete
// 1. Put file into S3A storage
// 2. Get object from s3a
// 3. Change to download files from server
// 4. Remove data from s3a
// 5. Move file in s3
async function purgeSourceDocument(filename = null) {
  if (!filename) return;
  if (ENABLE_S3) {
    return purgeS3Document(filename);
  }
  else {
    return purgeLocalFSDocument(filename);
  }
}

async function purgeLocalFSDocument(filename = null) {
  if (!filename) return;

  const metaFilePath = path.resolve(documentsPath, normalizePath(filename));
  const data = fs.readFileSync(metaFilePath);
  let srcFilePath;
  try {
    // 将 JSON 字符串解析为 JavaScript 对象
    const metaData = JSON.parse(data);
    srcFilePath = metaData.rawLocation;
  } catch (error) {
    console.error("fail to read metadata file", error)
  }

  console.log(`Purging source document of ${srcFilePath}.`);
  fs.rmSync(srcFilePath);
  return;

}

async function purgeS3Document(filename = null) {
  if (!filename) return;
  const filePath = path.resolve(documentsPath, normalizePath(filename));

  if (
    !fs.existsSync(filePath) ||
    !isWithin(documentsPath, filePath) ||
    !fs.lstatSync(filePath).isFile()
  ) return;

  //Read object to get objectkey
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      throw new Error("Invalid path: metadata json file is not exist.");
    }

    try {
      // 将 JSON 字符串解析为 JavaScript 对象
      const metaData = JSON.parse(data);

      // 根据键获取数据
      const id = metaData.id;
      const objectKey = metaData.rawLocation;

      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: "default",
        Key: objectKey,
      });

      const response = await s3Client.send(deleteObjectCommand);
      console.log(response);
    } catch (error) {
      console.error('Error in deleting object from s3:', error);
    }
  });

  return;
}

async function purgeServerDocument(filename = null) {
  if (!filename) return;
  const filePath = path.resolve(documentsPath, normalizePath(filename));

  if (
    !fs.existsSync(filePath) ||
    !isWithin(documentsPath, filePath) ||
    !fs.lstatSync(filePath).isFile()
  )
    return;

  console.log(`Purging document metadata of ${filename}.`);
  fs.rmSync(filePath);
  return;
}

// Purges a vector-cache file from the vector-cache/ folder.
async function purgeVectorCache(filename = null) {
  if (!filename) return;
  const digest = uuidv5(filename, uuidv5.URL);
  const filePath = path.resolve(vectorCachePath, `${digest}.json`);

  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) return;
  console.log(`Purging vector-cache of ${filename}.`);
  fs.rmSync(filePath);
  return;
}

// Search for a specific document by its unique name in the entire `documents`
// folder via iteration of all folders and checking if the expected file exists.
async function findDocumentInDocuments(documentName = null) {
  if (!documentName) return null;
  for (const folder of fs.readdirSync(documentsPath)) {
    const isFolder = fs
      .lstatSync(path.join(documentsPath, folder))
      .isDirectory();
    if (!isFolder) continue;

    const targetFilename = normalizePath(documentName);
    const targetFileLocation = path.join(documentsPath, folder, targetFilename);

    if (
      !fs.existsSync(targetFileLocation) ||
      !isWithin(documentsPath, targetFileLocation)
    )
      continue;

    const fileData = fs.readFileSync(targetFileLocation, "utf8");
    const cachefilename = `${folder}/${targetFilename}`;
    const { pageContent, ...metadata } = JSON.parse(fileData);
    return {
      name: targetFilename,
      type: "file",
      ...metadata,
      cached: await cachedVectorInformation(cachefilename, true),
    };
  }

  return null;
}

/**
 * Checks if a given path is within another path.
 * @param {string} outer - The outer path (should be resolved).
 * @param {string} inner - The inner path (should be resolved).
 * @returns {boolean} - Returns true if the inner path is within the outer path, false otherwise.
 */
function isWithin(outer, inner) {
  if (outer === inner) return false;
  const rel = path.relative(outer, inner);
  return !rel.startsWith("../") && rel !== "..";
}

function normalizePath(filepath = "") {
  const result = path
    .normalize(filepath.trim())
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .trim();
  if (["..", ".", "/"].includes(result)) throw new Error("Invalid path.");
  return result;
}

// Check if the vector-cache folder is empty or not
// useful for it the user is changing embedders as this will
// break the previous cache.
function hasVectorCachedFiles() {
  try {
    return (
      fs.readdirSync(vectorCachePath)?.filter((name) => name.endsWith(".json"))
        .length !== 0
    );
  } catch { }
  return false;
}

module.exports = {
  findDocumentInDocuments,
  cachedVectorInformation,
  viewLocalFiles,
  getSourceDocument,
  moveSourceDocument,
  purgeS3Document,
  purgeSourceDocument,
  purgeServerDocument,
  purgeVectorCache,
  storeVectorResult,
  fileData,
  normalizePath,
  isWithin,
  documentsPath,
  hasVectorCachedFiles,
};
