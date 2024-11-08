## Configure .env file ##
### Copy .env.example to .env
```bash
cp .env.example .env
```
### Edit .env to enable https
```bash
## HTTPS Configuration
ENABLE_HTTPS="true"
HTTPS_KEY_PATH='../certs/win10.local.key'
HTTPS_CERT_PATH='../certs/win10.local.crt'
NODE_OPTIONS='--use-openssl-ca'
NODE_EXTRA_CA_CERTS='../certs/ca-certificates.crt'
CURL_CA_BUNDLE='../certs/ca-certificates.crt'
REQUESTS_CA_BUNDLE='../certs/ca-certificates.crt'
```
### Edit .env to enable sso
```bash
## ADFS SSO Configuration
ENABLE_SSO="true"
SAML_ENTRY_POINT='https://anyzearch.local/adfs/ls/'
SAML_CALLBACK_HOST="https://win10.local:3001/"
SAML_ISSUER="win10.local"
SAML_ADFS_CERT='../certs/adfs.anyzearch.crt'
```

### Launch AnyZearch and follow the setup guide
read and follow adfs_setup.pdf
