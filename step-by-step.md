# 1.1.1

**file:** `./infraestructure/lib/infraestructure-stack.ts`
**replace key:** `[ ] 1.1.1: create S3 Bucket as web hosting to store webapp`
```js
    const webappBucket = new S3.Bucket(this, 'webapp-artifact', {
        accessControl: S3.BucketAccessControl.PRIVATE,
        cors: [{
            allowedMethods: [S3.HttpMethods.GET],
            allowedOrigins: ['*'],

            // the properties below are optional
            allowedHeaders: ['Authorization'],
            exposedHeaders: [],
        }],
        removalPolicy: RemovalPolicy.DESTROY,
    })

    const webappDeployment = new S3Deployment.BucketDeployment(this, 'deployStaticWebapp', {
        sources: [S3Deployment.Source.asset(props?.assetsPath || '../webapp')],
        destinationBucket: webappBucket,
    })
    
    // export bucket Name
    new CfnOutput(this, 'webappBucketName', {
      value: webappBucket.bucketName,
      exportName: 'webappBucketName'
    })
```

**file:** `./infraestructure/lib/infraestructure-stack.ts`
**replace key:** `{{replaceme}}`
```js
// this was replaced successfully
```

---

# 1.1.2

**file:** `./webapp/deploy.ps1`
**replace key:** `add command to update web assets in S3`
```posh
aws s3 cp . s3://your-s3-bucket --recursive
```

**file:** `./webapp/deploy.sh`
**replace key:** `add command to update web assets in S3`
```powershell
aws s3 cp . s3://your-s3-bucket --recursive
```

---


# 1.1.3

**file:** `asd`
**replace key:** `asd`
```js
adasdasd
```

**file:** `123`
**replace key:** `adasd`
```powershell
Get-Content -Path .
```


---




