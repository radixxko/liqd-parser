'use strict';

const whitespaces = ' \t\r\n';

const Syntax = require('./syntax');

module.exports = class Parser
{
	constructor( syntax )
	{
		this.syntax = new Syntax( syntax );
	}

	parse( source )
	{
		let parser = { source, position: 0, max_parsed_position: 0 };

		let main = this._parseRule( 'main', parser);

		if( !parser.source.substr( parser.position ).trim() )
		{
			return main;
		}
		else
		{
			let line_number = parser.source.substr(0, parser.max_parsed_position).replace(/[^\n]/g, '').length + 1;
			let line_start = parser.max_parsed_position, line_end = parser.max_parsed_position;

			while( line_start && parser.source[line_start] !== '\n' ){ --line_start; }
			while( line_start < parser.max_parsed_position && whitespaces.includes( parser.source[line_start] ) ){ ++line_start; }
			while( line_end < parser.source.length && parser.source[line_end] !== '\n' ){ ++line_end; }

			let line = parser.source.substr( line_start, Math.min( parser.max_parsed_position + 32, line_end ) - line_start );

			throw 'Can\'t parse at line ' + line_number + ' \n' + line + '\n' + ' '.repeat(parser.max_parsed_position - line_start) + '^';
		}
	}

	_parseRule( rule, parser )
	{
		//console.log('@', rule, parser.position);

		let branches = this.syntax.rule( rule );

		if( branches )
		{
			let position = parser.position;

			for( let branch of branches )
			{
				parser.position = position;
				let capture = {}, value, parsed = true;

				for( let token of branch )
				{
					let token_value = [], token_position = parser.position;

					do
					{
						let parsed_token = this._parseToken( token, parser, capture );

						if( parsed_token !== false )
						{
							token_position = parser.position;
							parser.max_parsed_position = Math.max( parser.max_parsed_position, parser.position );

							token_value.push( parsed_token );
						}
						else
						{
							parser.position = token_position;
							break;
						}
					}
					while( token.array );

					if( token_value.length || token.optional )
					{
						if( token.capture )
						{
							capture[token.capture] = value = ( token.array ? token_value : token_value[0] );

							//console.log( 'capture', capture );
						}
						else if( value === undefined )//&& parsed_token !== undefined )
						{
							value = ( token.array ? token_value : token_value[0] );;
						}
					}
					else
					{
						parsed = false;
						break;
					}
				}

				if( parsed )
				{
					//console.log( 'Returning', JSON.stringify( Object.getOwnPropertyNames( capture ).length ? capture : value ) );

					return Object.getOwnPropertyNames( capture ).length ? capture : value;
				}
			}

			return false;
		}
		else{ throw 'Invalid rule: ' + rule; }
	}

	_parseToken( token, parser, capture )
	{
		while( parser.position < parser.source.length && whitespaces.includes( parser.source[parser.position] ) ){ ++parser.position; }

		if( parser.position < parser.source.length )
		{
			parser.max_parsed_position = Math.max( parser.max_parsed_position, parser.position );

			if( token.RE )
			{
				let capture = parser.source.substr( parser.position ).match( token.RE );

				if( capture )
				{
					parser.position += capture[0].length;
					parser.max_parsed_position = Math.max( parser.max_parsed_position, parser.position );

					return capture[0];
				}
			}
			else if( token.rule )
			{
				return this._parseRule( token.rule, parser );
			}
			else if( token.text )
			{
				if( token.text[0] === parser.source[parser.position] && token.text === parser.source.substr( parser.position, token.text.length ) )
				{
					parser.position += token.text.length;
					parser.max_parsed_position = Math.max( parser.max_parsed_position, parser.position );

					return token.text;
				}
			}
			else if( token.equals )
			{
				let value = capture[token.equals];

				if( value && value[0] === parser.source[parser.position] && value === parser.source.substr( parser.position, value.length ) )
				{
					parser.position += value.length;
					parser.max_parsed_position = Math.max( parser.max_parsed_position, parser.position );

					return value;
				}
			}
			else
			{
				throw 'Invalid token: ' + JSON.stringify( token );
			}
		}

		return false;
	}
}
