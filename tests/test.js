'use strict';

const fs = require('fs');
const Parser = require('../lib/parser');

const parser = new Parser({ quotes: '\'"', tokens: '.,;:(){}[]-+<>%/*=@?|&' }, fs.readFileSync( __dirname + '/templates/javascript.syntax', 'utf8'));

let template = parser.parse( fs.readFileSync( __dirname + '/templates/javascript.template', 'utf8') );

console.log({ template, syntax: parser.syntax });
