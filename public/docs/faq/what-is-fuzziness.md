# What is fuzziness?

When you run a [batch search](https://icij.gitbook.io/datashare/all/batch-search-documents), you can set the fuzziness to 0 or another number.

* If you did NOT tick 'Do phrase matches', then fuzziness means:

The maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **characters** needed to make one **term** match the other.

Examples:

> kitten -&gt; sitten \(1 substitution = fuzziness is 1\)

> kitten -&gt; sitting \(1 insertion + 2 substitutions = fuzziness is 3\)

* If you did tick 'Do phrase matches', then fuzziness means:

The maximum number of operations \(insertions, deletions, substitutions and transpositions\) on **terms** needed to make one **phrase** match the other.

Examples:

> “the cat is blue” -&gt; “the small cat is blue” \(1 insertion = fuzziness is 1\)

> “the cat is blue” -&gt; “the small is cat blue” \(1 insertion + 2 transpositions = fuzziness is 3\)



