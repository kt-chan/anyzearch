const { Document } = require("../models/documents");
const { normalizePath, findDocumentInDocuments, documentsPath, isWithin } = require("../utils/files");
const { reqBody } = require("../utils/http");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const fs = require("fs");
const path = require("path");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const archiver = require('archiver');

function documentEndpoints(app) {
  if (!app) return;

  const s3Client = new S3Client({
    endpoint: "http://localhost:9000", // 替换为您的 MinIO 服务 endpoint
    region: "default",
    credentials: {
      accessKeyId: "qG4IWW6zBcOfr29zSrj0", // 替换为您的 MinIO access key
      secretAccessKey: "VmLLAFLWarwfdiNBrcEWK0KBWHf6pWWzy9KFCfc4", // 替换为您的 MinIO secret key
    },
    s3ForcePathStyle: true, // MinIO 需要设置为 true
    forcePathStyle: true, // 同上，确保路径风格访问
  });

  app.post(
    "/document/create-folder",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { name } = reqBody(request);
        const storagePath = path.join(documentsPath, normalizePath(name));
        if (!isWithin(path.resolve(documentsPath), path.resolve(storagePath)))
          throw new Error("Invalid folder name.");

        if (fs.existsSync(storagePath)) {
          response.status(500).json({
            success: false,
            message: "Folder by that name already exists",
          });
          return;
        }

        fs.mkdirSync(storagePath, { recursive: true });
        response.status(200).json({ success: true, message: null });
      } catch (e) {
        console.error(e);
        response.status(500).json({
          success: false,
          message: `Failed to create folder: ${e.message} `,
        });
      }
    }
  );


  //@DEBUG @ktchan @S3A @TODO @(2)
  // 1. fix the s3a persistent, Update to Put file into S3A storage
  // 2. update this server endpoint to get object from s3a
  // 3. Change to download files from server
  app.post(
    "/document/download-files",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      let documents = [];
      try {
        const files = JSON.parse(request.body);
        for (const item of files) {
          const document = await findDocumentInDocuments(item["name"]);
          if (!document) {
            response.sendStatus(404).end();
            return;
          }
          documents.push(document);
        }
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }

      // Create a ZIP stream
      const zip = archiver('zip', { zlib: { level: 9 } }); // Set the compression level
      response.setHeader('Content-Type', 'application/zip');
      const contentDisposition = `attachment; filename="downloaded-files.zip"`;
      response.setHeader('Content-Disposition', contentDisposition);

      // Listen for the 'error' event on the zip stream
      zip.on('error', (err) => {
        console.error('Zip stream error:', err);
        response.status(500).end();
      });

      // Pipe the archive data to the response
      zip.pipe(response);

      // Add each file to the ZIP archive
      for (const document of documents) {
        const getObjectCommand = new GetObjectCommand({
          Bucket: "default",
          Key: document.objectKey,
        });

        try {
          const result = await s3Client.send(getObjectCommand);
          const stream = result.Body;
          // Make sure to handle the stream error
          stream.on('error', (err) => {
            console.error('Stream error:', err);
            zip.abort(); // Abort the zip process on error
          });
          zip.append(stream, { name: document.objectKey });
        } catch (e) {
          console.error(e.message, e);
          zip.abort(); // Abort the zip process on error
          response.status(500).end();
          return; // Make sure to return after sending the error response
        }
      }

      // Finalize the ZIP archive when all files have been added
      zip.finalize();
    });



  app.post(
    "/document/move-files",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { files } = reqBody(request);
        const docpaths = files.map(({ from }) => from);
        const documents = await Document.where({ docpath: { in: docpaths } });

        const embeddedFiles = documents.map((doc) => doc.docpath);
        const moveableFiles = files.filter(
          ({ from }) => !embeddedFiles.includes(from)
        );

        const movePromises = moveableFiles.map(({ from, to }) => {
          const sourcePath = path.join(documentsPath, normalizePath(from));
          const destinationPath = path.join(documentsPath, normalizePath(to));

          return new Promise((resolve, reject) => {
            fs.rename(sourcePath, destinationPath, (err) => {
              if (err) {
                console.error(`Error moving file ${from} to ${to}:`, err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(movePromises)
          .then(() => {
            const unmovableCount = files.length - moveableFiles.length;
            if (unmovableCount > 0) {
              response.status(200).json({
                success: true,
                message: `${unmovableCount}/${files.length} files not moved. Unembed them from all workspaces.`,
              });
            } else {
              response.status(200).json({
                success: true,
                message: null,
              });
            }
          })
          .catch((err) => {
            console.error("Error moving files:", err);
            response
              .status(500)
              .json({ success: false, message: "Failed to move some files." });
          });
      } catch (e) {
        console.error(e);
        response
          .status(500)
          .json({ success: false, message: "Failed to move files." });
      }
    }
  );
}

module.exports = { documentEndpoints };
