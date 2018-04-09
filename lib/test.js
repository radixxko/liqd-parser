let source = 'janko hrasko marienka test';
let syntax = [ 'janko', /^[a-z]+$/, 'marienka', 'test' ]


function* parse( source, position )
{
  let i = 0;

  while( i < 3 )
  {
    yield ++i;
  }
}

let parser = parse( 'a', 'b' );

for( let i = 0; i < 10; ++i )
{
  let option = parser.next();

  if( option.done ){ break; }

  console.log( option.value );
}

process.exit();

function test()
{
  let position = 0;

  for( let i = 0; i < syntax.length; ++i )
  {
    let token = syntax[i];

    if( typeof token == 'string' )
    {
      let l = 0;

      while( l < token.length && token[l] === source[position+l] ){ ++l; }

      if( l === token.length )
      {
        console.log('Gotcha', '"' + source.substr(position,l) + '"');

        position += l + 1;
      }
    }
    else if( token instanceof RegExp )
    {
      let l = 0, str = '';
      while( token.test( str += source[position+l] ) ){ ++l; }

      if( str.length > 1 )
      {
        str = str.substr(0, str.length - 1);
        console.log( 'regexp', token, '"' + str + '"' );

        position += l + 1;
      }
    }
  }
}


test();
