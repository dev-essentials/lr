#!/usr/bin/env node

// Constants
const CHUNK_SIZE = 512;
const REGEX_EXTRACT_RANGES = /(\^|\d+)?(?:-(\d+|\$))?/g;

// Grab streams
const stdin = process.stdin;
const stdout = process.stdout;

class Range {
    constructor([a, b]) {
        this.a = a;
        this.b = b;
        this.passthrough = (false
            || (this.a.isUndefined && this.b.isUndefined)
            || (this.a.fromFirst && this.b.toLast)
        );
    }

    matches(lineNum) {
        // Pass-through
        if (this.passthrough) {
            return true;
        }
        if (this.a.isNum) {
            // Just one line
            if (this.b.isUndefined) {
                return this.a.num === lineNum;
            }
            // Both markers are numbers
            if (this.b.isNum) {
                return lineNum >= this.a.num && lineNum <= this.b.num;
            }
            // End marker is last line
            if (this.b.toLast) {
                return lineNum >= this.a.num;
            }
        } else if (this.a.fromFirst) {
            // From start to line
            if (this.b.isNum) {
                return lineNum <= this.b.num;
            }
        }
        console.error('ERROR! Unhandled case: ');
        console.error(this.a);
        console.error(this.b);
        process.exit(1);
    }
}

class RangeMarker {
    constructor(str) {
        this.fromFirst = str === '^';
        this.toLast = str === '$';
        this.num = parseInt(str);
        this.isNum = !isNaN(this.num);
        this.isUndefined = str === undefined;
    }
}

class LineProcessor {
    constructor(ranges) {
        this.accum = '';
        this.lineCount = 0;
        this.ranges = ranges;
    }

    processLines(lines) {
        while (lines.length > 1) {
            this.processLine(lines.shift());
        }
        return lines.shift(); // rest
    }

    processLine(line) {
        this.lineCount++;
        for (const range of this.ranges) {
            if (range.matches(this.lineCount)) {
                stdout.write(line);
                stdout.write('\n');
            }
        }
    }

    processLastLine() {
        this.processLine(this.accum);
    }

    processChunk(chunk) {
        let data = this.accum + chunk.toString('utf-8');
        let dataLines = data.split('\n');
        this.accum = this.processLines(dataLines);
    }
}

function main() {
    // Parse query parts
    const query = process.argv[2];
    if (query === undefined) return;
    const queryParts = query.split(',');

    // Extract ranges
    const ranges = queryParts
        .map(p => REGEX_EXTRACT_RANGES.exec(p))
        .map(([, start, end]) => [
            new RangeMarker(start),
            new RangeMarker(end)
        ])
        .map(range => new Range(range));

    // Create line processor
    const processor = new LineProcessor(ranges);

    stdin.on('end', () => {
        // Process the last line
        processor.processLastLine();
    });

    stdin.on('readable', () => {
        let chunk;

        // Read chunks of input
        while ((chunk = stdin.read(CHUNK_SIZE)) !== null) {

            // Process the latest input chunk
            processor.processChunk(chunk);
        }
    });
}

main();