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

  async function getObject(bucketName, objectKey) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName, // The name of the bucket
      Key: objectKey, // The key of the object
    });

    try {
      const data = await s3Client.send(getObjectCommand);
      console.log("Object retrieved successfully.", data);
      return data;
    } catch (err) {
      console.error("Error retrieving object:", err);
    }
  }

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

      let objKey = documents[0];
      getObject("default", objKey.name)
        .then(data => {
          if (data) {
            console.log(data.Body.toString()); // Convert the buffer to a string
          }
        })
        .catch(err => {
          console.error(err);
        });
      response.status(200).json({ success: true, message: documents });
    }
  );


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
