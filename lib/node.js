'use strict';

module.exports = class Node
{
    constructor( branches )
    {
        this.branches = branches;
    }

    parse( source, caret )
    {
        let nodes = [], parsed_branch;

        for( let i = 0; i < this.branches.length; ++i )
        {
            if( parsed_branch = this.branches[i].parse( source, caret ))
            {
                return parsed_branch;
            }
        }
    }

    * generator( source, caret )
    {
        let nodes = [], parsed_branch;

        for( let i = 0; i < this.branches.length; ++i )
        {
            let branch_generator = this.branches[i].generator( source, caret );

            while(( parsed_branch = branch_generator.next()) && !parsed_branch.done )
            {
                yield parsed_branch.value;
            }
        }
    }
}
