const { Document } = require("../models/documents");
const { normalizePath, findDocumentInDocuments, documentsPath, isWithin,
  getSourceDocument, moveSourceDocument } = require("../utils/files");
const { reqBody } = require("../utils/http");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const fs = require("fs");
const path = require("path");
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


  //@ktchan @S3A @(2) Download
  // 1. Put file into S3A storage
  // 2. Get object from s3a
  // 3. Change to download files from server
  // 4. Remove data from s3a
  // 5. Move file in s3

  app.post(
    "/document/download-file",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      let documents = [];
      try {
        const file = JSON.parse(request.body);
        documents.push(file);


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
            const stream = await getSourceDocument(document);
            // Make sure to handle the stream error
            stream.on('error', (err) => {
              console.error('Stream error:', err);
              zip.abort(); // Abort the zip process on error
              response.status(500).end(); // Ensure the response is ended
            });
            zip.append(stream, { name: path.join(path.basename(path.dirname(document.rawLocation)), path.basename(document.rawLocation)) });
            // zip.append(stream, { name: document.rawLocation });
          } catch (e) {
            console.error(e.message, e);
            zip.abort(); // Abort the zip process on error
            response.status(500).end();
            return; // Make sure to return after sending the error response
          }
        }
        // Finalize the ZIP archive when all files have been added
        zip.finalize();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    });

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
            const stream = await getSourceDocument(document);
            // Make sure to handle the stream error
            stream.on('error', (err) => {
              console.error('Stream error:', err);
              zip.abort(); // Abort the zip process on error
              response.status(500).end(); // Ensure the response is ended
            });
            // Ensure the directory structure is maintained
            // const directoryPath = path.dirname(document.rawLocation);
            // const fileName = path.basename(document.rawLocation);
            // zip.directory(directoryPath, path.basename(directoryPath));
            // zip.append(stream, { name: fileName });
            zip.append(stream, { name: path.join(path.basename(path.dirname(document.rawLocation)), path.basename(document.rawLocation)) });

            // Listen for the 'end' event to ensure the stream is fully processed
            stream.on('end', () => {
              console.log(`File ${document.rawLocation} added to ZIP`);
            });
          } catch (e) {
            console.error(e.message, e);
            zip.abort(); // Abort the zip process on error
            throw new Error("download files failed");
          }
        }
        // Finalize the ZIP archive when all files have been added
        zip.finalize();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    });

  //@ktchan @S3A  @(5) Move
  // 1. Put file into S3A storage
  // 2. Get object from s3a
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

          return new Promise((resolve, reject) => {
            try {
              //Handle Move in s3
              moveSourceDocument(from, to);
            } catch (error) {
              console.error('Error parsing JSON:', error);
              reject(writeErr);
            }
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
