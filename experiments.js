const str = `ZPříliš žluťoučký kůň úpěl ďábelské ódy hrasko`;
const RE = new RegExp( '^'+escapeRegExp('Příliš žluťoučký kůň'), 'g' );
const whitespaces = ' \t\r\n';
const whitespacesRE = /^(\s*)/;
const needle = `Příliš žluťoučký kůň`;

console.log( RE );

function escapeRegExp(string)
{
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function randomStr( length )
{
	return require('crypto').randomBytes( Math.ceil(length / 2) ).toString('hex');
}

let len = 0; //strings = [ randomStr(200000) ],

/*for( let i = 0; i < 10000; ++i )
{
	strings.push( randomStr(200000) );
}*/

let options = ['RE', 'startsWith', 'characterMatch'], option = options[Math.floor(Math.random() * options.length)];

option = 'characterMatch';

let start = process.hrtime();

if( option === 'RE' )
{
	for( let i = 0; i < 1000000; ++i )
	{
		len = Boolean(str.match(RE));
	}
}
else if( option === 'startsWith' )
{
	for( let i = 0; i < 1000000; ++i )
	{
		len = str.startsWith( needle );
	}
}
else
{
	for( let i = 0; i < 1000000; ++i )
	{
		let j = 0;
		while( j < needle.length && needle[j] === str[j] ){ ++j; }

		len = ( j === needle.length );
	}
}

let end = process.hrtime(start);

console.log( len, option );

console.log( end[0]*1000 + end[1]/1e6 );

//let str = '';


setInterval( () =>
{
	console.log( (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB' );
},
1000);
