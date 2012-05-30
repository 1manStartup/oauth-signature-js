window.oauth signer = oauth signer (parameters) = _.extend {
  token () = ""
  token secret () = ""
  version () = "1.0"
  signature method () = 'HMAC-SHA1'
  method () = 'GET'
  timestamp () = Math.floor (new (Date ()).get time () / 1000)
  fields () = {}
  
  oauth parameters () =
    query fields = {
      "oauth_consumer_key" = self.consumer key ()
      "oauth_nonce" = self.nonce ()
      "oauth_timestamp" = self.timestamp ()
      "oauth_signature_method" = self.signature method ()
    }
  
    if (self.token ())
      query fields."oauth_token" = self.token ()

    if (self.version ())
      query fields."oauth_version" = self.version ()
    
    query fields
  
  query string fields () =
    query fields = self.oauth parameters ()

    fields = self.fields ()

    _.each (_.keys (fields)) @(field)
      query fields.(field) = fields.(field)

    query fields

  query string () =
    query arguments = self.query string fields ()
    ordered fields = _.keys (query arguments).sort ()
    _.map (ordered fields) @(field name)
      field name + "=" + self.percent encode (query arguments.(field name))
    .join "&"

  url encoded (fields) =
    _.map (_.keys (fields)) @(field name)
      field name + "=" + encode URI component (fields.(field name))
    .join '&'

  header encoded (fields) =
    _.map (_.keys (fields)) @(field name)
      field name + '="' + encode URI component (fields.(field name)) + '"'
    .join ', '

  url encoded fields () = self.url encoded (self.fields ())
  
  authorization header () =
    fields = self.oauth parameters ()
    fields."oauth_signature" = self.base64 signature ()
    self.header encoded (fields)
  
  url and fields () =
    encoded fields = self.url encoded fields ()
    
    if (encoded fields)
      "#(self.url ())?#(encoded fields)"
    else
      "#(self.url ())"

  parameter encoded (fields) =
    _.map (fields) @(field)
      self.percent encode (field)
    .join '&'

  base string () =
    self.parameter encoded [self.method (), self.url (), self.query string ()]

  hmac key () =
    self.parameter encoded [self.consumer secret (), self.token secret ()]
  
  hmac (encoding: 'binary') =
    if (typeof (process) != 'undefined')
      crypto = require 'crypto'
      h = crypto.create hmac 'sha1' (self.hmac key ())
      h.update (self.base string ())
      h.digest (encoding)
    else
      binary hash = CryptoJS.HmacSHA1 (self.base string () , self.hmac key ())
    
      if (encoding == 'base64')
        binary hash.to string (CryptoJS.enc.Base64)
      else
        binary hash

  base64 signature () = self.hmac (encoding: 'base64')

  signature () =
    self.percent encode (self.base64 signature ())
  
  signed url () =
    "#(self.url ())?#(self.query string ())&oauth_signature=#(self.signature ())"
  
  curl () =
    if (self.method () == "GET")
      "curl '#(self.url ())?#(self.query string ())&oauth_signature=#(self.signature ())'"
    else if ((self.method () == 'POST') || (self.method () == 'PUT'))
      if (self.body ())
        "curl -X #(self.method ()) '#(self.url and fields ())' -d '#(self.body ())' -H 'Authorization: #(self.authorization header ())' -H 'Content-Type: #(self.body encoding ())'"
      else
        "curl -X #(self.method ()) '#(self.url ())' -d '#(self.query string ())&oauth_signature=#(self.signature ())'"
    else
      "curl -X DELETE '#(self.url ())?#(self.query string ())&oauth_signature=#(self.signature ())'"

  percent encode (s) =
    encode URI component (s).replace r/\*/g '%2A'
} (parameters)
