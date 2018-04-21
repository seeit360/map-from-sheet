var shorterNames = {
  aqua: /#00ffff|#0ff/gi,
  azure: /#f0ffff/gi,
  beige: /#f5f5dc/gi,
  bisque: /#ffe4c4/gi,
  black: /#000000|#000/g,
  blue: /#0000ff|#00f/gi,
  brown: /#a52a2a/gi,
  coral: /#ff7f50/gi,
  cornsilk: /#fff8dc/gi,
  crimson: /#dc143c/gi,
  cyan: /#00ffff|#0ff/gi,
  darkblue: /#00008b/gi,
  darkcyan: /#008b8b/gi,
  darkgrey: /#a9a9a9/gi,
  darkred: /#8b0000/gi,
  deeppink: /#ff1493/gi,
  dimgrey: /#696969/g,
  gold: /#ffd700/gi,
  green: /#008000/g,
  grey: /#808080/g,
  honeydew: /#f0fff0/gi,
  hotpink: /#ff69b4/gi,
  indigo: /#4b0082/gi,
  ivory: /#fffff0/gi,
  khaki: /#f0e68c/gi,
  lavender: /#e6e6fa/gi,
  lime: /#00ff00|#0f0/gi,
  linen: /#faf0e6/gi,
  maroon: /#800000/g,
  moccasin: /#ffe4b5/gi,
  navy: /#000080/g,
  oldlace: /#fdf5e6/gi,
  olive: /#808000/g,
  orange: /#ffa500/gi,
  orchid: /#da70d6/gi,
  peru: /#cd853f/gi,
  pink: /#ffc0cb/gi,
  plum: /#dda0dd/gi,
  purple: /#800080/g,
  red: /#ff0000|#f00/gi,
  salmon: /#fa8072/gi,
  seagreen: /#2e8b57/gi,
  seashell: /#fff5ee/gi,
  sienna: /#a0522d/gi,
  silver: /#c0c0c0/gi,
  skyblue: /#87ceeb/gi,
  snow: /#fffafa/gi,
  tan: /#d2b48c/gi,
  teal: /#008080/g,
  thistle: /#d8bfd8/gi,
  tomato: /#ff6347/gi,
  violet: /#ee82ee/gi,
  wheat: /#f5deb3/gi,
  white: /#ffffff|#fff/gi,
};

var REGEX = {
  whitespace: /\s+/g,
  urlHexPairs: /%[\dA-F]{2}/g,
  quotes: /"/g,
};

function collapseWhitespace(str) {
	return str.trim().replace(REGEX.whitespace, ' ');
}

function dataURIPayload(string) {
	return encodeURIComponent(string).replace(REGEX.urlHexPairs, specialHexEncode);
}

// `#` gets converted to `%23`, so quite a few CSS named colors are shorter than
// their equivalent URL-encoded hex codes.
function colorCodeToShorterNames(string) {
	Object.keys(shorterNames).forEach(function(key, i) {
		if (shorterNames[key].test(string)) {
			string = string.replace(shorterNames[key], key);
		}
	});

	return string;
}

function specialHexEncode(match) {
// Browsers tolerate these characters, and theyre frequent
	switch (match) {
		case '%3C': return '%3C';
		case '%3E': return '%3E';
		case '%2F': return '%2F';
		case '%5B': return '[';
		case '%5D': return ']';
		case '%20': return ' ';
		case '%3D': return '=';
		case '%3A': return ':';
		case '%2F': return '/';
	}
}

function svgToTinyDataUri(svgString) {
	if (typeof svgString !== 'string') {
		throw new TypeError(`Expected a string, but received ${typeof svgString}`);
	}
	// Strip the Byte-Order Mark if the SVG has one
	if (svgString.charCodeAt(0) === 0xfeff) { svgString = svgString.slice(1) }

	var body = colorCodeToShorterNames(collapseWhitespace(svgString)).replace(REGEX.quotes, "'");
	return 'data:image/svg+xml,' + dataURIPayload(body);
}