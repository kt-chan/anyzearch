const fs = require('fs');
const shell = require('shelljs')
const path = require('path');

function extractHostUrl(str) {
    // 正则表达式匹配HTTP和HTTPS协议的URL，并捕获主机名和可能的端口
    const regex = /https?:\/\/([^\/\s"]+)(?:[\/\s"]|$)/i;
    const matches = str.match(regex);
    return matches ? `https://${matches[1]}` : null;
}

const MetadataFactory = {
    validateADFSSettings: async function (updates = {}) {

        const adfsIssuer = updates['adfs_sso_issuer'] || process.env.SAML_ISSUER;
        const adfsEntryPoint = updates['adfs_sso_url'] || process.env.SAML_ENTRY_POINT;
        const callabckHost = updates['adfs_sso_callback'] || process.env.SAML_CALLBACK_HOST;

        if ((adfsIssuer !== null && adfsIssuer !== undefined) && (adfsEntryPoint !== null && adfsEntryPoint !== undefined)) {
            const scriptPath = path.join(__dirname, 'generateConfigFile.py');
            return new Promise((resolve, reject) => {
                shell.exec(`python ${scriptPath} ${adfsIssuer.trim()} ${adfsEntryPoint.trim()} ${callabckHost.trim()}`, (code, stdout, stderr) => {
                    if (code === 0) {
                        // Assuming stdout contains the file path
                        const filePath = stdout.trim(); // Remove any trailing newline characters
                        fs.readFile(filePath, 'utf8', (err, data) => {
                            if (err) {
                                reject(new Error(`Error reading file: ${err.message}`));
                            } else {
                                resolve(data); // Resolve with the file content
                            }
                        });
                    } else {
                        reject(new Error(stderr));
                    }
                });
            });
        }
        else {
            console.error(`Could not validate input formats: ${updates}.`);
            return new Promise((resolve, reject) => { reject(new Error(stderr)); })
        }
    },
    getADFSCertificate: async function (updates = {}) {

        const adfsEntryPoint = updates['adfs_sso_url'] || process.env.SAML_ENTRY_POINT;
        const cert_filepath = process.env.SAML_ADFS_CERT;
        if ((adfsEntryPoint !== null && adfsEntryPoint !== undefined) && (cert_filepath !== null && cert_filepath !== undefined)) {
            let adfsmeta = extractHostUrl(adfsEntryPoint);
            const scriptPath = path.join(__dirname, 'retrieveCertificate.py');
            return new Promise((resolve, reject) => {
                shell.exec(`python ${scriptPath} ${adfsmeta.trim()} ${cert_filepath.trim()}`, (code, stdout, stderr) => {
                    if (code === 0) {
                        resolve(true);
                    } else {
                        reject(new Error(stderr));
                    }
                });
            });
        }
        else {
            console.error(`Could not download adfs certificate: ${updates}.`);
            return new Promise((resolve, reject) => { reject(new Error(stderr)); })
        }
    },

    checkSSOEnabelFlagSetTrue: function () {
        let sso_not_empty = process.env.ENABLE_SSO !== undefined && process.env.ENABLE_SSO !== '';
        let sso_true = process.env.ENABLE_SSO === 'true';
        let sso_saml_entrypoint_not_empty = process.env.SAML_ENTRY_POINT !== undefined && process.env.SAML_ENTRY_POINT.trim() !== '';
        let sso_saml_adfs_cert_not_empty = process.env.SAML_ADFS_CERT !== undefined && process.env.SAML_ADFS_CERT.trim() !== '';
        return sso_not_empty && sso_true && sso_saml_entrypoint_not_empty && sso_saml_adfs_cert_not_empty;
    }
}



module.exports.MetadataFactory = MetadataFactory;
