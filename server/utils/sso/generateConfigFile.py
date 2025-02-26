#!/usr/bin/env python3
import os
import re
import sys
import tempfile
import subprocess

def print_usage(prog):
    print(f"Usage: {prog} ENTITY-ID ENDPOINT-URL CALL-BACK-HOST")
    print("\nExample:")
    print(f"  {prog} adfs-entity-name ENDPOINT-URL CALL-BACK-HOST")
    print("")

if len(sys.argv) < 4:
    print_usage(sys.argv[0])
    sys.exit(1)

ENTITYID = sys.argv[1]
if not ENTITYID:
    print(f"{sys.argv[0]}: An entity ID is required.", file=sys.stderr)
    sys.exit(1)

BASEURL = sys.argv[2]
if not BASEURL:
    print(f"{sys.argv[0]}: The URL to the ADFS is required.", file=sys.stderr)
    sys.exit(1)

CALLBACKURL = sys.argv[3]
if not CALLBACKURL:
    print(f"{sys.argv[0]}: The call back URL is required.", file=sys.stderr)
    sys.exit(1)

if not re.match(r'^https?://', BASEURL):
    print(f"{sys.argv[0]}: The URL must start with \"http://\" or \"https://\".", file=sys.stderr)
    sys.exit(1)

if not re.match(r'^https?://', CALLBACKURL):
    print(f"{sys.argv[0]}: The URL must start with \"http://\" or \"https://\".", file=sys.stderr)
    sys.exit(1)


HOST = re.sub(r'^[a-z]*://([^:/]*).*', r'\1', BASEURL)
BASEURL = BASEURL.rstrip('/')
ENTITYHOST = re.sub(r'https?://', '', ENTITYID).split(':')[0]
OUTFILE = os.path.join(".", "certs", re.sub(r'[^0-9A-Za-z.]', '_', ENTITYHOST))

# Ensure the directory for OUTFILE exists
OUTFILE_DIR = os.path.dirname(OUTFILE)
os.makedirs(OUTFILE_DIR, exist_ok=True)

os.umask(0o077)

with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".conf") as templatefile:
    templatefile.write(f"""
RANDFILE           = /home/demo/adfs/.rnd
[req]
default_bits       = 2048
default_keyfile    = privkey.pem
distinguished_name = req_distinguished_name
prompt             = no
policy             = policy_anything
[req_distinguished_name]
commonName         = {HOST}
""")
    templatefile_path = templatefile.name

subprocess.run(["openssl", "req", "-utf8", "-batch", "-config", templatefile_path,
                "-new", "-x509", "-days", "3652", "-nodes", "-out", f"{OUTFILE}.crt",
                "-keyout", f"{OUTFILE}.key"], stderr=subprocess.DEVNULL)
os.remove(templatefile_path)

with open(f"{OUTFILE}.crt", 'r') as certfile:
    cert_content = "".join([line.strip() for line in certfile if "-----" not in line])

with open(f"{OUTFILE}.xml", 'w') as xmlfile:
    xmlfile.write(f"""
<EntityDescriptor entityID="{ENTITYHOST}" xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>{cert_content}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="{os.path.join(CALLBACKURL, 'adfs/auth/logout')}"/>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="{os.path.join(CALLBACKURL, 'adfs/auth/postResponse')}" index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>
""")

os.umask(0o777)
os.chmod(f"{OUTFILE}.xml", 0o644)
os.chmod(f"{OUTFILE}.crt", 0o644)

## Print the file content
# with open(f"{OUTFILE}.xml", 'r') as xmlfile:
#     print(xmlfile.read())

# Print the full file path
print(os.path.abspath(f"{OUTFILE}.xml"))

