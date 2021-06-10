import { secrets } from "../utils";
import fs from "fs";
import S3 from "aws-sdk/clients/s3";

// AWS S3 intgration for images

const bucketName = secrets.AWS_BUCKET_NAME;
const region = "us-east-2";
const accessKeyId = secrets.AWS_ACCESS_KEY;
const secretAccessKey = secrets.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
export function uploadFile(file: Express.Multer.File) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  return s3.upload(uploadParams).promise();
}
