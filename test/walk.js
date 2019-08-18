'use strict';

const Terminal = require('../lib/terminal.js');
const Branch = require('../lib/branch.js');
const Node = require('../lib/node.js');

const space         = new Terminal( /\s*/y );
const str_a         = new Terminal( /"([^"]*)"/y );
const str_b         = new Terminal( /'([^']*)'/y );
const attr_name     = new Terminal( /[a-zA-Z_][a-zA-Z0-9_:]*/y );
const equals        = new Terminal( /=/y );
const value         = new Node([ str_a, str_b ]);
const attr          = new Branch([ attr_name, space, equals, space, attr_name ]);
const attr          = new Branch([ attr_name, space, equals, space, attr_name ]);
const cdata         = new Terminal( /<!\[CDATA\[\s*([\s\S]*?)\s*\]\]>/y );

const wut_terminal = new Terminal( /[a-z]+/y );
const then_terminal = new Terminal( /then/y );
const else_terminal = new Terminal( /else/y );

//const if_branch = new Branch([ space, if_terminal, space ]);
//const if_then_branch = new Branch([ space, if_terminal, space, then_terminal ]);

const a_branch = new Branch([ space, if_terminal, space, then_terminal, space, else_terminal, space ]);
const b_branch = new Branch([ space, if_terminal, space, wut_terminal, space, else_terminal, space ]);

//const main = new Node([ if_branch, if_then_branch, if_then_branch, if_branch ]);
const main = new Node([ a_branch, b_branch ]);

let generator = main.generator( ' if then else ', 0 ), parsed;

while(( parsed = generator.next() ) && !parsed.done )
{
    console.log( parsed.value );
}

let parser = main.parse( 'if then else', 0 );

//console.log( parser );


/*
const fs = require('fs');
const Parser = require('../lib/parser');

const parser = new Parser( fs.readFileSync( __dirname + '/templates/walk.syntax', 'utf8') );

let code = parser.parse( fs.readFileSync( __dirname + '/templates/walk.source', 'utf8') );

console.log( code );
*/
