const Tail = require('./tail');
const fs = require('fs');

const stream = new Tail;
const test_file = './test.log';

stream.on('line', line => {
    console.log('newline:', line)
});

stream.on('error', error => {
    console.log(error);
});

stream.on('close', () => {  
    console.log('Stream closed.');
});

stream.start(test_file);

let i = 0;
let interval = setInterval(() => {
    let old = fs.readFileSync(test_file, 'utf8');
    fs.writeFileSync(test_file, old + i.toString() + '\n');
    ++i;
}, 1000);

setTimeout(() => {
    stream.stop();
    clearInterval(interval);
}, 11000)