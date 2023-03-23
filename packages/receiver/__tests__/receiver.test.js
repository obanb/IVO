'use strict';

const receiver = require('..');
const assert = require('assert').strict;

assert.strictEqual(receiver(), 'Hello from receiver');
console.info('receiver tests passed');
