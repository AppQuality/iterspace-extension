import AWS from "aws-sdk"

export class UploadS3 {
  blob: Blob;
  fileName: string;
  recordingId: string;
  s3: AWS.S3;
  etag: string[];
  outputTag: object[];
  increment = 0;
  uploadId = '';
  region = 'eu-central-1';
  identityPoolId = 'eu-central-1:c8fd3bd1-2c94-4938-9ebd-c37b163f20e7';
  bucketName = 'iterspace-bucket-dev';

  constructor(blob: Blob, id: string) {
    this.blob = blob;
    this.recordingId = id;
    this.fileName = `public/${this.recordingId}.webm`;
    AWS.config.update({
      region: this.region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.identityPoolId
      })
    });

    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {
        Bucket: this.bucketName
      }
    });
  }

  startMultiUpload() {
    const params = {
      Bucket: this.bucketName,
      Key: this.fileName,
      ContentType: 'video/webm',
      Metadata: {
        recordingId: this.recordingId,
      },
    }
    this.s3.createMultipartUpload(params, (
      err,
      data
    ) => {
      if (err) {
        console.error(err, err.stack)
      } else {
        this.uploadId = data.UploadId
        this.increment = 1;
        this.continueMultiUpload();
      }
    })
  }
  continueMultiUpload() {
    const params = {
      Body: this.blob,
      Bucket: this.bucketName,
      Key: this.fileName,
      PartNumber: this.increment,
      UploadId: this.uploadId,
    }
    this.s3.uploadPart(params, (err, data) => {
      if (err) {
        console.error(err, err.stack)
        return
      }
      this.etag.push(data.ETag);
      this.completeMultiUpload();
    })
  }

  completeMultiUpload() {
    this.etag.forEach((data, index) => {
      const partNumber = index + 1
      const obj = {
        ETag: data,
        PartNumber: partNumber,
      }
      this.outputTag.push(obj);
    })

    const params = {
      Bucket: this.bucketName,
      Key: this.fileName,
      UploadId: this.uploadId,
      MultipartUpload: {
        Parts: this.outputTag,
      },
    }

    this.s3.completeMultipartUpload(params, (err) => {
      if (err) {
        console.log(err, err.stack)
        return
      }
      const newURL = `https://develop.iterspace.com/temporary/${this.recordingId}`;
      chrome.tabs.create({ url: newURL });
    })
  }
}
