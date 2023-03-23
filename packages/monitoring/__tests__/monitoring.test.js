'use strict';

const monitoring = require('..');
const assert = require('assert').strict;

assert.strictEqual(monitoring(), 'Hello from monitoring');
console.info('monitoring tests passed');
