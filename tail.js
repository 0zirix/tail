const fs = require('fs');
const Stream = require('stream');
const Events = require('events');
const readline = require('readline');
const { watch } = require('fs/promises');

module.exports = class Tail extends Events {
    constructor(filepath) {
        super();
        this.controller = new AbortController();
        this.start(filepath);
    }

    stop() {
        this.controller.abort();
        this.emit('close');
    }

    async start(filepath) {
        try {
            const watcher = watch(filepath, {
                signal: this.controller.signal
            });

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
    }

    getLastLine(src, min_line_length = 1) {
        let input = fs.createReadStream(src);
        let output = new Stream();

        return new Promise((resolve, reject) => {
            let last, rl = readline.createInterface(input, output);

            rl.on('line', line => {
                if (line.length >= min_line_length)
                    last = line;
            });

            rl.on('error', reject)
            rl.on('close', () => resolve(last));
        })
    }
};