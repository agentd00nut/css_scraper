# Css_scraper
Simplify web scraping through css selectors.

Easily scrape links, text, and files from a single page by specifying multiple selectors for each data type.

Combine the output to easily read the results.

Dump the output raw for easy processing with other tools or to disk.

Scrape multiple pages by specifying a next link selector and how many pages to scrape

Control what page to start scraping on.

Specify load timeouts.

Use sleep intervals to wait before getting the next page.

Specify prefix  text to add to links or file src's

_Scrape multiple pages by specifying how a url paginates_

_Specify custom delimiters for output_

_italics_ are soon to be features.

# Don't be a jerk 

Obviously use discretion when using anything that scrapes data from web pages.
It's your fault if you get your ip banned from a site you like or anything like that!

# Example

Lets pull article titles, links, when they were posted, and the user that posted them from [hacker news](news.ycombinator.com).

```
    node css_scrape.js -u "news.ycombinator.com/" -t '.age a' -t'.hnuser' -l '.storylink'   -c -r
```

# Usage
```
  -t, --text=text_selectors+               Raw Text Selectors.
  -f, --file=file_selectors+               SRC selectors.
  -l, --link=link_selectors+               Link Selectors, Auto grabs anchor text.
  -u, --url=url                            Url to scrape from
  -n, --next_page=next_page_selector       Selector to find the link to the next page.
  -t, --timeout=timeout                    Time in milliseconds to wait for response from server on request.
      --next_page_prefix=next_page_prefix  A prefix to prepend to the href found with next_page_selector
  -p, --page_limit=page_limit              Max number of pages to scrape.
  -s, --start_page=start_page              If paginating, dont get data for pages before this value.
  -i, --sleep_interval=sleep_interval      Amount of time, in milliseconds, to wait before getting the next page when paginating
  -r, --raw                                Output raw data, suitable for piping to other commands or a file.
  -c, --combine                            Merge output into lines instead of a dictionary.
      --link_prefix=link_prefix            A prefix to prepend to the href found for all link selectors.
  -h, --help                               display this help
```

*-t, -f, -l* Are used to specify the css selectors you want to use to scrape the web page with.  You can specify an unlimited number of selectors for each type by passing the flag more than once.
Selectors of the same type will get combined.  In the example above we combine the *Text* selectors of '.age a' and '.hnuser'.  The output will be a 1:1 of "<.age a>,<.hnuser>".

*-t* Grabs all the text matched by the selector.

*-f* Will pull the "src=" value from anything matched by the selectors.

*-l* Will pull the "href=" value from anything matched by the selectors, but also the anchor text.
Since the anchor text is grabbed it's not necessary to use a *-t* selector to get the text for links.

*-u* The url to scrape from, multiple urls are not yet supported. Urls MUST contain "http://" or "https://".

*-n* Specify a selector to use when finding the link for the next page to scrape.  Will use the href value of whatever it selects.

*--next_page_prefix* Use if the next page selectors href value isn't a full valid url.  Urls MUST contain "http://" or "https://".

*-r* Makes the output suitable for parsing by other commands.  Generally you will want this flag off while verifying you are grabbing the right stuff and turn it on to get useable output.

*-c* Merges the text, file, and link results into a single result... The first result of each selector will be combined into a single line, then the second results, and so on.  _Usually_ You will also end up using this flag once you know you are grabbing the right data.


# More Examples

## Fetch every image from [Lainchan - Technology](https://lainchan.org/%CE%A9/index.html)

We use the *-r* flag so we can pipe the results to awk so we can complete the urls.
_A future flag will allow for specifying a prefix string instead of using awk_
```
    node css_scrape.js -u "https://lainchan.org/%CE%A9/index.html" -l ".fileinfo > a" -r | awk -F"|" '{ print "https://lainchan.org"$2}'
```

##  title, link, score, comments, age, author, and subreddit from [Reddits Front Page](https://www.reddit.com/)

```
node css_scrape.js -u "https://www.reddit.com/" -t ".linklisting div .unvoted + .score" -t ".linklisting .title > a" -t ".entry .comments" -t ".entry .live-timestamp" -t ".entry .author" -t ".entry .subreddit" -c -r
```

## Reddit again but get the first 2 pages 
```
node css_scrape.js -u "https://www.reddit.com/" -t ".linklisting div .unvoted + .score" -l ".linklisting .title > a" -t ".entry .comments" -t ".entry .live-timestamp" -t ".entry .author" -t ".entry .subreddit" -n ".next-button > a" -c -r -p 2
```
We us the *-n* flag to specify the link that will take us to the next page and the *-p* flag to indicate we only want the first two pages.


# Known Issues
## Skewed Results From Missing Elements
When *-c*ombining the results of a scrape if the results don't contain the same number of elements you will get skewed results.
Sometimes articles on hacker news don't have a user.  When the *-t*ext selectors are combined into a single result array this there's no way to know WHICH article didn't have a user.
This means the results will be off by one!

Currently the only solution is to warn the user when combining result arrays that they don't line up exactly and that data is getting skewed.

Open an issue if you know of a way around this!




# License whatnot #
I'm really terrible with licenses.  If I'm doing something wrong try not to totally trip balls before / during/ after contacting me.