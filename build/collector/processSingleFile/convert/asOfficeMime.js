const { v4 } = require("uuid");
const officeParser = require("officeparser");
const {
  createdDate,
  saveFile,
  trashFile,
} = require("../../utils/files");
const { tokenizeString } = require("../../utils/tokenizer");
const { default: slugify } = require("slugify");

async function asOfficeMime({ fullFilePath = "", filename = "" }) {
  console.log(`-- Working ${filename} --`);
  let content = "";
  try {
    content = await officeParser.parseOfficeAsync(fullFilePath);
  } catch (error) {
    console.error(`Could not parse office or office-like file`, error);
  }

  if (!content.length) {
    console.error(`Resulting text content was empty for ${filename}.`);
    trashFile(fullFilePath);
    return {
      success: false,
      reason: `No text content found in ${filename}.`,
      documents: [],
    };
  }

  const data = {
    id: v4(),
    url: "file://" + fullFilePath,
    title: filename,
    docAuthor: "no author found",
    description: "No description found.",
    docSource: "Office file uploaded by the user.",
    chunkSource: "",
    published: createdDate(fullFilePath),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content).length,
  };

  //@DEBUG @ktchan @s3a 
  //Update saveFile and writeToS3Documents to add fileExtension
  let document;
  try {
    document = saveFile(data, filename);
    trashFile(fullFilePath);
    console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
  } catch (error) {
    console.error("Could not save file!", error);
    return { success: false, reason: error.message, documents: [] };
  }

  return { success: true, reason: null, documents: [document] };
}

module.exports = asOfficeMime;
