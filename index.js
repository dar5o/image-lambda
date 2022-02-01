const AWS = require('aws-sdk');
let s3 = new AWS.S3();

exports.handler = async (event) => {
    let bucketName = event.Records[0].s3.bucket.name;
    let fileName = event.Records[0].s3.object.key;
    let fileSize = event.Records[0].s3.object.size;
    
    console.log(bucketName, fileName, fileSize);
    
    const params = {
        Bucket: bucketName,
        Key: "videos.json"
    };
    
    try{
        const manifest = await s3.getObject(params).promise();
        
        let manifestData = JSON.parse(manifest.Body.toString());
        console.log('current manifestData', manifestData[0]);
        
        manifestData.push({
            name: fileName,
            size: fileSize,
            type: 'video'
        });
        
        const manifestBody = JSON.stringify(manifestData);
        const newManifest = await s3.putObject({...params, Body: manifestData, ContentType: 'application/json'})
        
    }catch(error){
        console.log(error);
        const newManifest = {
            Bucket: bucketName,
            Key: 'videos.json',
            Body: JSON.stringify([{name: fileName, size: fileSize, type: 'video'}]),
            ContentType: 'application/json',
        };
        const manifest = await s3.putObject(newManifest).promise();
        console.log('JSON file fetched fromthe bucket', manifest);
    }
    
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
