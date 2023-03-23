'use strict';

const mystay = require('..');
const assert = require('assert').strict;

assert.strictEqual(mystay(), 'Hello from mystay');
console.info('mystay tests passed');
