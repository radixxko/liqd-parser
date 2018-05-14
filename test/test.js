'use strict';

const fs = require('fs');
const Parser = require('../lib/parser');

let definition = 'test';

function elapsed( text, start )
{
	let elapsed = process.hrtime( start );

	console.log( text + ' in ' + ( Math.round(100 * ( elapsed[0] * 1000 + elapsed[1] / 1e6 ) ) / 100 ) + 'ms' );
}

let parserStart = process.hrtime();

const parser = new Parser( fs.readFileSync( __dirname + '/templates/'+definition+'.syntax', 'utf8') );

elapsed( 'Syntax parsing', parserStart );

let templateStart = process.hrtime();

let code = parser.parse( fs.readFileSync( __dirname + '/templates/'+definition+'.result', 'utf8') );

elapsed( 'Template parsing', templateStart );

console.log( JSON.stringify( code, null, '  ' ) );

process.exit();

function getValue( key )
{
	return new Promise( resolve =>
	{
		let sleep = 500; //Math.random() < 0.8 ? 10 : 100 + Math.ceil( Math.random() * 1000 );

		console.log( 'Sleep ' + sleep + ' ms' );

		setTimeout( resolve, sleep );
	});
}

async function render( code )
{
	//console.log( code );

	let output = '';

	if( code.block )
	{
		for( let command of code.block )
		{
			output += await render( command );
		}
	}
	else if( code.tag )
	{
		let tag = code.tag;

		output += '<' + tag.name;

		for( let attribute of tag.attributes )
		{
			output += ' ' + attribute.attribute + '="' + attribute.value + '"';
		}

		output += '>\n';

		if( tag.block )
		{
			for( let command of tag.block )
			{
				output += await render( command );
			}
		}

		output += '</' + tag.name + '>\n';
	}
	else if( code.for )
	{
		let block = { block: code.for.block };

		await getValue( code.for.list );

		for( let i = 0; i < 50; ++i )
		{
			output += await render( block );
		}
	}
	else if( code.definition )
	{
		output += code.definition + '\n';
	}

	return output;
}

function renderPromise( code )
{
	//console.log( code );

	return new Promise( async( resolve ) =>
	{
		let output = [];

		if( code.block )
		{
			for( let command of code.block )
			{
				output.push( renderPromise( command ) );
			}
		}
		else if( code.tag )
		{
			let tag = code.tag;

			output.push( '<' + tag.name );

			for( let attribute of tag.attributes )
			{
				output.push( ' ' + attribute.attribute + '="' + attribute.value + '"' );
			}

			output.push( '>\n' );

			if( tag.infinite )
			{
				
			}

			if( tag.block )
			{
				for( let command of tag.block )
				{
					output.push( renderPromise( command ) );
				}
			}

			output.push( '</' + tag.name + '>\n' );
		}
		else if( code.for )
		{
			let block = { block: code.for.block };

			await getValue( code.for.list );

			for( let i = 0; i < 50; ++i )
			{
				output.push( renderPromise( block ) );
			}
		}
		else if( code.definition )
		{
			output.push( code.definition + '\n' );
		}
		else if( code.model )
		{
			return Model[code.model.model][code.model.method]();
		}

		resolve( ( await Promise.all( output ) ).join('') );
	});
}

( async() =>
{
	let renderStart = process.hrtime();

	let result = await render( code );

	elapsed( 'Render', renderStart );

	console.log( result.split(/\n/).length );

	( async() =>
	{
		let renderPromiseStart = process.hrtime();

		let resultPromise = await renderPromise( code );

		elapsed( 'RenderPromise', renderPromiseStart );

		console.log( resultPromise.split(/\n/).length );

		console.log( result == resultPromise ? 'OK' : 'Error' );

	})();
})();


//console.log( JSON.stringify( template, null, '  ' ) );
