const whitespaces = ' \t\r\n';

class Syntax
{
    constructor( syntax )
    {
        let caret = { position: 0 };

        this.rules = new Map();

        while( caret.position < syntax.length )
        {
            this._parseRule( syntax, caret );
        }

        //console.log( this.definitions, this.rules );
    }

    _getLine( syntax, caret )
    {
        let line, line_end = syntax.indexOf( '\n', caret.position );

        if( line_end === -1 )
        {
            line_end = syntax.length;
        }

        line = syntax.substring( caret.position, line_end ).trim();
        caret.position = line_end + 1;

        return line;
    }

    _parseRule( syntax, caret )
    {
        let rule, pattern, patterns = [];

        while( caret.position < syntax.length && !( rule = this._getLine( syntax, caret ) ) );

        if( rule )
        {
            while( pattern = this._parsePattern( syntax, caret ) )
            {
                patterns.push( pattern );
            }

            if(  rule.indexOf('@') === 0 )
            {
                this.rules.set( rule.substr(1), patterns );
            }
        }
    }

    _parsePattern( syntax, caret )
    {
        let pattern;

        if( caret.position < syntax.length && ( pattern = this._getLine( syntax, caret ) ) )
        {
            if( pattern )
            {
                if( pattern[0] === '/' && pattern[pattern.length - 1] === '/' )
                {
                    pattern = [ new RegExp( pattern.replace(/^[\/\^]+/,'^').replace(/[\$\/]+$/,'') ) ];
                }
                else
                {
                    pattern = pattern.split(/\s+/g);
                }
            }
        }

        return pattern;
    }

    _matchToken( token, source, position )
    {
			//console.log( token, source.substr(position, 10) );

      while( position < source.length && whitespaces.includes( source[position] ) ){ ++position; }

      if( position < source.length )
      {
        if( typeof token === 'string' )
        {
					let array = false, rule, parsed = [], token_position = position;

					if( token.substr(0,3) === '...' )
					{
						array = true;
						token = token.substr(3);
					}

					if( token[0] === '@' )
					{
						rule = true;
						token = token.substr(1);
					}

					//console.log({ array, rule, token });

					try
					{
						do
						{
							//console.log( 'Matchujeme', token );

							if( rule )
							{
								let match = this._matchRule( token, source, token_position );

								//console.log('matching rule', match);

								parsed.push( match.parsed );
								token_position = match.position;
							}
							else if( token === source.substr( token_position, token.length ) )
							{
								//console.log('matching token', token);

								parsed.push( token );
								token_position += token.length;
							}
							else{ throw 'Syntax Error at ' + position; }
						}
						while( array );
					}
					catch(e)
					{
						if( !parsed.length ){ throw e; }
					}

					//console.log('$$$ zvracame', { position: token_position, parsed: array ? parsed : parsed[0] });

					return { position: token_position, parsed: array ? parsed : parsed[0] };
        }
        else if( token instanceof RegExp )
        {
					let match = source.substr(position).match( token );

					if( match )
          {
						//console.log('PARADIZO', { position: position + match[0].length, parsed: match[0] });

            return { position: position + match[0].length, parsed: match[0] };
          }
        }
      }

      throw 'Syntax Error at ' + position;
    }

    _matchRule( rule, source, position )
    {
			let branches = this.rules.get(rule);

			//console.log('rule', rule);

      for( let branch of branches )
      {
				//console.log('branch', branch);
				let branch_parsed = {};
        let branch_position = position;

        try
        {
          for( let token of branch )
          {
            let match = this._matchToken( token, source, branch_position );

            branch_position = match.position;

						if( typeof token === 'string' && ( token[0] === '@' || token.substr(0,4) === '...@' ) )
						{
							//console.log('THa co do pyseka', token, match);

							branch_parsed[ token[0] === '@' ? token.substr(1) : token.substr(4) ] = match.parsed;

							//console.log( branch_parsed );
						}
						else if( branch.length === 1 && token instanceof RegExp )
						{
							branch_parsed = match.parsed;
						}
          }

          return { position: branch_position, parsed: branch_parsed };
        }
        catch(e)
        {
					//console.log(e);
        }
      }

      throw 'Syntax Error at ' + position;
    }

    parse( source )
    {
      let position = this._matchRule( 'main', source, 0 );

	  console.log( JSON.stringify( position.parsed, null, '  ' ) );

      //console.log('Parsed', position, source.substr( 0, position.position ));
    }
}

const syntax_definition = require('fs').readFileSync(__dirname+'/../tests/templates/test.syntax', 'utf8');
const source_code = require('fs').readFileSync(__dirname+'/../tests/templates/test.source', 'utf8');

let syntax = new Syntax( syntax_definition );
let start = process.hrtime();

syntax.parse( source_code );

let end = process.hrtime(start)
console.log( ( end[0] * 1000 + end[1] / 1e6 ) );
