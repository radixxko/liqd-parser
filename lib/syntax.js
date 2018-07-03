const lineRE = /^(.+)$/gm;
const ruleRE = /^\:([a-zA-Z][a-zA-Z0-9_]*)\s*$/;
const tokensRE = /^\s+(.*?)\s*$/;
const tokenRuleRE = /^(\?){0,1}([.]{3}){0,1}(\$([a-zA-Z][a-zA-Z0-9_]*){0,1}){0,1}:(([a-zA-Z][a-zA-Z0-9_]*)|((\/.*\/)([0-9]*)))$/;
const tokenRegExpRE = /^(\/.*\/)([0-9]*)$/;
const tokenVariableRE = /^\$([a-zA-Z][a-zA-Z0-9_]*)$/;

module.exports = class Syntax
{
	static parse( source )
	{
		if( source instanceof Buffer ){ source = source.toString('utf8'); }

		let rules = new Object(), rule = null, line, match, tokens, lastIndex = lineRE.lastIndex = 0;

		while( line = lineRE.exec( source ) )
		{
			if( match = ruleRE.exec(line[0]) )
			{
				rules[match[1]] = ( rule = [] );
			}
			else if( match = tokensRE.exec(line[0]) )
			{
				rule.push( tokens = [] );

				for( let token of match[1].split(/\s+/) )
				{
					if( match = tokenRuleRE.exec(token) )
					{
						let item = new Object();

						if( match[1] ){ item.optional = true; }
						if( match[2] ){ item.array = true; }
						if( match[3] ){ item.capture = match[4] || match[6]; }
						if( match[6] ){ item.rule = match[6]; }
						if( match[8] )
						{
							item.RE = new RegExp( match[8].replace(/^\/[\^]{0,1}/,'^(').replace(/[\$]{0,1}\/$/,')\\s*').replace(/\\\//g,'/') );
							item.match = match[9] ? parseInt(match[9]) + 1 : 1;
						}

						tokens.push( item );
					}
					else if( match = tokenRegExpRE.exec(token) )
					{
						tokens.push(
						{
							RE: new RegExp( match[1].replace(/^\/[\^]{0,1}/,'^(').replace(/[\$]{0,1}\/$/,')\\s*').replace(/\\\//g,'/') ),
							match: match[2] ? parseInt(match[2]) + 1 : 1
						});
					}
					else if( match = tokenVariableRE.exec(token) )
					{
						tokens.push({ variable: match[1] });
					}
					else
					{
						tokens.push(
						{
							RE: new RegExp('^(' + token.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') + ')\\s*'),
							match: 1
						});
					}
				}
			}
			else{ throw new Error('Invalid syntax definition "' + line[1] + '"'); }
		}

		return rules;
	}
}
