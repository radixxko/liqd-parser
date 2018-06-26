const lineRE = /^(.+)$/gm;
const ruleRE = /^\:([a-zA-Z][a-zA-Z0-9_]*)\s*$/;
const tokensRE = /^\s+(.*?)\s*$/;
const tokenRuleRE = /^(\?){0,1}([.]{3}){0,1}(\$([a-zA-Z][a-zA-Z0-9_]*){0,1}){0,1}:(([a-zA-Z][a-zA-Z0-9_]*)|(\/.*\/))$/;
const tokenRegExpRE = /^\/.*\/$/;
const tokenVariableRE = /^\$([a-zA-Z][a-zA-Z0-9_]*)$/;

RegExp.prototype.toJSON = function(){ return this.toString(); }

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
						if( match[7] ){ item.RE = new RegExp( match[7].replace(/^\/[\^]{0,1}/,'^(').replace(/[\$]{0,1}\/$/,')\\s*').replace(/\\\//g,'/') ) }

						tokens.push( item );
					}
					else if( match = tokenRegExpRE.exec(token) )
					{
						tokens.push({ RE: new RegExp( match[0].replace(/^\/[\^]{0,1}/,'^(').replace(/[\$]{0,1}\/$/,')\\s*').replace(/\\\//g,'/') ) });
					}
					else if( match = tokenVariableRE.exec(token) )
					{
						tokens.push({ variable: match[1] });
					}
					else{ tokens.push({ RE: new RegExp('^(' + token.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') + ')\\s*') }); }
				}
			}
			else{ throw new Error('Invalid syntax definition "' + line[1] + '"'); }
		}

		return rules;
	}
}
