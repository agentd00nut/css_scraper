var request = require('request');
var cheerio = require('cheerio');

opt = require('node-getopt').create([
  ['t' , 'text=text_selectors+', 'Raw Text Selectors. '],
  ['f' , 'file=file_selectors+', 'SRC selectors.'],
  ['l' , 'link=link_selectors+', 'Link Selectors, Auto grabs anchor text.'],
  ['u' , 'url=url', 'Url to scrape from'],
  ['n' , 'next_page=next_page_selector', 'Selector to find the link to the next page.'],
  ['' ,  'next_page_prefix=next_page_prefix', 'A prefix to append to the href found with next_page_selector'],
  ['p' , 'page_limit=page_limit', 'Max number of pages to scrape.'],
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

function get_url_follow_link(url, cb){
    //console.log("FETCHING",url);
    var options = {
      headers: {'user-agent': 'node.js'}
    }

    request(url, options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            
            cb( body );
            
            if( opt.options.next_page ){
                page ++;
                
                
                if( page < page_limit){
                
                    next_url = parse.link( next_ext.extract(body, true, false).link )[0].href;
                    if(next_page_prefix){
                        next_url = next_page_prefix + next_url;
                    }

                    get_url_follow_link( next_url , function(body){
                        process_body(body);
                    });
                }
                
            }

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

/*
    This should return the processed output instead of logging to console.
    The processed output should contain the next page unstead of just returning it.
*/
function process_body(body){

    data = ext.extract(body, merge=true, simple_merge=false);

    link        = parse.link(data.link);
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

}




selectors={}
if( opt.options.text ){ selectors.text = opt.options.text }
if( opt.options.file ){ selectors.file = opt.options.file }
if( opt.options.link ){ selectors.link = opt.options.link }

let url = opt.options.url;
if( url.indexOf("http") == -1 ){
    url="http://"+url;
}

let page_limit;
let page=0;
if(opt.options.page_limit){
    page_limit = opt.options.page_limit
}else{
    page_limit=1;
}

let next_page_prefix=false;
if(opt.options.next_page_prefix){
    next_page_prefix = opt.options.next_page_prefix;
}


const CssExtractor = require("./CssExtractor.js");
let ext = new CssExtractor( selectors );

let next_ext;
if(opt.options.next_page){
    next_ext = new CssExtractor( {"link": [opt.options.next_page]} )
}



const Parser = require("./Parser.js");
let parse = new Parser();




if( opt.options.next_page ){


    get_url_follow_link( url, function(body){
        process_body(body);
    } ) ;

    

}else{

    get_url( url, function(body){
        process_body(body);
    } ) ;

}