# What are proximity searches?

### As a search operator

In the main search bar, you can write an exact query in double quotes with the search operator tilde \(~\) with a number, at the end of your query. It corresponds to the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **terms** needed to make one **phrase** match the other.

Examples:

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)

"_While a phrase query \(eg "john smith"\) expects all of the terms in exactly the same order, a proximity query allows the specified words to be further apart or in a different order. A proximity search allows us to specify a maximum edit distance of words in a phrase._" \(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

> Example: "fox quick"~5 \(this query will catch "quick brown fox", "quick brown car thin fox" or even "quick brown car thin blue tree fox"

The closer the text in a field is to the original order specified in the query string, the more relevant that document is considered to be. When compared to the above example query, the phrase `"quick fox"` would be considered more relevant than `"quick brown fox"`\(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

### In Batch Searches

When you turn on 'Do phrase matches', you can set, in 'Proximity searches', the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **terms** needed to make one **phrase** match the other.

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)

> Example: "fox quick"~5 \(this query will catch "quick brown fox", "quick brown car thin fox" or even "quick brown car thin blue tree fox"

