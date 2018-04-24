process.env['AWS_XRAY_CONTEXT_MISSING'] = 'LOG_ERROR';

const express = require('express');
const app = express();

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

const jss = (x) => { console.log(JSON.stringify(x,null,2)); };
const p_resp = (path, resp) => { 
  jss(path + ': ' + resp.request.httpRequest.stream.res.headers['x-amzn-trace-id']);
};

const request = (path) => {
  const req = lda.invoke({ FunctionName: 'f0' });
  req.on('success', p_resp.bind(null,path));
  req.on('error', p_resp.bind(null,path));
  req.send();
};

const subrequest = (path) => {
  request(path);
}

const x0 = (req, res) => {
  request('x0:   ');
  request('x0:   ');
  res.send('x0\n');
};

const x1 = (variant, req, res) => {
  const x1_1 = new AWSXRay.Segment('x1');
  const x1_2 = new AWSXRay.Segment('x2');
  AWSXRay.setSegment(x1_1);
  request(variant);
  AWSXRay.setSegment(x1_2);
  request(variant);
  res.send(variant + "\n");
};

const x2 = (req, res) => {
  request('x2:   ');
  request('x2:   ');
  res.send('x2\n');  
}

const x3 = (req, res) => {
  request('x3:   ');
  subrequest('x3:    ');
  res.send('x3\n');
}

app.use(AWSXRay.express.openSegment('app'));
app.get('/x0', x0);
app.get('/x1', x1.bind(null,'x1:   '));
app.get('/x1_1', x1.bind(null,'x1_1: '));
app.get('/x2', x2);
app.get('/x3', x3);
app.use(AWSXRay.express.closeSegment());

app.listen(9000,jss('running...'));

