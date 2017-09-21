
function Parser(){
}

Parser.prototype.text = function(data, cb){
    var result = [];
    var tmp;

    if(! data ){ return result }
    

    data.forEach( function(e){ 
        
        if( Array.isArray( e ) ){

            tmp = [];
            
            for(var i=0; i<e.length; i++){
                tmp.push( $(e[i]).text().trim() );
            }

            result.push(tmp);

        }else{
            result.push( $(e).text().trim() );
        }
    });

    if(cb){ cb(result); }

    return result;
}

Parser.prototype.link = function(data, cb){
    var result = [];
    
    if(! data ){ return result }

    data.forEach( function(e){ 
        result.push( { "anchor":$(e).text().trim(), "href":$(e).attr('href') } );
    });

    if(cb){ cb(result); }

    return result;
}

Parser.prototype.src = function(data,  cb){
    var result = [];
    
    if(! data ){ return result }

    data.forEach( function(e){ 
        result.push( $(e).attr('src') );
    });

    if(cb){ cb(result); }

    return result;
}

Parser.prototype.attr = function(data, attr, cb){
    var result = [];

    if(! data ){ return result }
    
    data.forEach( function(e){ 
        result.push( $(e).attr(attr) );
    });

    if(cb){ cb(result); }

    return result;
}

Parser.prototype.combine = function(link, text, file, join=true){

    var biggest = link.length;
    if( text.length > biggest ){ biggest = text.length }
    if( file.length > biggest ){ biggest = file.length }

    var result=[];
    var tmp;
    for(var i=0; i<biggest; i++){
        tmp=[];

        if(!join){
            if( link[i] ){ tmp.push( link[i] ) }
            if( text[i] ){ tmp.push( text[i] ) }
            if( file[i] ){ tmp.push( file[i] ) }

            result.push( tmp )
        }else{

            if( link[i] ){ tmp.push( [link[i].anchor, link[i].href].join('|') ) }
            if( text[i] ){ tmp.push( text[i].join("|") ) }
            if( file[i] ){ tmp.push( file[i].join("|") ) }

            result.push( tmp.join('|') )
        }
    }

    return result;

}

module.exports = Parser;