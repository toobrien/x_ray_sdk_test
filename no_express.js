process.env['AWS_XRAY_CONTEXT_MISSING'] = 'LOG_ERROR';

const jss = (x) => { console.log(JSON.stringify(x,null,2)); };
const p_resp = (path, resp) => { 
  jss(path + ': ' + resp.request.httpRequest.stream.res.headers['x-amzn-trace-id']);
};

const AWSXRay = require('aws-xray-sdk');
AWSXRay.middleware.setSamplingRules({
  'rules': [],
  'default': {
    'fixed_target': 0,
    'rate': 1
  },
  'version': 1
});

const AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.region = 'us-west-2';
const lda = new AWS.Lambda();

const ns = AWSXRay.getNamespace();

const subreq = (seg) => {
  const req = lda.invoke({FunctionName: 'f0'});
  req.on('success', p_resp.bind(null,seg));
  req.on('error', p_resp.bind(null,seg));
  req.send();
};

const request = (seg) => {
  // unlike with express, each request will have its own
  // trace unless you explicitly set a segment
  AWSXRay.setSegment(new AWSXRay.Segment(seg));
  subreq(seg);
  subreq(seg + "_2");
};

ns.run(request.bind(null,'req1'));
ns.run(request.bind(null,'req2'));
ns.run(request.bind(null,'req3'));
