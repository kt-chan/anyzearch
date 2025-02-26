#!/usr/bin/env python3
import sys
import os
import urllib3
from xml.etree import ElementTree as ET
from urllib3.exceptions import InsecureRequestWarning

# Suppress only the InsecureRequestWarning from urllib3
urllib3.disable_warnings(InsecureRequestWarning)

def print_usage(prog):
    print(f"Usage: {prog} ADFS-ENDPOINT-URL CERT-OUTPUT-FILENAME".format(sys.argv[0]))
    print("\nExample:")
    print(f"  {prog} https://adfs-server.local/ ./certs/adfs.anyzearch.crt".format(sys.argv[0]))
    print("")

if len(sys.argv) < 3:
    print_usage(sys.argv[0])
    sys.exit(1)

def main(adfs_server_url, cert_output_filename):
    # Parse the ADFS server URL to get the base
    adfs_server = adfs_server_url.split('/')[:3]
    adfs_server = '/'.join(adfs_server)  # Rejoin to form the URL without the path
    absolute_path = os.path.abspath(cert_output_filename)
    
    # Construct the metadata URL
    metadata_url = os.path.join(adfs_server, 'FederationMetadata', '2007-06', 'FederationMetadata.xml')
    
    # Create the output directory if it doesn't exist
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    # Fetch the metadata
    http = urllib3.PoolManager(cert_reqs='CERT_NONE')
    response = http.request('GET', metadata_url)

    if response.status != 200:
        print(f"Error requesting {metadata_url}, status code: {response.status}")
        sys.exit(1)

    # Parse the XML to extract the certificate
    root = ET.fromstring(response.data)

    # Define the namespaces used in the XML file
    namespaces = {
        'ds': 'http://www.w3.org/2000/09/xmldsig#',
        'saml': 'urn:oasis:names:tc:SAML:2.0:metadata'
    }

    # Find the X509Certificate element and get its text content
    cert_element = root.find(".//ds:X509Certificate", namespaces)

    if cert_element is not None:
        certificate_text = f"-----BEGIN CERTIFICATE-----\n{cert_element.text.strip()}\n-----END CERTIFICATE-----"

        # Write the certificate to the specified file
        with open(absolute_path, "w") as cert_file:
            cert_file.write(certificate_text)
        
        print(f"Certificate saved to {absolute_path}")
    else:
        print("Certificate not found in the metadata.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_usage()
        sys.exit(1)
    
    adfs_server_url = sys.argv[1]
    cert_output_filename = sys.argv[2]
    
    main(adfs_server_url, cert_output_filename)
