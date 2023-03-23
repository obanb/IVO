'use strict';

const personalisation = require('..');
const assert = require('assert').strict;

assert.strictEqual(personalisation(), 'Hello from personalisation');
console.info('personalisation tests passed');
