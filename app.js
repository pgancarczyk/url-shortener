    const polka = require('polka');
const fs = require('fs');
const redis = require('redis');
const bodyParser = require('body-parser');
const isUrl = require("is-valid-http-url");

const db = redis.createClient(process.env.REDIS_URL);
db.on('error', err => { console.log(err); });

const index = fs.readFileSync('./index.html', 'utf8');

const app = polka();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.write(index);
    res.end();
    next();
});

app.get('/:key', (req, res, next) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.write('requested ' + req.params.key);
    res.end();
    next();
});

app.post('*', (req, res, next) => {
    if (req.body && req.body[0] && typeof req.body[0] === 'string' && isUrl(req.body[0])) {
        let key = 'test_key';
        res.writeHead(200, { 'content-type': 'application/json' });
        res.write("");
    }
    else res.statusCode = 400;
    res.end();
    next();
});

app.use((req, res, next) => {
    console.log(req.url);
    next();
});

app.listen(process.env.PORT || 3000, err => {
    if (err) throw err;
});

