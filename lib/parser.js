'use strict';

module.exports = class Parser
{
	constructor( syntax )
	{
		this.syntax = syntax;
	}

	tokenize( source )
	{
		const spaces = ' \r\t\n';
		let tokens = [], token, c, quote, space, escaped;

		for( let i = 0; i < source.length; ++i )
		{
			c = source[i];

			if( spaces.includes( c ) )
			{
				space = ( c === '\n' ? '\n' : ' ' );

				while( ++i < source.length && spaces.includes( c = source[i] ) )
				{
					if( c === '\n' ){ space = '\n'; }
				}

				tokens.push( space );

				--i;
			}
			else if( this.syntax.quotes.includes( c ) )
			{
				token = c; quote = c; escaped = false;

				while( ++i < source.length && ( quote !== ( c = source[i] ) || escaped ) )
				{
					token += c;

					escaped = ( c === '\\' && !escaped );
				}

				tokens.push( token + quote );
			}
			else if( this.syntax.tokens.includes( c ) )
			{
				tokens.push( c );
			}
			else
			{
				token = c;

				while( ++i < source.length && !spaces.includes( c = source[i] ) && !this.syntax.quotes.includes( c ) && !this.syntax.tokens.includes( c ) )
				{
					token += c;
				}

				tokens.push( token );

				--i;
			}
		}

		return tokens.filter( v => ( v !== ' ' ) );
	}

	parse( source )
	{
		return this.tokenize( source );
	}
}
