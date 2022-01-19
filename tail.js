const fs = require('fs');
const { watch } = require('fs/promises');
const Stream = require('stream');
const readline = require('readline');
const Events = require('events');
const abort_controller = new AbortController();
const { signal } = abort_controller;

module.exports = class Tail extends Events {
    constructor(filepath) {
        super();

        (async () => {
            try {
                const watcher = watch(filepath, { signal });
        
                for await (const event of watcher) {
                    switch (event.eventType) {
                        case 'change': {
                            try {
                                let line = await this.getLastLine(event.filename);

                                if (line.length > 0)
                                    this.emit('line', line);
                            }
                            catch (error) {
                                this.emit('error', error);
                            }
                            break;
                        }
                    }
                }
          
            } 
            catch (error) {
                if (error.name === 'AbortError')
                    return;
        
                throw error;
            }
        })();
    }

    getLastLine(filepath, length = 1) {
        let input = fs.createReadStream(filepath);
        let output = new Stream();
    
        return new Promise((resolve, reject) => {
            let last = '';
            let rl = readline.createInterface(input, output);
    
            rl.on('line', line => {
                if (line.length >= length)
                    last = line;
            });
    
            rl.on('error', reject)
            rl.on('close', () => resolve(last));
        })
    }
};