process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { default: slugify } = require("slugify");
const { MimeDetector } = require("./mime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const ENABLE_S3 = process.env.ENABLE_S3;
const s3Client = ENABLE_S3 ? (function () {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_AK,
      secretAccessKey: process.env.S3_SK,
    },
    s3ForcePathStyle: true, // MinIO requires this to be true
    forcePathStyle: true, // Ensures path-style addressing is used
  });
})() : null;

const defaultStoragePath =
  process.env.NODE_ENV === "development"
    ? path.resolve(
      __dirname,
      "../../../server/storage"
    )
    : path.resolve(process.env.STORAGE_DIR);

function splitFilePath(filePath) {
  // Normalize the path to handle differences between Windows and Linux
  const normalizedPath = path.normalize(filePath);

  // Split the path into components
  const parts = normalizedPath.split(path.sep);

  return parts;
}

// Function to upload a file to S3
function putObject(bucketName, objectKey, filePath) {
  try {
    // Create a Readable Stream for the file
    const fileStream = fs.readFileSync(filePath);

    // Create the PutObjectCommand
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileStream,
    });

    // Send the command to upload the object
    s3Client.send(putObjectCommand);
    console.log(`Object ${objectKey} uploaded successfully to ${bucketName}.`);
  } catch (err) {
    console.error("Error uploading object:", err);
  }
}

function copyFile(sourceFilePath, destinationFilePath) {
  try {
    const data = fs.readFileSync(sourceFilePath);
    fs.writeFileSync(destinationFilePath, data);
    console.log('File copied successfully');
  } catch (err) {
    console.error('Error copying the file:', err);
  }
}

function isTextType(filepath) {
  try {
    if (!fs.existsSync(filepath)) return false;
    const mimeLib = new MimeDetector();
    const mime = mimeLib.getType(filepath);
    if (mimeLib.badMimes.includes(mime)) return false;

    const type = mime.split("/")[0];
    if (mimeLib.nonTextTypes.includes(type)) return false;
    return true;
  } catch (err) {
    console.error('Error checking file exist:', err);
    return false;
  }
}

function trashFile(filepath) {
  if (!fs.existsSync(filepath)) return;

  try {
    const stats = fs.lstatSync(filepath);
    if (stats.isDirectory()) return;
  } catch (err) {
    console.error('Error checking filetype symbolic link lstatSync & isDirectory:', err);
    return;
  }

  fs.rmSync(filepath);
}

function createdDate(filepath) {
  try {
    const stats = fs.statSync(filepath);
    if (stats.birthtimeMs === 0) throw new Error("Invalid stat for file!");
    return stats.birthtime.toLocaleString();
  } catch (err) {
    console.error('Error checking filetype statSync:', err);
    return "unknown";
  }
}

//@DEBUG @ktchan @S3A @TODO @(1) upload
// 1. Put file into S3A storage
// 2. Get object from s3a
// 3. Change to download files from server
// 4. Remove data from s3a
// 5. Move file in s3
function writeToSourceDocuments(data = {}, filename, fileExtension = null, destinationOverride = null) {
  if (ENABLE_S3) {
    return writeToS3Documents(data, filename, fileExtension, destinationOverride);
  }
  else {
    return writeToLocalFSDocuments(data, filename, fileExtension, destinationOverride);
  }
}

function writeToLocalFSDocuments(data = {}, filename, fileExtension = null, destinationOverride = null) {
  const destination = destinationOverride
    ? path.resolve(destinationOverride)
    : path.resolve(defaultStoragePath, "objects/custom-documents");
  if (!fs.existsSync(destination))
    fs.mkdirSync(destination, { recursive: true });

  let sourceFilePath;
  if (data.url.startsWith('file://')) {
    // Remove the 'file://' prefix and decode the URI
    sourceFilePath = decodeURIComponent(data.url.substring(7));
  } else {
    // If it's not a file URL, use the provided path directly
    sourceFilePath = data.url;
  }

  const destinationFilePath = path.resolve(destination, filename) + fileExtension;

  try {
    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log('File copied successfully');
  } catch (err) {
    console.error('Error copying file:', err);
  }

  const basedir = path.basename(path.dirname(destinationFilePath));
  const basename = path.basename(destinationFilePath);
  return {
    ...data,
    rawLocation: path.join(basedir, basename),
  };
}

function writeToS3Documents(data = {}, filename, fileExtension = null, destinationOverride = null) {
  const destination = destinationOverride
    ? path.resolve(destinationOverride)
    : path.resolve(
      __dirname,
      "../../../server/storage/objects/custom-documents"
    );

  // Convert file URL to local path
  let sourceFilePath;
  if (data.url.startsWith('file://')) {
    // Remove the 'file://' prefix and decode the URI
    sourceFilePath = decodeURIComponent(data.url.substring(7));
  } else {
    // If it's not a file URL, use the provided path directly
    sourceFilePath = data.url;
  }

  const objectPath = splitFilePath(path.resolve(destination, filename) + fileExtension);
  const objectKey = path.join(objectPath[(objectPath.length - 2)], objectPath[(objectPath.length - 1)]).replace("\\", "/");

  putObject("default", objectKey, sourceFilePath);

  return {
    ...data,
    rawLocation: objectKey,
  };
}

//@DEBUG @ktchan @s3a 
function saveFile(data, filename) {

  //Update writeToServerDocuments and writeToS3Documents to add fileExtension
  let document;
  const fileExtension = path.extname(filename);
  try {
    document = writeToSourceDocuments(
      data,
      `${slugify(filename)}-${data.id}`,
      fileExtension
    );

    document = writeToServerDocuments(
      document,
      `${slugify(filename)}-${data.id}`,
      fileExtension
    );
  } catch (error) {
    console.error('Upload file failed:', error);
    throw new Error("save file failed!");
  }
  return document;
}


function writeToServerDocuments(data = {}, filename, fileExtension = null, destinationOverride = null) {
  const destination = destinationOverride
    ? path.resolve(destinationOverride)
    : path.resolve(defaultStoragePath, "documents/custom-documents");
  if (!fs.existsSync(destination))
    fs.mkdirSync(destination, { recursive: true });

  const destinationFilePath = path.resolve(destination, filename) + ".json";

  fs.writeFileSync(destinationFilePath, JSON.stringify(data, null, 2), {
    encoding: "utf-8",
  });

  return {
    ...data,
    location: destinationFilePath.split("/").slice(-2).join("/"),
  };
}

function wipeCollectorStorage() {
  const cleanHotDir = () => {
    const directory = path.resolve(__dirname, "../../hotdir");
    try {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        if (file === "__HOTDIR__.md") continue;
        fs.rmSync(path.join(directory, file));
      }
    } catch (err) {
      console.error('Error cleaning hot directory:', err);
    }
  };

  const cleanTmpDir = () => {
    const directory = path.resolve(__dirname, "../../storage/tmp");
    try {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        if (file === ".placeholder") continue;
        fs.rmSync(path.join(directory, file));
      }
    } catch (err) {
      console.error('Error cleaning tmp directory:', err);
    }
  };

  cleanHotDir();
  cleanTmpDir();
  console.log(`Collector hot directory and tmp storage wiped!`);
}

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

function sanitizeFileName(fileName) {
  if (!fileName) return fileName;
  return fileName.replace(/[<>:"\/\\|?*]/g, "");
}

module.exports = {
  saveFile,
  trashFile,
  isTextType,
  createdDate,
  writeToSourceDocuments,
  writeToServerDocuments,
  wipeCollectorStorage,
  normalizePath,
  isWithin,
  sanitizeFileName,
};