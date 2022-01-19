const Tail = require('./tail');

const stream = new Tail('./test.log');

stream.on('line', line => {
    console.log('newline:', line, line.length)
});

stream.on('error', error => {
    console.log(error);
});