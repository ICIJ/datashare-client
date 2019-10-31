---
description: It allows to search multiple queries (list of words) at once.
---

# Batch search documents

## Prepare your batch search

* Write your queries, one per line and per cell, in the first column of a spreadsheet \(Excel, Google Sheets, Numbers, Framacalc, etc.\). In the example below, there are 4 queries:

![](../.gitbook/assets/screenshot-2019-09-25-at-16.06.40.png)

**Note:** [**Search operators**](https://icij.gitbook.io/datashare/all/search-with-operators) **do NOT work in batch searches**. Any space in your query is considered as a 'OR'. It means that if you write 'Hello world' in one cell, the search engine of batch searches will look for documents which contain either 'hello' or 'world' or the two words. If you write 'Hello AND world NOT car', it will look for documents which contain either 'hello' or 'and' or 'world' or 'not' or 'car'.

**Note:** Beware that, with some spreadsheet software, if you have **blank cells in your spreadsheet**, the CSV \(which stand for 'Comma-separated values'\) will keep these blank cells. It will separate them with commas. You will thus have commas in your batch search results \(see screenshot below\). To avoid that, you need to r**emove blank cells before exporting your queries as a CSV**.

![Remove blank cells in your spreadsheet in order to avoid this.](../.gitbook/assets/screenshot-2019-09-27-at-10.51.29.png)

**Note:** If there is a comma in one cell \(like in "1,8 million" in our example\), the CSV will formally put the content of the cell in double quotes. But Datashare will not treat it as double quotes though: it won't search for the exact phrase but for the regular query without double quotes.

* Export your spreadsheet in a CSV format:

![](../.gitbook/assets/screenshot-2019-09-25-at-16.10.06.png)

### 

## Launch your batch search

* Open Datashare and click '**Batch searches**' in the left menu:

![](../.gitbook/assets/batch-searches.png)

* Type a name for your batch search:

![](../.gitbook/assets/screenshot-2019-10-21-at-10.55.21.png)

* Upload your CSV:

![](../.gitbook/assets/screenshot-2019-10-21-at-10.56.51.png)

![](../.gitbook/assets/screenshot-2019-10-21-at-15.11.33.png)

* Add a description \(optional\):

![](../.gitbook/assets/screenshot-2019-10-21-at-10.56.51%20%281%29.png)

* Set the advanced filters \('Do phrase matches', 'Fuzziness' or 'Proximity searches', 'File types' and 'Path'\) according to your preferences:

![](../.gitbook/assets/screenshot-2019-10-21-at-10.59.08.png)

### What is fuzziness?

When you run a [batch search](https://icij.gitbook.io/datashare/all/batch-search-documents), you can set the fuzziness to 0, 1 or 2. It is the same as explained above, it will apply to each word in a query and corresponds to the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **characters** needed to make one **term** match the other.

> kitten -&gt; sitten \(1 substitution \(k turned into s\) = fuzziness is 1\)

> kitten -&gt; sittin \(2 substitutions \(k turned into s and e turned into i\) = fuzziness is 2\)

If you search for similar terms \(**to catch typos for example**\), use fuzziness. Use the [tilde symbol](https://en.wikipedia.org/wiki/Tilde) at the end of the word to set the fuzziness to 1 or 2. 

"_The default edit distance is 2, but an edit distance of 1 should be sufficient to catch 80% of all human misspellings. It can be specified as: quikc~1_" \(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

> Example: quikc~ brwn~ foks~ \(as the default edit distance is 2, this query will catch all quick, quack, quock, uqikc, etc. as well as brown, folks, etc.\)
>
> Example: Datashare~1 \(this query will catch Datasahre, Dqtashare, etc.\)

#### 

### What are proximity searches?

When you turn on 'Do phrase matches', you can set, in 'Proximity searches', the maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **terms** needed to make one **phrase** match the other.

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)

> Example: "fox quick"~5 \(this query will catch "quick brown fox", "quick brown car thin fox" or even "quick brown car thin blue tree fox"

* Click '**Add**'. Your batch search will appear in the table of batch searches.

![](../.gitbook/assets/screenshot-2019-10-21-at-10.57.56.png)

### 

## Get your results

* Open your batch search by clicking its name:

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.28.png)

* You see your results and you can sort them by clicking the column's name. 'Index' means the order by which each queries would be sorted out if run in Datashare's main search bar. They are thus sorted by relevance score.

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.36%20%281%29.png)

You can click on a document's name and it will open it in a new tab:

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.36.png)

* You can filter your results by query in the left panel and read how many documents there are for each query: 

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.46.png)

* You can also download your results in a CSV format:

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.46-copy.png)

## I get a "failure". What does that mean?

Failures in batch searches can be due to some syntax error\(s\) in the way you wrote your queries or one of your queries in the CSV. 

Here are **the most common errors:**

* **Some of your queries start with AND** \(all uppercase\)

You cannot start a query neither in Datashare's main search bar nor in your CSV with AND all uppercase. [AND is reserved as a search operator](https://icij.gitbook.io/datashare/all/search-with-operators#and).

![](../.gitbook/assets/screenshot-2019-10-31-at-14.53.32.png)

* **Some of your queries start with OR** \(all uppercase\)

You cannot start a query neither in Datashare's main search bar nor in your CSV with OR all uppercase. [OR is reserved as a search operator](https://icij.gitbook.io/datashare/all/search-with-operators#or-or-space).

![](../.gitbook/assets/screenshot-2019-10-31-at-14.58.08.png)

* **Some of your queries start with or contain tilde** \(~\)

You cannot start a query neither in Datashare's main search bar nor in your CSV with tilde \(~\) or which contains tilde. Tilde is reserved as a search operator for [fuzziness](https://icij.gitbook.io/datashare/faq/what-is-fuzziness) or [proximity searches](https://icij.gitbook.io/datashare/faq/what-is-proximity-search).

![](../.gitbook/assets/screenshot-2019-10-31-at-15.03.59.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-14.59.36.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.02.40.png)



* **Some of your queries start with or contain circumflex** \(^\)

You cannot start a query neither in Datashare's main search bar nor in your CSV with circumflex \(^\) or which contains circumflex. Circumflex is reserved as a boosting operator.

![](../.gitbook/assets/screenshot-2019-10-31-at-15.05.05.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.06.28.png)



## Delete your batch search

Open your batch search and click 'Delete batch search'. 

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.46-copy-2.png)

Then click 'Yes'.

![](../.gitbook/assets/screenshot-2019-09-27-at-12.18.07.png)



