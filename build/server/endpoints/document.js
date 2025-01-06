const { Document } = require("../models/documents");
const { normalizePath, findDocumentInDocuments, documentsPath, isWithin, moveS3Document: moveS3Document } = require("../utils/files");
const { reqBody } = require("../utils/http");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const fs = require("fs");
const path = require("path");
const { getS3Document } = require("../utils/files");
const archiver = require('archiver');

function documentEndpoints(app) {
  if (!app) return;

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
  // 4. Remove data from s3a
  // 5. Move file in s3
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
      const contentDisposition = `attachment; filename="downloaded-files.zip"`;
      response.setHeader('Content-Type', 'application/zip');
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

        try {
          const stream = await getS3Document(document.objectKey);
          // Make sure to handle the stream error
          stream.on('error', (err) => {
            console.error('Stream error:', err);
            zip.abort(); // Abort the zip process on error
            response.status(500).end(); // Ensure the response is ended
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

  //@DEBUG @ktchan @S3A @TODO @(5)
  // 1. fix the s3a persistent, Update to Put file into S3A storage
  // 2. update this server endpoint to get object from s3a
  // 3. Change to download files from server
  // 4. Remove data from s3a
  // 5. Move file in s3
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

            // Read metadata json file, update objectkey

            if (
              !fs.existsSync(sourcePath) ||
              !fs.lstatSync(sourcePath).isFile()
            ) return;

            let sourceObjectKey;
            let destinationObjectKey;

            //Read object to get objectkey
            const data = fs.readFileSync(sourcePath, 'utf8');

            try {
              const metaData = JSON.parse(data);
              sourceObjectKey = metaData.objectKey;

              // replace path forward-slash to s3 backward-slash standard
              destinationObjectKey = path.join(path.dirname(to), path.basename(metaData.objectKey)).replaceAll("\\", "/");
              metaData.objectKey = destinationObjectKey;

              // Convert the updated object back to a JSON string
              const updatedData = JSON.stringify(metaData, null, 2); // Pretty print with 2 spaces

              // Write the updated JSON back to the file
              fs.writeFileSync(destinationPath, updatedData, 'utf8');

              //Handle Move in s3
              moveS3Document(sourceObjectKey, destinationObjectKey);

            } catch (error) {
              console.error('Error parsing JSON:', error);
              //remove temp file in case of error
              if (
                fs.existsSync(destinationPath) &&
                fs.lstatSync(destinationPath).isFile()
              ) fs.rmSync(destinationPath);
              
              reject(writeErr);
            }

            //Final resolve
            fs.rmSync(sourcePath);
            resolve();

          });
        });

        await Promise.all(movePromises);

        // Final Response
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

      } catch (error) {
        console.error("Failed to move files.", error);
        response
          .status(500)
          .json({ success: false, message: "Failed to move files." });
      }
    }
  );
}

module.exports = { documentEndpoints };
