var hyperquest = require('hyperquest')
var JSONStream = require('JSONStream')
var through = require('through2')

module.exports = function (source, sink) {
  var output = through()

  var opts = {
    headers: {
      'content-type': 'application/json'
    }
  }

  hyperquest(source + '/admin/pages.json')
    .pipe(JSONStream.parse('pages.*'))
    .pipe(through.obj(write, end))

  return output

  function write (obj, enc, next) {
    if (!obj.title || !obj.body_html) return next()

    var post = hyperquest.post(sink + '/admin/pages.json', opts)
    post.pipe(output, {end: false})
    post.end(JSON.stringify({
      page: {
        title: obj.title,
        body_html: obj.body_html
      }
    }))

    post.on('end', next)
  }

  function end (next) {
    output.end()
    next()
  }
}
