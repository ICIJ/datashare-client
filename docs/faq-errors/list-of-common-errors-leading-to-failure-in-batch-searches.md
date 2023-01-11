# List of common errors leading to "failure" in Batch Searches

## SearchException: query='AND ada' 

**One or several of your queries contains syntax errors**. 

It means that you wrote one or more of your queries the wrong way with some characters that are reserved as operators: [**read the list of syntax errors by clicking here**](https://icij.gitbook.io/datashare/all/batch-search-documents#i-get-a-failure-what-does-that-mean). 

**You need to correct the error\(s\) in your CSV** and re-launch your new batch search with a CSV that does not contain errors. [Click here to learn how to launch a batch search](https://icij.gitbook.io/datashare/all/batch-search-documents).

Datashare **stops at the first syntax error**. It reports only the first ​error. You might need to **check all your queries** as some errors can remain after correcting the first one.

Example of a syntax error message:

_SearchException: query='AND ada' message='org.icij.datashare.batch.SearchException: org.elasticsearch.client.ResponseException: method \[POST\], host \[http://elasticsearch:9200\], URI \[/local-datashare/doc/\_search?typed\_keys=true&ignore\_unavailable=false&expand\_wildcards=open&allow\_no\_indices=true&scroll=60000ms&search\_type=query\_then\_fetch&batched\_reduce\_size=512\], status line \[HTTP/1.1 400 Bad Request\] {"error":{"root\_cause":\[{"type":"query\_shard\_exception","reason":"Failed to parse query \[AND ada\]","index\_uuid":"pDkhK33BQGOEL59-4cw0KA","index":"local-datashare"}\],"type":"search\_phase\_execution\_exception","reason":"all shards failed","phase":"query","grouped":true,"failed\_shards":\[{"shard":0,"index":"local-datashare","node":"\_jPzt7JtSm6IgUqrtxNsjw","reason":{"type":"query\_shard\_exception","reason":"Failed to parse query \[AND ada\]","index\_uuid":"pDkhK33BQGOEL59-4cw0KA","index":"local-datashare","caused\_by":{"type":"parse\_exception","reason":"Cannot parse 'AND ada': Encountered \" &lt;AND&gt; \"AND \"\" at line 1, column 0.\nWas expecting one of:\n &lt;NOT&gt; ...\n \"+\" ...\n \"-\" ...\n &lt;BAREOPER&gt; ...\n \"\(\" ...\n \"\*\" ...\n &lt;QUOTED&gt; ...\n &lt;TERM&gt; ...\n &lt;PREFIXTERM&gt; ...\n &lt;WILDTERM&gt; ...\n &lt;REGEXPTERM&gt; ...\n \"\[\" ...\n \"{\" ...\n &lt;NUMBER&gt; ...\n &lt;TERM&gt; ...\n ","caused\_by":{"type":"parse\_exception","reason":"Encountered \" &lt;AND&gt; \"AND \"\" at line 1, column 0.\nWas expecting one of:\n &lt;NOT&gt; ...\n \"+\" ...\n \"-\" ...\n &lt;BAREOPER&gt; ...\n \"\(\" ...\n \"\*\" ...\n &lt;QUOTED&gt; ...\n &lt;TERM&gt; ...\n &lt;PREFIXTERM&gt; ...\n &lt;WILDTERM&gt; ...\n &lt;REGEXPTERM&gt; ...\n \"\[\" ...\n \"{\" ...\n &lt;NUMBER&gt; ...\n &lt;TERM&gt; ...\n "}}}}\]},"status":400}'_

## elasticsearch: Name does not resolve

If you have a message which contain '_elasticsearch: Name does not resolve_', it means that Datashare can't make Elastic Search, its search engine, work. 

In that case, you need to **re-open Datashare**: ****here are the instructions for [Mac](https://icij.gitbook.io/datashare/mac/open-datashare-on-mac), [Windows](https://icij.gitbook.io/datashare/windows/open-datashare-on-windows) or [Linux](https://icij.gitbook.io/datashare/linux/open-datashare-on-linux). 

Example of a message regarding a problem with ElasticSearch:

_SearchException: query='lovelace' message='org.icij.datashare.batch.SearchException: java.io.IOException: elasticsearch: Name does not resolve'_

