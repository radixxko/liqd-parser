'use strict';

module.exports = class Terminal
{
    constructor( re )
    {
        this.re = re;
    }

    parse( source, caret )
    {
        let match; this.re.lastIndex = caret;

        if( match = this.re.exec( source ))
        {
            return { caret: caret + match[0].length, data: match[0] }
        }
    }

    * generator( source, caret )
    {
        let match; this.re.lastIndex = caret;

        if( match = this.re.exec( source ))
        {
            yield { caret: caret + match[0].length, data: match[0] }
        }
    }
}
