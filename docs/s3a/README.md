## Configure .env file ##
### Copy .env.example to .env
```bash
cp .env.example .env
```
### Edit .env to enable s3 access
```bash
## S3 Configuration
ENABLE_S3="true"
S3_ENDPOINT="[HOST:PORT]" #e.g. "http://localhost:9000"
S3_REGION="[REGION]" #e.g."default" , mandatory create one if not exist
S3_AK="[Replace with your AK]"
S3_SK="[Replace with your SK]"
```
