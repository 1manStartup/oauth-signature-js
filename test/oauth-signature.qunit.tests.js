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
test('The resource url should be included in the second segment after the http method and should be suffixed by an ampersand', function () {
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
    equal(new SignatureBaseString('', 'http://example.org:8080').generate(), '&http://example.org&',
        'The non default http port MUST be included');
    equal(new SignatureBaseString('', 'https://example.org:8080').generate(), '&https://example.org&',
        'The non default https port MUST be included');
    equal(new SignatureBaseString('GET', 'http://example.org/?foo=bar').generate(), 'GET&http://example.org/&',
        'The query string should not be included');
    equal(new SignatureBaseString('GET', 'http://example.org/#anchor').generate(), 'GET&http://example.org/&',
        'The anchor should not be included');
});