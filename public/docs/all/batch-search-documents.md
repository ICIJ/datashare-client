---
description: It allows to search multiple queries (list of words) at once.
---

# Batch search documents

## Prepare your batch search

### **Write your queries in a spreadsheet**

* **Write your queries**, one per line and per cell, in the first column of a spreadsheet \(Excel, Google Sheets, Numbers, Framacalc, etc.\). In the example below, there are 4 queries:

![](../.gitbook/assets/screenshot-2019-09-25-at-16.06.40.png)

* [**Search operators**](https://icij.gitbook.io/datashare/all/search-with-operators) ****\(AND, NOT, OR, double quotes "..." or carets ^\) **WORK in batch searches:** 

  \*\*\*\*

  * **When 'do phrase matches' is turned on**:
    * If you write operators in one of your query , the search engine will not apply neither 'do phrase matches', 'fuzziness' nor 'proximity searches' in this query only. It will apply in other operator-free queries though.

![](../.gitbook/assets/screenshot-2019-11-04-at-16.15.24.png)

* **When 'do phrase matches' is turned off**:

  * By default, **any space in your query is considered as a 'OR'**. If you write 'Hello world' in one cell, the search engine will look for documents which contain either 'hello' or 'world' or the two words.
  * If you write 'Hello AND world NOT car' in one cell, the search engine will look for documents which contain 'hello' and 'world' but not 'car'.



* As in the main search bar, searches are not case sensitive: if you search 'HeLlo', it will look for all occurrences of 'Hello', 'hello', 'hEllo', 'heLLo', etc. in the documents.



* If you have **blank cells in your spreadsheet...**

![](../.gitbook/assets/screenshot-2019-11-04-at-16.12.23.png)

...the CSV \(which stand for 'Comma-separated values'\) will keep these blank cells. It will separate them with semicolons. You will thus have semicolons in your batch search results \(_see screenshot below_\). To avoid that, **you need to remove blank cells in your spreadsheet before exporting it as a CSV**.

![Remove blank cells in your spreadsheet in order to avoid this.](../.gitbook/assets/screenshot-2019-09-27-at-10.51.29.png)

* **If there is a comma in one of your cells** \(like in "1,8 million" in our example above\), the CSV will formally put the content of the cell in double quotes in your results and search for the exact phrase in double quotes. 

![](../.gitbook/assets/screenshot-2019-11-04-at-16.20.29.png)

### Export your spreadsheet as a CSV

Export your spreadsheet in a CSV format:

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

When you run a [batch search](https://icij.gitbook.io/datashare/all/batch-search-documents), you can set the fuzziness to 0, 1 or 2. It will apply to each term in a query. It corresponds to **the maximum number of operations \(insertions, deletions, substitutions and transpositions\)** on _**characters**_ needed to make one _**term**_ match the other.

> kitten -&gt; sitten \(1 substitution \(k turned into s\) = fuzziness is 1\)

> kitten -&gt; sittin \(2 substitutions \(k turned into s and e turned into i\) = fuzziness is 2\)

If you search for similar terms \(**to catch typos for example**\), use fuzziness. 

"_The default edit distance is 2, but an edit distance of 1 should be sufficient to catch 80% of all human misspellings. It can be specified as: quikc~1_" \(source: [Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/query-dsl-query-string-query.html#_fuzziness)\).

> Example: quikc~ brwn~ foks~ \(as the default edit distance is 2, this query will catch all quick, quack, quock, uqikc, etc. as well as brown, folks, etc.\)
>
> Example: Datashare~1 \(this query will catch Datasahre, Dqtashare, etc.\)

#### 

### What are proximity searches?

When you turn on 'Do phrase matches', you can set, in 'Proximity searches', the **maximum number of operations \(insertions, deletions, substitutions and transpositions\)** on _**terms**_ needed to make one _**phrase**_ match the other.

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)

> Example: "fox quick"~5 \(this query will catch "quick brown fox", "quick brown car thin fox" or even "quick brown car thin blue tree fox"



* Click '**Add**'. Your batch search will appear in the table of batch searches.

![](../.gitbook/assets/screenshot-2019-10-21-at-10.57.56.png)

### 

## Get your results

* Open your batch search by clicking its name:

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.28.png)

* You see your results and you can sort them by clicking the column's name. 'Rank' means the order by which each queries would be sorted out if run in Datashare's main search bar. They are thus sorted by relevance score.

![](../.gitbook/assets/screenshot-2019-11-04-at-16.37.03.png)

You can click on a document's name and it will open it in a new tab:

![](../.gitbook/assets/screenshot-2019-11-04-at-16.37.42.png)

* You can filter your results by query in the left panel and read how many documents there are for each query: 

![](../.gitbook/assets/screenshot-2019-11-04-at-16.38.43.png)

* You can also download your results in a CSV format:

![](../.gitbook/assets/screenshot-2019-11-04-at-16.39.25.png)

## I get a "failure". What does that mean?

Failures in batch searches can be due to some syntax error\(s\) in the way you wrote your queries or one of your queries in the CSV. You should correct the error\(s\) in your CSV, re-export your CSV and [launch your batch search](https://icij.gitbook.io/datashare/all/batch-search-documents#launch-your-batch-search) again.

They are more likely to happen **when 'do phrase matches' toggle button is turned off:**

![](../.gitbook/assets/screenshot-2019-10-31-at-15.21.30.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.20.07.png)

When 'Do phrase matches' is on, syntax error can still happen though:

![](../.gitbook/assets/screenshot-2019-10-31-at-15.47.55.png)

Here are **the most common errors:**

### **Querie\(s\) start\(s\) with AND** \(all uppercase\)

You cannot start a query with AND all uppercase, neither in Datashare's main search bar nor in your CSV. [AND is reserved as a search operator](https://icij.gitbook.io/datashare/all/search-with-operators#and).

![](../.gitbook/assets/screenshot-2019-10-31-at-14.53.32.png)

### **Querie\(s\) start\(s\) with OR** \(all uppercase\)

You cannot start a query with OR all uppercase, neither in Datashare's main search bar nor in your CSV. [OR is reserved as a search operator](https://icij.gitbook.io/datashare/all/search-with-operators#or-or-space).

![](../.gitbook/assets/screenshot-2019-10-31-at-14.58.08.png)

### **Querie\(s\) contain\(s\) only one double quote or a double quote in a word**

You cannot type a query with only one double quote, neither in Datashare's main search bar nor in your CSV. [Double quotes are reserved as a search operator](https://icij.gitbook.io/datashare/all/search-with-operators#exact-phrase).

![](../.gitbook/assets/screenshot-2019-10-31-at-15.23.41.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.23.51.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.23.01.png)

### **Querie\(s\) start\(s\) with or contain tilde** \(~\) inside a term

You cannot start a query with tilde \(~\) or make one contain a tilde, neither in Datashare's main search bar nor in your CSV. Tilde is reserved as a search operator for [fuzziness](https://icij.gitbook.io/datashare/faq/what-is-fuzziness) or [proximity searches](https://icij.gitbook.io/datashare/faq/what-is-proximity-search).

![](../.gitbook/assets/screenshot-2019-10-31-at-15.03.59.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-14.59.36.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.02.40.png)



### **Querie\(s\) start\(s\) with or contain caret** \(^\)

You cannot start a query with caret \(^\) or make it contain a caret, neither in Datashare's main search bar nor in your CSV. [Caret is reserved as a boosting operator](https://icij.gitbook.io/datashare/all/search-with-operators#boosting-operators).

![](../.gitbook/assets/screenshot-2019-10-31-at-15.05.05.png)

![](../.gitbook/assets/screenshot-2019-10-31-at-15.06.28.png)



## Delete your batch search

Open your batch search and click 'Delete batch search'. 

![](../.gitbook/assets/screenshot-2019-09-27-at-12.17.46-copy-2.png)

Then click 'Yes'.

![](../.gitbook/assets/screenshot-2019-09-27-at-12.18.07.png)



