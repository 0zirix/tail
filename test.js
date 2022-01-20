const Tail = require('./tail');
const fs = require('fs');

const stream = new Tail('./test.log');

stream.on('line', line => {
    console.log('newline:', line)
});

stream.on('error', error => {
    console.log(error);
});

stream.on('close', () => {  
    console.log('Stream closed.');
});


let i = 0;
let interval = setInterval(() => {
    fs.writeFileSync('./test.log', i.toString() + '\n');
    ++i;
}, 1000);

setTimeout(() => {
    stream.stop();
    clearInterval(interval);
}, 4000)