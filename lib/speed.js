let i = 0;

function generate( output, level = 0 )
{
  if( level >= 7 )
  {
    ++i;
    output.result += '<div level="' + level + '" asdjsadhkja sahdjsahdjk asjashdk jashdjk dhskja ahd kajsd d askjd askjhdajks skjdhasjk dsjkdhskdh khadsk dahskjdhaskjd haskjadhskjdhshdkjashadjk>' + '</div>';
  }
  else
  {
    for( let i = 0; i < 3; ++i )
    {
      generate( output, level + 1 );
    }
  }
}

let start = process.hrtime();

let output = { result: '' };
generate( output );

let end = process.hrtime(start);

console.log(end[0] * 1000 + end[1] / 1e6);
console.log(i);
//console.log(output.result);
