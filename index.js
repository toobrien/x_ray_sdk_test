const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const lda = new AWS.Lambda();
const jss = (x) => { console.log(JSON.stringify(x,null,2)); };
const p_resp = (resp) => {
  jss(resp.request.httpRequest.stream.res.headers['x-amzn-requestid']);
  jss(resp.request.httpRequest.stream.res.headers['x-amzn-trace-id']);
};

exports.f0 = (event, context, callback) => {
    jss(context);
    jss(process.env);
    const params = { FunctionName: "f1" };
    const r = lda.invoke(params);
    r.on('success', p_resp);
    r.on('error', p_resp);
    r.send();
    callback(null, null);
};

exports.f1 = (event, context, callback) => {
  jss(context);
  jss(process.env);
  callback(null,null);
};
