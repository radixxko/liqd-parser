'use strict';

module.exports = class Parser
{
	constructor( syntax )
	{
		this.syntax = require('./syntax').parse( syntax );
	}

	parse( source )
	{
		if( source instanceof Buffer ){ source = source.toString('utf8'); }

		source = source.trimLeft();

		let parsed_source = this._parseRule( source, this.syntax.main );

		if( parsed_source === false || parsed_source.source.length )
		{
			let debug = { remaining: Infinity };
			this._parseRule( source, this.syntax.main, debug );

			let max_parsed_position = source.length - debug.remaining;
			let line_number = source.substr(0, max_parsed_position).replace(/[^\n]/g, '').length + 1;
			let line_start = max_parsed_position, line_end = max_parsed_position;

			while( line_start && source[line_start] !== '\n' ){ --line_start; }
			while( line_start < max_parsed_position && ' \t\r\n'.includes( source[line_start] ) ){ ++line_start; }
			while( line_end < source.length && source[line_end] !== '\n' ){ ++line_end; }

			let line = source.substr( line_start, Math.min( max_parsed_position + 32, line_end ) - line_start );

			throw new Error('Can\'t parse at line ' + line_number + ' \n' + line + '\n' + ' '.repeat(max_parsed_position - line_start) + '^');
		}
		else{ return parsed_source.capture; }
	}

	_parseRule( source, rule, debug = false )
	{
		branchloop: for( let branch of rule )
		{
			let branch_source = source, branch_capture = new Object(), match, last_capture;

			for( let token of branch )
			{
				let first = true, capture;

				array: do
				{
					capture = undefined;

					if( token.RE )
					{
						if( match = token.RE.exec( branch_source ) )
						{
							capture = match[ token.match || 1 ];
							branch_source = branch_source.substr( match[0].length );
						}
					}
					else if( token.rule )
					{
						let parsed = this._parseRule( branch_source, this.syntax[token.rule], debug );

						if( parsed !== false )
						{
							capture = parsed.capture;
							branch_source = parsed.source;
						}
					}
					else if( token.variable )
					{
						let variable = branch_capture[token.variable];

						if( branch_source.startsWith( variable ) )
						{
							capture = variable;
							branch_source = branch_source.substr( variable.length ).trimLeft();
						}
					}
					else{ throw new Error('Unsupported token: ' + JSON.stringify(token)); }

					if( capture === undefined )
					{
						if( !first ){ break array; }
						else if( !token.optional ){ continue branchloop; }
						else if( token.capture )
						{
							branch_capture[token.capture] = token.array ? [] : undefined;
						}
					}
					else
					{
						if( token.capture )
						{
							if( token.array )
							{
								if( first ){ branch_capture[token.capture] = []; }
								branch_capture[token.capture].push( capture );
							}
							else{ branch_capture[token.capture] = capture; }
						}
						else{ last_capture = capture; }

						if( debug && debug.remaining > branch_source.length )
						{
							debug.remaining = branch_source.length;
						}
					}

					first = false;
				}
				while( token.array && capture );
			}

			return { capture: Object.keys(branch_capture).length ? branch_capture : last_capture, source: branch_source };
		}

		return false;
	}
}
