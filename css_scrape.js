var request = require('request');
var cheerio = require('cheerio');

opt = require('node-getopt').create([
  ['t' , 'text=text_selectors+', 'Raw Text Selectors. '],
  ['f' , 'file=file_selectors+', 'SRC selectors.'],
  ['l' , 'link=link_selectors+', 'Link Selectors, Auto grabs anchor text.'],
  ['u' , 'url=url', 'Url to scrape from'],
  ['r' , 'raw', 'Output raw data, suitable for piping to other commands or a file.'],
  ['c' , 'combine', 'Merge output into lines instead of a dictionary. '],
  ['h' , 'help'                    , 'display this help'],
])              
.bindHelp()     
.parseSystem(); 


function get_url(url, cb){
    
    var options = {
      headers: {'user-agent': 'node.js'}
    }

    request(url, options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            
            cb( body );

        }else{

            console.log(url, response.statusCode, error);

        }
    });
}

function raw_output(out_dict){

    for(var i=0; i<out_dict.link.length; i++){
        console.log( [ out_dict.link[i].anchor, out_dict.link[i].href].join("|") )   
    }

    for(var i=0; i<out_dict.text.length; i++){
        if( Array.isArray( out_dict.text[i] )){
            console.log(out_dict.text[i].join("|"));       
        }else{
            console.log(out_dict.text[i]);
        }
    }

    for(var i=0; i<out_dict.file.length; i++){
        if( Array.isArray( out_dict.file[i] )){
            console.log(out_dict.file[i].join("|"));       
        }else{
            console.log(out_dict.file[i]);
        }
    }
}

selectors={}
if( opt.options.text ){ selectors.text = opt.options.text }
if( opt.options.file ){ selectors.file = opt.options.file }
if( opt.options.link ){ selectors.link = opt.options.link }

url = opt.options.url;
if( url.indexOf("http") == -1 ){
    url="http://"+url;
}

const CssExtractor = require("./CssExtractor.js");
let ext = new CssExtractor( selectors );

const Parser = require("./Parser.js");
let parse = new Parser();

get_url( url , function(body){
    
    data = ext.extract(body, merge=true, simple_merge=false);


    link       = parse.link(data.link);
    text        = parse.text(data.text);
    file        = parse.src(data.file);
    combined=[];

    
    if( opt.options.combine ){
        if(  opt.options.raw ) {

            parse.combine( link, text, file).forEach( function(e){ 
                console.log( e );
            });

        }else{

            console.log( parse.combine( link, text, file) )
        }
    }else{

        if( opt.options.raw ){

            raw_output( {"link": link, "text":text, "file":file} );

        }else{

            console.log(  {"link": link, "text":text, "file":file} );
        }
    }
    
}) ;