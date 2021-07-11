import { secrets } from "../utils";
import { v4 as uuid } from "uuid";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

// AWS S3 integration for images

const bucketName = secrets.AWS_BUCKET_NAME;
const accessKeyId = secrets.AWS_ACCESS_KEY;
const secretAccessKey = secrets.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const options = {
  s3: s3,
  bucket: bucketName,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  Key: (req: any, file: any, cb: any) => cb(null, uuid()),
};

// upload
const upload = multer({
  storage: multerS3({
    ...options,
  }),
});

const image = [{ name: "image", maxCount: 1 }];

const userImage = upload.fields(image);

export default upload;
export { userImage };
