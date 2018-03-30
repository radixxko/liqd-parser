'use strict';

module.exports = class Parser
{
	constructor( tokens, syntax = null )
	{
		console.log( syntax );

		this.tokens = tokens;
		this.syntax = null;

		if( syntax )
		{
			this.syntax = {};
			syntax = this.tokenize( syntax );

			for( let i = 0; i < syntax.length; ++i )
			{
				while( i < syntax.length && syntax[i] === '\n' ){ ++i; }

				if( i < syntax.length )
				{
					let rule = syntax[i], pattern = [], prefix = '';
					i += 2;

					while( i < syntax.length )
					{
						if( syntax[i] === '\n' )
						{
							// New rule definition
							if( i + 2 < syntax.length && syntax[i+2] === ':' )
							{
								break;
							}
						}
						else if( '?@'.includes( syntax[i] ) )
						{
							prefix += syntax[i];
						}
						else
						{
							pattern.push( prefix + syntax[i] );
							prefix = '';
						}

						++i;
					}

					this.syntax[ rule ] = pattern;
				}
			}

			console.log( this.syntax );
		}
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
			else if( this.tokens.quotes.includes( c ) )
			{
				token = c; quote = c; escaped = false;

				while( ++i < source.length && ( quote !== ( c = source[i] ) || escaped ) )
				{
					token += c;

					escaped = ( c === '\\' && !escaped );
				}

				tokens.push( token + quote );
			}
			else if( this.tokens.tokens.includes( c ) )
			{
				tokens.push( c );
			}
			else
			{
				token = c;

				while( ++i < source.length && !spaces.includes( c = source[i] ) && !this.tokens.quotes.includes( c ) && !this.tokens.tokens.includes( c ) )
				{
					token += c;
				}

				tokens.push( token );

				--i;
			}
		}

		return tokens.filter( v => ( v !== ' ' ) );
	}

	matchRule( rules, tokens, token_position = 0 )
	{
		for( let rule of rules )
		{
			let element = { rule };
			let i = 0, pattern = this.syntax[rule];

			while( i < pattern.length )
			{
				if( pattern[i] === tokens[token_position + i] )
				{
					//console.log( rule, pattern[i] );
					++i;
				}
				else if( pattern[i][0] === '@' )
				{
					element[ pattern[i].substr(1) ] = tokens[token_position + i];
					//console.log( rule, pattern[i], tokens[token_position + i] );
					++i;
				}
				else if( tokens[token_position + i] === '\n' )
				{
					++i;
				}
				else{
					//console.log( 'Missmatch', rule, pattern[i], tokens[token_position + i] );
					break; }
			}

			if( i == pattern.length )
			{
				console.log( 'Hotofka', element );
				return { rule, element, position: token_position + i + 1 };
			}
		}

		throw 'Exception no rule found at ' + JSON.stringify(tokens.splice( token_position, 10 ));
	}

	parse( source )
	{
		let tokens = this.tokenize( source );

		if( false && this.syntax )
		{
			let rules = Object.keys( this.syntax );

			let position = 0;

			while( position < tokens.length )
			{
				position = this.matchRule( rules, tokens, position ).position;
			}
		}

		return tokens;
	}
}
