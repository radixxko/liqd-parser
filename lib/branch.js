'use strict';

module.exports = class Branch
{
    constructor( nodes )
    {
        this.nodes = nodes;
    }

    parse( source, caret )
    {
        let branch = [], parsed_node;

        for( let i = 0; i < this.nodes.length; ++i )
        {
            if( !( parsed_node = this.nodes[i].parse( source, caret ))){ return }

            branch.push( parsed_node.data );
            caret = parsed_node.caret;
        }

        return { caret, data: branch };
    }

    * node_generator( source, caret, i )
    {
        let parsed_node, node_generator = this.nodes[i].generator( source, caret );

        while(( parsed_node = node_generator.next()) && !parsed_node.done )
        {
            if( i < this.nodes.length - 1 )
            {
                let next_parsed_node, next_node_generator = this.node_generator( source, parsed_node.value.caret, i + 1 );

                while(( next_parsed_node = next_node_generator.next()) && !next_parsed_node.done )
                {
                    yield { caret: next_parsed_node.value.caret, data: [ parsed_node.value.data, ...next_parsed_node.value.data ]};
                }
            }
            else
            {
                yield { caret: parsed_node.value.caret, data: [ parsed_node.value.data ]};
            }
        }
    }

    * generator( source, caret )
    {
        let branch_generator = this.node_generator( source, caret, 0 ), parsed_branch;

        while(( parsed_branch = branch_generator.next()) && !parsed_branch.done )
        {
            yield parsed_branch.value;
        }
    }
}
