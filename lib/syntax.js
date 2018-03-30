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
                this.rules.set( rule.substr(2), patterns );
            }
            else if(  rule.indexOf('@') === 0 )
            {
                this.definitions.set( rule.substr(1), patterns );
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

    parse( source )
    {
        let branches = [ 'main' ];

        console.log( source );
    }
}

let syntax = new Syntax( require('fs').readFileSync( __dirname + '/../tests/templates/js-template.syntax', 'utf8' ) );
syntax.parse( require('fs').readFileSync( __dirname + '/../tests/templates/js-template.template', 'utf8' ) );
