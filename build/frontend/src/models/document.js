import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const Document = {
  createFolder: async (name) => {
    return await fetch(`${API_BASE}/document/create-folder`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  moveToFolder: async (files, folderName) => {
    const data = {
      files: files.map((file) => ({
        from: file.folderName ? `${file.folderName}/${file.name}` : file.name,
        to: `${folderName}/${file.name}`,
      })),
    };

    return await fetch(`${API_BASE}/document/move-files`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },

  //@DEBUG @ktchan @S3A @TODO @(3)
  // 1. fix the s3a persistent, Update to Put file into S3A storage
  // 2. update this server endpoint to get object from s3a
  // 3. Change to download files from server
  // 4. Remove data from s3a
  // 5. Move file in s3
  downloadFolder: async (files) => {
    if (files && files !== null) {

      try {
        const response = await fetch(`${API_BASE}/document/download-files`, {
          method: "POST",
          headers: baseHeaders(),
          body: JSON.stringify(files),
        });

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle the response as a blob
        const blob = await response.blob();

        // Create a URL to the blob
        const fileURL = window.URL.createObjectURL(blob);

        // Create a link element to download the file
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', 'anyzearch-filedownload.zip'); // Set the file name and extension

        // Append the link to the body to trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link from the body
        link.parentNode.removeChild(link);

        // Return a success response
        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
      }

    }
  },
};

export default Document;
