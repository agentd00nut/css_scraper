var request = require('request');
var cheerio = require('cheerio');
const Parser = require("./Parser.js");
const CssExtractor = require("./CssExtractor.js");

opt = require('node-getopt').create([
  ['t' , 'text=text_selectors+', 'Raw Text Selectors. '],
  ['f' , 'file=file_selectors+', 'SRC selectors.'],
  ['l' , 'link=link_selectors+', 'Link Selectors, Auto grabs anchor text.'],
  ['u' , 'url=url', 'Url to scrape from'],
  ['d' , 'depth_page=depth_page_selector', 'Selector to find links we should dive into and scrape.'],
  [''  , 'depth_page_prefix=depth_page_prefix', "Prefix to prepend to the href found with depth_page_selector"],
  ['n' , 'next_page=next_page_selector', 'Selector to find the link to the next page.'],
  ['o' , 'timeout=timeout', 'Time in milliseconds to wait for response from server on request.'],
  [''  , 'next_page_prefix=next_page_prefix', 'A prefix to prepend to the href found with next_page_selector'],
  ['p' , 'page_limit=page_limit', 'Max number of pages to scrape.'],
  ['s' , 'start_page=start_page', 'If paginating, dont get data for pages before this value.'],
  ['i' , 'sleep_interval=sleep_interval', 'Amount of time, in milliseconds, to wait before getting the next page when paginating'],
  ['r' , 'raw', 'Output raw data, suitable for piping to other commands or a file.'],
  ['c' , 'combine', 'Merge output into lines instead of a dictionary. '],
  [''  , 'link_prefix=link_prefix', 'A prefix to prepend to the href found for all link selectors.'],
  ['h' , 'help'                    , 'display this help'],
])              
.bindHelp()     
.parseSystem(); 

function get_url(url, cb){
    
    var options = {
      headers: {'user-agent': 'node.js'},
      timeout: timeout,
      uri: url
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            
            cb( body );

        }else{

            console.log(url, response, error);

        }
    });
}

function get_url_follow_link(url, cb){
    //console.log("FETCHING",url);
    var options = {
      headers: {'user-agent': 'node.js'},
      timeout: timeout,
      uri: url
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            page ++;

            if( page >= start_page ){
                cb( body );
            }
            
            if( opt.options.next_page ){
                     
                if( page < page_limit){
                
                    next_url = next_page_parse.link( next_ext.extract(body, true, false).link )[0].href;
                    
                    setTimeout( function(){ get_url_follow_link( next_url , function(body){
                        process_body(body);
                    })}, sleep_interval);
                }
            }

        }else{

            console.log(url, response, error);

        }
    });
}

function get_url_scrape_links(url){

    var options = {
      headers: {'user-agent': 'node.js'},
      timeout: timeout,
      uri: url
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200){

                
            depth_urls = depth_page_parse.link( depth_page_ext.extract(body, true, false).link );

            for(var i=0; i<depth_urls.length  ; i++){

                let depth_url = depth_urls[i].href

                setTimeout( function() { get_url( depth_url, function(body){
                    process_body(body);
                })}, sleep_interval*i);
            }
                

        }else{

            console.log(url, response, error);

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


/// INIT -- Args and Globals

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
let start_page=-1
if(opt.options.page_limit){
    page_limit = opt.options.page_limit
}else{
    page_limit=1;
}
if(opt.options.start_page){
    start_page=opt.options.start_page;
}

let next_page_prefix=false;
let next_page_parse=false;
if(opt.options.next_page_prefix){
    next_page_prefix = opt.options.next_page_prefix;
    next_page_parse = new Parser({'link_prefix':next_page_prefix});
}


let timeout=10000;
if(opt.options.timeout){
    timeout = opt.options.timeout;
}

let sleep_interval=1;
if(opt.options.sleep_interval){
    sleep_interval = opt.options.sleep_interval;
}

let link_prefix=false;
if(opt.options.link_prefix){
    link_prefix = opt.options.link_prefix;
}

let depth_page=false;
let depth_page_parse=false;
let depth_page_prefix=false;
let depth_page_ext;
if(opt.options.depth_page_prefix){
    depth_page_prefix=opt.options.depth_page_prefix;
}
depth_page_parse = new Parser({'link_prefix': depth_page_prefix});



if(opt.options.depth_page){
    depth_page = opt.options.depth_page;
    depth_page_ext = new CssExtractor({'link':[depth_page]});
}


/// INIT -- Extractors and Parsers

let ext = new CssExtractor( selectors );

let next_ext;
if(opt.options.next_page){
    next_ext = new CssExtractor( {"link": [opt.options.next_page]} )
}

let parse = new Parser({'link_prefix':link_prefix});



// MAIN 
if( depth_page ){


    get_url_scrape_links(url)

}else if( opt.options.next_page ){


    get_url_follow_link( url, function(body){
        process_body(body);
    } ) ;

    

}else{

    get_url( url, function(body){
        process_body(body);
    } ) ;

}