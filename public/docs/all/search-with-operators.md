---
description: >-
  To make your searches more precise, you can use operators in the main search
  bar.
---

# Search with operators and Regex

### Double quotes for e**xact phrase**

To have all documents mentioning an exact phrase, you can use double quotes.

> Example: “Alicia Martinez’s bank account in Portugal”



### **OR \(or space\)**

To have all documents mentioning all or one of the queried terms, you can use a simple space between your queries or 'OR'. You need to write 'OR' with **all letters uppercase**.

> Example: Alicia Martinez
>
> Same search: Alicia OR Martinez



### **AND \(or +\)**

To have all documents mentioning all the queried terms, you can use 'AND' between your queried words. You need to write 'AND' with **all letters uppercase**.

> Example: Alicia AND Martinez



### **NOT \(or ! or -\)**

To have all documents NOT mentioning some queried terms, you can use 'NOT' before each word you don't want. You need to write 'NOT' with **all letters uppercase**.

> Example: NOT Martinez
>
> Same search: !Martinez



### **Please note that you can combine operators**

Parentheses should be used whenever multiple operators are used together and you want to give priority to some. 

> Example: \(\(Alicia AND Martinez\) OR \(Delaware AND Pekin\) OR Grey\) AND NOT "parking lot""

You can also combine these with 'regular expressions' Regex between two slashes \([see below](https://icij.gitbook.io/datashare/all/search-with-operators#regular-expressions-regex)\).



### **Wildcards**

If you search faithf?l, the search engine will look for all words with all possible single character between the second f and the l in this word. It also works with \* to replace multiple characters.

> Example: Alicia Martin?z
>
> Example: Alicia Mar\*z



### **Fuzziness**

You can set fuzziness to 1 or 2. It corresponds to the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **characters** needed to make one **term** match the other.

> kitten -&gt; sitten \(1 substitution \(k turned into s\) = fuzziness is 1\)

> kitten -&gt; sittin \(2 substitutions \(k turned into s and e turned into i\) = fuzziness is 2\)

If you search for similar terms \(**to catch typos for example**\), you can use fuzziness. Use the [tilde symbol](https://en.wikipedia.org/wiki/Tilde) at the end of the word to set the fuzziness to 1 or 2. 

"_The default edit distance is 2, but an edit distance of 1 should be sufficient to catch 80% of all human misspellings. It can be specified as: quikc~1_" \(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

> Example: quikc~ brwn~ foks~ \(as the default edit distance is 2, this query will catch all quick, quack, quock, uqikc, etc. as well as brown, folks, etc.\)
>
> Example: Datashare~1 \(this query will catch Datasahre, Dqtashare, etc.\)



### **Proximity searches**

When you type an exact phrase \(in double quotes\) and use fuzziness, then the meaning of the fuzziness changes. Now, the fuzziness means the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **terms** needed to make one **phrase** match the other.

Examples:

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)

"_While a phrase query \(eg "john smith"\) expects all of the terms in exactly the same order, a proximity query allows the specified words to be further apart or in a different order. A proximity search allows us to specify a maximum edit distance of words in a phrase._" \(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

> Example: "fox quick"~5 \(this query will catch "quick brown fox", "quick brown car thin fox" or even "quick brown car thin blue tree fox"

The closer the text in a field is to the original order specified in the query string, the more relevant that document is considered to be. When compared to the above example query, the phrase `"quick fox"` would be considered more relevant than `"quick brown fox"`\(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

### \*\*\*\*

### **Boosting operators**

Use the _boost_ operator `^` to make one term more relevant than another. For instance, if we want to find all documents about foxes, but we are especially interested in quick foxes:

> Example: quick^2 fox

The default boost value is 1, but can be any positive floating point number. Boosts between 0 and 1 reduce relevance. Boosts can also be applied to phrases or to groups:

> Example: "john smith"^2   \(foo bar\)^4

\(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\)

### \*\*\*\*

### **Searches using metadata fields**

If you are looking for documents that:

*  contains term1, term2 and term3
*  and were created after 2010

you can use the 'Date' filter or type in the search bar:

> term1 AND term2 AND term3 AND metadata.tika\_metadata\_creation\_date:&gt;=2010-01-01

_Explanations:_

* _'metadata.tika\_metadata\_creation\_date:' means that we filter with creation date_
* _'&gt;="'means 'since January 1st included'_
* _'2010-01-01' stands for January 2010 and the search will include January 2010_

For other searches:

* '&lt;' will mean 'strictly after \(with January 1st excluded\)'
* nothing will mean 'at this exact date'

You can use **other metadata fields using the following model: metadata.tika\_metadata\_**_**\[and copying the field's name here\]**_**.** 

To find the list of existing metadata fields, **go to a document's 'Tags and details' tab, click 'Show more details' and refer to this list:**

![](../.gitbook/assets/screenshot-2019-07-05-at-14.52.36.png)

### 

### Regular expressions \(Regex\)

Regular expressions \(Regex\) in Datashare need to be written **between 2 slashes**. 

> Example: paris /\[0-9\]{10}/

  
Regex can thus be combined with standard queries in Datashare.

> Example of a query combining standard writing and Regex: \("Ada Lovelace" OR "Ado Lavelace"\) AND paris /\[0-9\]{10}/

Datashare uses Elastic's Regex syntax as explained [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/regexp-syntax.html). 

Here are Elastic's explanations: 

`.`

Matches any character. For example:

```text
ab.     # matches 'aba', 'abb', 'abz', etc.
```

`?`

Repeat the preceding character zero or one times. Often used to make the preceding character optional. For example:

```text
abc?     # matches 'ab' and 'abc'
```

`+`

Repeat the preceding character one or more times. For example:

```text
ab+     # matches 'abb', 'abbb', 'abbbb', etc.
```

`*`

Repeat the preceding character zero or more times. For example:

```text
ab*     # matches 'ab', 'abb', 'abbb', 'abbbb', etc.
```

`{}`

Minimum and maximum number of times the preceding character can repeat. For example:

```text
a{2}    # matches 'aa'
a{2,4}  # matches 'aa', 'aaa', and 'aaaa'
a{2,}   # matches 'a` repeated two or more times
```

`|`

OR operator. The match will succeed if the longest pattern on either the left side OR the right side matches. For example:

```text
abc|xyz  # matches 'abc' and 'xyz'
```

`( … )`

Forms a group. You can use a group to treat part of the expression as a single character. For example:

```text
abc(def)?  # matches 'abc' and 'abcdef' but not 'abcd'
```

`[ … ]`

Match one of the characters in the brackets. For example:

```text
[abc]   # matches 'a', 'b', 'c'
```

Inside the brackets, `-` indicates a range unless `-` is the first character or escaped. For example:

```text
[a-c]   # matches 'a', 'b', or 'c'
[-abc]  # '-' is first character. Matches '-', 'a', 'b', or 'c'
[abc\-] # Escapes '-'. Matches 'a', 'b', 'c', or '-'
```

A `^` before a character in the brackets negates the character or range. For example:

```text
[^abc]      # matches any character except 'a', 'b', or 'c'
[^a-c]      # matches any character except 'a', 'b', or 'c'
[^-abc]     # matches any character except '-', 'a', 'b', or 'c'
[^abc\-]    # matches any character except 'a', 'b', 'c', or '-'
```

#### Optional operators

You can use the `flags` parameter to enable more optional operators for Lucene’s regular expression engine.

To enable multiple operators, use a `|` separator. For example, a `flags` value of `COMPLEMENT|INTERVAL` enables the `COMPLEMENT` and `INTERVAL` operators.

**Valid values**

`ALL` \(Default\)Enables all optional operators.`COMPLEMENT`

Enables the `~` operator. You can use `~` to negate the shortest following pattern. For example:

```text
a~bc   # matches 'adc' and 'aec' but not 'abc'
```

`INTERVAL`

Enables the `<>` operators. You can use `<>` to match a numeric range. For example:

```text
foo<1-100>      # matches 'foo1', 'foo2' ... 'foo99', 'foo100'
foo<01-100>     # matches 'foo01', 'foo02' ... 'foo99', 'foo100'
```

`INTERSECTION`

Enables the `&` operator, which acts as an AND operator. The match will succeed if patterns on both the left side AND the right side matches. For example:

```text
aaa.+&.+bbb  # matches 'aaabbb'
```

`ANYSTRING`

Enables the `@` operator. You can use `@` to match any entire string.

You can combine the `@` operator with `&` and `~` operators to create an "everything except" logic. For example:

```text
@&~(abc.+)  # matches everything except terms beginning with 'abc'
```

#### Unsupported operators

Lucene’s regular expression engine does not support anchor operators, such as `^` \(beginning of line\) or `$` \(end of line\). To match a term, the regular expression must match the entire string."



