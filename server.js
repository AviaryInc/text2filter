var express       = require('express'),
    actionlists   = require('./actionlists.json'),
    Aviary        = require('aviary').Aviary;

var AVIARY_API_KEY = '';
var AVIARY_API_SECRET = '';
var PORT = process.env.PORT || 3000

var aviaryClient = new Aviary(AVIARY_API_KEY, AVIARY_API_SECRET);

var app = express();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 

function genTwiml(message, mediaUrl) {
    if (mediaUrl && mediaUrl.length > 0) {
        message += '<media>' + mediaUrl + '</media>';
    }

    return ['<?xml version="1.0" encoding="UTF-8"?>',
        '<Response>',
            '<Message>',
                message
            '</Message>',
        '</Response>'
        ].join('');
}

app.get('/incoming', function(req, res) {
    var message = req.body.Body;
    var from = req.body.From;

    // Extract image url from message
    var urlPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    var urls = urlPattern.exec(message);

    // TODO: Ex

    if(urls && urls.length > 0) {
        var imageUrl = urls[0];
        var actionList = actionlists.filters.avenue;
        
        // Render image
        aviaryClient.renderAndWait({
            url: imageUrl, 
            actionList: JSON.stringify(actionList)
        }, function(err, renderedUrl) {
            res.writeHead(200, {'Content-Type': 'text/xml'});
            
            if (err) {
                console.log(err);
                return res.end(regenTwiml('Oops! Try sending a valid image url.'));
            } 
            
            return res.end(genTwiml('Oooh pretty!', renderedUrl))
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(genTwiml('Hi there! Try sending an image url.'));
    }
})

server = app.listen(PORT);
console.log("Listening on port %d in %s mode", server.address().port, app.settings.env);