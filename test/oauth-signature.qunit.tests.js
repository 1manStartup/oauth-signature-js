module('Oauth Signature Base String');
test('It should start with an uppercase http method, followed by two ampersands', function () {
	equal(new SignatureBaseString('get').generate(), 'GET&&',
		'The component separator (&) should be included for omitted elements');
	equal(new SignatureBaseString('pOsT').generate(), 'POST&&',
		'The component separator (&) should be included for omitted elements');
	equal(new SignatureBaseString('').generate(), '&&',
		'The http method shouldn\'t be included if it is empty');
	equal(new SignatureBaseString().generate(), '&&',
		'The http method shouldn\'t be included if it  is not passed');
	equal(new SignatureBaseString(null).generate(), '&&',
		'The http method shouldn\'t be included if it is null');
	equal(new SignatureBaseString(undefined).generate(), '&&',
		'The http method shouldn\'t be included if it is undefined');
});
test('The resource url should be included in the second element after the http method and should be suffixed by an ampersand', function () {
	equal(new SignatureBaseString('GET', 'http://example.co.uk').generate(), 'GET&http://example.co.uk&',
		'The http method should be the first component of the url');
	equal(new SignatureBaseString('', 'http://EXAMPLE.co.UK/endpoint').generate(), '&http://example.co.uk/endpoint&',
		'The URL authority must be lowercase');
    equal(new SignatureBaseString('', 'http://EXAMPLE.co.UK/endpoint/').generate(), '&http://example.co.uk/endpoint/&',
		'It should not strip off the trailing /');
    equal(new SignatureBaseString('', 'HTTP://example.org').generate(), '&http://example.org&',
        'The URL scheme must be lowercase');
    equal(new SignatureBaseString('', 'http://example.org:80').generate(), '&http://example.org&',
		'The default http port (80) MUST be excluded');
    equal(new SignatureBaseString('', 'https://example.org:443').generate(), '&https://example.org&',
        'The default https port (443) MUST be excluded');
    equal(new SignatureBaseString('', 'http://example.org:8080').generate(), '&http://example.org:8080&',
        'The non default http port MUST be included');
    equal(new SignatureBaseString('', 'https://example.org:8080').generate(), '&https://example.org:8080&',
        'The non default https port MUST be included');
    equal(new SignatureBaseString('GET', 'http://example.org/?foo=bar').generate(), 'GET&http://example.org/&',
        'The query string should not be included');
    equal(new SignatureBaseString('GET', 'http://example.org/#anchor').generate(), 'GET&http://example.org/&',
        'The anchor should not be included');
	equal(new SignatureBaseString('', '').generate(), '&&',
		'The resource url should not be included if it is empty');
	equal(new SignatureBaseString('', null).generate(), '&&',
		'The resource url should not be included if it is null');
	equal(new SignatureBaseString('', undefined).generate(), '&&',
		'The resource url should not be included if it is undefined');
	equal(new SignatureBaseString('', 'example.org').generate(), '&http://example.org&',
		'The http URL scheme is added automatically');
	equal(new SignatureBaseString('', 'example.org:100').generate(), '&http://example.org:100&',
		'The port will not be stripped if the scheme is missing');
	equal(new SignatureBaseString('', 'example.org:80').generate(), '&http://example.org&',
		'The default http port will be stripped if the scheme is missing');
});
test('The normalized request parameters should be the last element', function () {
	equal(new SignatureBaseString('', '', { foo : 'bar' }).generate(), '&&foo=bar',
		'The parameter should be appended');
	equal(new SignatureBaseString('', '', { foo : 'bar', baz : 'qux' }).generate(), '&&baz=qux&foo=bar',
		'The parameters specified with object initializer should be ordered alphabetically');
	equal(new SignatureBaseString('', '', [{ foo : 'bar' }, { baz : 'qux' }]).generate(), '&&baz=qux&foo=bar',
		'The parameter specified with an array of objects should be ordered alphabetically');
	equal(new SignatureBaseString('', '', [{ foo : 'qux' }, { foo : 'bar'}, {foo : 'baz' }, { a : 'b' }]).generate(), '&&a=b&foo=bar&foo=baz&foo=qux',
		'The parameter specified with an array of objects with the same key should be ordered alphabetically by value');
	equal(new SignatureBaseString('', '', [{ foo : [ 'qux', 'bar', 'baz' ]}, { a : 'b' }]).generate(), '&&a=b&foo=bar&foo=baz&foo=qux',
		'The parameter specified with an array of objects with an array of values for the same key should be ordered alphabetically by value');
	equal(new SignatureBaseString('', '', { foo : [ 'qux', 'bar', 'baz'], a : 'b' }).generate(), '&&a=b&foo=bar&foo=baz&foo=qux',
		'The array of values for a single key should be ordered alphabetically by value');
	equal(new SignatureBaseString('', '', '').generate(), '&&',
		'The request parameters should not be included if it is empty');
	equal(new SignatureBaseString('', '', null).generate(), '&&',
		'The request parameters should not be included if it is null');
	equal(new SignatureBaseString('', '', undefined).generate(), '&&',
		'The request parameters should not be included if it is undefined');
});
test('The value should be encoded following the RFC3986', function () {
	var i,
		unreservedCharacters =  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
							    'abcdefghijklmnopqrstuvwxyz' +
								'0123456789-_.~',
		reservedCharactersWithEncoding =[
			['!', '%21'], ['#', '%23'], ['$', '%24'], ['&', '%26'],	['\'', '%27'],
			['(', '%28'], [')', '%29'], ['*', '%2A'], ['+', '%2B'], [',', '%2C'],
			['/', '%2F'], [':', '%3A'], [';', '%3B'], ['=', '%3D'], ['?', '%3F'],
			['@', '%40'], ['[', '%5B'], [']', '%5D']
		];
	equal(new OAuthParameterEncoder().encode(unreservedCharacters), unreservedCharacters,
		'Characters in the unreserved character set MUST NOT be encoded');
	equal(new OAuthParameterEncoder().encode('*'), '%2A',
		'Hexadecimal characters in the encodings MUST be uppercase using the percent-encoding (%xx)');
	for (i = 0; i < reservedCharactersWithEncoding.length; i++) {
		equal(new OAuthParameterEncoder().encode(reservedCharactersWithEncoding[i][0]), reservedCharactersWithEncoding[i][1],
			'Characters not in the unreserved character set MUST be encoded');

	}
	equal(new OAuthParameterEncoder().encode('%'), '%25',
		'Percent character must be encoded');
});
test('The value containing UTF8 characters should be encoded following the RFC3629', function () {
	equal(new OAuthParameterEncoder().encode('åçñ'), '%C3%A5%C3%A7%C3%B1',
		'Text names and values MUST be encoded as UTF-8 octets before percent-encoding them');
	equal(new OAuthParameterEncoder().encode('你好'), '%E4%BD%A0%E5%A5%BD',
		'Text names and values MUST be encoded as UTF-8 octets before percent-encoding them');

});