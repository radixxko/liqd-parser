module.exports = class Syntax
{
	constructor( source )
	{
		let syntax = { source, position: 0, line: 0 };

		this._rules = {};

		while( syntax.position < syntax.source.length )
		{
			this._parseRule( syntax );
		}

		this._rules = Object.freeze( this._rules );
	}

	get rules()
	{
		return this._rules;
	}

	rule( rule )
	{
		return this._rules[ rule ];
	}

	_getLine( syntax )
	{
		let start = syntax.position;

		while( syntax.position < syntax.source.length && syntax.source[syntax.position] !== '\n' )
		{
			++syntax.position;
		}

		++syntax.line;

		return syntax.source.substring( start, syntax.position++ ).trim();
	}

	_parseRule( syntax )
	{
		let rule, branch, branches = [];

		while( syntax.position < syntax.source.length && !( rule = this._getLine( syntax ) ) );

		if( rule )
		{
			if( rule[0] === ':' )
			{
				while( ( branch = this._parseBranch( syntax ) ) )
				{
					branches.push( branch );
				}

				this._rules[ rule.substr(1) ] = branches;
			}
			else
			{
				throw 'Invalid character at: "' + rule + '" line ' + syntax.line;
			}
		}
	}

	_parseBranch( syntax )
	{
		let line = this._getLine( syntax );

		if( line )
		{
			if( line[0] === '/' && line[line.length - 1] === '/' )
			{
				return [ { RE: new RegExp( line.replace(/^\/[\^]{0,1}/,'^').replace(/[\$]{0,1}\/$/,'').replace(/\\\//g,'/').replace(/\\/g,'\\\\') ) } ];
			}
			else
			{
				return this._parseTokens( line.split(/\s+/) );
			}
		}

		return null;
	}

	_parseTokens( branch )
	{
		let tokens = [];

		for( let item of branch )
		{
			let token = {};

			if( item[0] === '?' )
			{
				token.optional = true;
				item = item.substr(1);
			}

			if( item.substr(0,3) === '...' )
			{
				token.array = true;
				item = item.substr(3);
			}

			if( item[0] === '$' )
			{
				let rule_delimiter = item.indexOf(':');

				if( rule_delimiter === -1 )
				{
					token.equals = item.substr(1);
					item = '';
				}
				else
				{
					if( rule_delimiter === 1 )
					{
						token.capture = item.substr( rule_delimiter + 1 )
					}
					else
					{
						token.capture = item.substring(1, rule_delimiter);
					}

					item = item.substr(rule_delimiter);
				}
			}

			if( item[0] === ':' )
			{
				token.rule = item.substr(1);
				item = '';
			}

			if( item )
			{
				token.text = item;
			}

			tokens.push( Object.freeze(token) );
		}

		return Object.freeze( tokens );
	}
}
