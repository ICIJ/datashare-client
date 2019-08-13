---
description: >-
  It will help you index and have your documents in Datashare. This step is
  required in order to explore your documents.
---

# Analyze documents

1. To index and have your documents in Datashare, click '**Analyze documents'**.

![](../.gitbook/assets/analyze%20%281%29.png)

2. You're now on '[http://localhost:8080/\#/indexing](http://localhost:8080/#/indexing)'. Click '**Extract text'** so that Datashare can extract the texts from your files.

![](../.gitbook/assets/extract.png)

If you want to extract text also from images and PDFs, click '**Yes'** but be aware that it can take up to 10 times longer. You will always be able to do it later.

![](../.gitbook/assets/1111.png)

3. Two extraction tasks are now running: the first is the scanning of your Datashare folder which sees if there are new documents to analyze. The second is the indexing of these files.

![](../.gitbook/assets/tasks.png)

It is **not yet** possible to 'Find people, organizations and locations' as long as one of these two tasks is still running. 

4. When tasks are done, you can start exploring documents by clicking '**Search'** but you won't have the named entities yet. 

5. As the text is extracted, you can now launch named entities extraction by clicking '**Find people, organizations and locations'**.

![](../.gitbook/assets/find-people-org-and-loc.png)

6. In the window below, you will be asked to choose among different pipelines of 'Natural Language Processing'. **These are tools that automatically identify named entities \(names of people, locations and organizations, in our case\) in your documents.** You can only choose one at a time. 

Select '**CoreNLP'**, if you want to use the one with the highest probability of working in most of your documents:

![](../.gitbook/assets/2222.png)

6. You can now see running tasks and their progress. After they are done, you can click '**Clear done tasks'** to stop displaying tasks that are completed.

![](../.gitbook/assets/nlp2.png)

  
Hooray! You can search your indexed documents without having to wait for all tasks to be done. To access your documents, click '**Search'**.  on the top bar.  


Now let's [search your documents](https://icij.gitbook.io/datashare/all/explore-documents)!

