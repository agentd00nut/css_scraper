# Css_scraper
Simplify web scraping through css selectors.

Easily scrape links, text, and files from a single page by specifying multiple selectors for each data type.

Combine the output to easily read the results.

Dump the output raw for easy processing with other tools or to disk.

_Scrape multiple pages by specifying a next link selector or by specifying how a url paginates_

_Control on what page to start or stop scraping._

_Specify page timeouts._

_Use sleep intervals to wait before getting the next page so you don't bother web admins._

_Specify custom delimiters for output_

_Specify pre or post text to add to links or file src's_

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
  -t, --text=text_selectors+  Raw Text Selectors.
  -f, --file=file_selectors+  SRC selectors.
  -l, --link=link_selectors+  Link Selectors, Auto grabs anchor text.
  -u, --url=url               Url to scrape from
  -r, --raw                   Output raw data, suitable for piping to other commands or a file.
  -c, --combine               Merge output into lines instead of displaying a dictionary.
  -h, --help                  display this help
```

*-t, -f, -l* Are used to specify the css selectors you want to use to scrape the web page with.  You can specify an unlimited number of selectors for each type by passing the flag more than once.
Selectors of the same type will get combined.  In the example above we combine the *Text* selectors of '.age a' and '.hnuser'.  The output will be a 1:1 of "<.age a>,<.hnuser>".

*-t* Grabs all the text matched by the selector.

*-f* Will pull the "src=" value from anything matched by the selectors.

*-l* Will pull the "href=" value from anything matched by the selectors, but also the anchor text.
Since the anchor text is grabbed it's not necessary to use a *-t* selector to get the text for links.

*-u* The url to scrape from, multiple urls are not yet supported.

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

# Known Issues
## Skewed Results From Missing Elements
When *-c*ombining the results of a scrape if the results don't contain the same number of elements you will get skewed results.
Sometimes articles on hacker news don't have a user.  When the *-t*ext selectors are combined into a single result array this there's no way to know WHICH article didn't have a user.
This means the results will be off by one!

Currently the only solution is to warn the user when combining result arrays that they don't line up exactly and that data is getting skewed.

Open an issue if you know of a way around this!




# License whatnot #
I'm really terrible with licenses.  If I'm doing something wrong try not to totally trip balls before / during/ after contacting me.