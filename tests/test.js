'use strict';

const fs = require('fs');
const Parser = require('../lib/parser');

const parser = new Parser({ quotes: '\'"', tokens: '.,;:(){}[]-+<>%/*=' });

console.log( parser.parse( fs.readFileSync( __dirname + '/templates/javascript.template', 'utf8') ) );
