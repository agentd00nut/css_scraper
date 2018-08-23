var cheerio = require('cheerio');


function CssExtractor(css_selectors, output){
    this.selectors = {}
    this.selectors.file = css_selectors.file;
    this.selectors.link = css_selectors.link;
    this.selectors.text = css_selectors.text;
    this.css_selectors = css_selectors;
    this.output = output;
}

CssExtractor.prototype.select = function(body, selectors, merge=true){
    var result = [];
    $ = cheerio.load(body);

    for( var i=0; i<selectors.length; i++){
        selector = selectors[i];

        $(selector).each(function(i, elem) {

            d = this;

            if(merge){
                if(!result[i]){ 
                    result[i] = [d]
                }
                else{ 
                    result[i].push( d ) 
                }
            }else{
                result.push(d);
            }
        });
    }

    return result;

}

CssExtractor.prototype.extract = function(body, merge=true, simple_merge=true){
    var result = {};

    if( this.selectors.file ){
        result.file = this.select( body, this.selectors.file, merge )
    }
    if( this.selectors.link ){

        result.link = this.select( body, this.selectors.link, merge )
    }
    if( this.selectors.text ){
        result.text = this.select( body, this.selectors.text, merge )
    }
        

    if(this.output){
        this.output( result );
    }


    return result;
}

module.exports = CssExtractor;