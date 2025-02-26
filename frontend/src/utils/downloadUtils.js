
export function getDownloadFileXML(content) {
  const blob = new Blob([content], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'adfs-config.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function getDownloadFilePDF(pdfPath) {
    const url = `${window.location.origin}${pdfPath}`; // Full URL to the PDF on the current host

    const link = document.createElement('a');
    link.href = url;
    link.download = 'adfs-setup.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
