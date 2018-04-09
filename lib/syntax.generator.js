const whitespaces = ' \t\r\n';

class Syntax
{
    constructor( syntax )
    {
        let caret = { position: 0 };

        this.definitions = new Map();
        this.rules = new Map();

        while( caret.position < syntax.length )
        {
            this._parseRule( syntax, caret );
        }

        console.log( this.definitions, this.rules );
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

            if( rule.indexOf('::') === 0 )
            {
                this.definitions.set( rule.substr(2), patterns );
            }
            else if(  rule.indexOf('@') === 0 )
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
                    pattern = new RegExp( pattern.replace(/^[\/\^]+/,'^').replace(/[\$\/]+$/,'$') );
                }
                else
                {
                    pattern = pattern.split(/\s+/g);
                }
            }
        }

        return pattern;
    }

    *matchRule( rule, source, position )
    {
      while( position < source.length && whitespaces.includes( source[position] ) ){ ++position; }

      if( position < source.length )
      {
        if( typeof rule === 'string' )
        {
          if( rule[0] == '@' )
          {
            console.log( '@rule', rule.substr(1) );
          }
          else if( rule[0] === ':' && rule[1] === ':' )
          {
            console.log( '::rule', rule.substr(2) );
          }
          else if( rule === source.substr( position, rule.length ) )
          {
            yield { rule: rule, position: position + rule.length };
          }
        }
        else if( rule instanceof RegExp )
        {
          let match = source.substr(position).match( rule );

          if( match )
          {
            yield { rule: rule, position: position + match[0].length };
          }
        }
      }
    }

    matcho()
    {
      let source = ' janko hrasko';
      //let matchRule = this.matchRule( /^[a-z]+/, source, 0 );
      let matchRule = this.matchRule( '::pravidielko', source, 0 );

      let match;

      while( !( match = matchRule.next() ).done )
      {
        console.log( 'Match', match.value );
      }

      console.log('finito');
    }

    parseBranch( branch, source, position )
    {
      //if( rule indexOf )

      for( let i = 0; i < rule.length; ++i )
      {
      }
    }

    parse( source, branch = null )
    {
      let foro = this.rules.get('for');

      let position = 0;

      for( let foroI of foro )
      {
        let foro_position = position;

        for( let rule of foroI )
        {
          let matchRule = this.matchRule( rule, source, foro_position );

          let match = matchRule.next();

          if( !match.done )
          {
            console.log( 'Maco', match.value, '"' + source.substr(foro_position, match.value.position - foro_position) + '"' );
            foro_position = match.value.position;
          }
          else{ break; }
        }
      }

      console.log( foro );



      //if( !branch ){ branch = this.rules.get('main'); }

      //console.log( branch );

      //for( let subbranch of  )

        //console.log( source );
    }
}

const syntax_definition =
`@for
  for ( x of y ) { }`;

const source_code =
`
for ( x of y )
{

}
`;

let syntax = new Syntax( syntax_definition );
syntax.parse( source_code );
