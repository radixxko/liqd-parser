'use strict';

const fs = require('fs');
const Parser = require('../lib/parser');

let definition = 'js-template';

const parser = new Parser({ quotes: '\'"', tokens: '.,;:(){}[]-+<>%/*=@?|&' }, fs.readFileSync( __dirname + '/templates/'+definition+'.syntax', 'utf8'));

let template = parser.parse( fs.readFileSync( __dirname + '/templates/'+definition+'.template', 'utf8') );

//console.log({ template, syntax: parser.syntax });
