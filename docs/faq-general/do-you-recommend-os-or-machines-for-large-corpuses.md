# Do you recommend OS or machines for large corpuses?

Datashare was created with scalability in mind which gave ICIJ the ability to index terabytes of documents.  
  
To do so, we used a cluster of dozens of EC2 instances on AWS, running on Ubuntu 16.04 and 18.04. We used c4.8xlarge instances \(36 CPUs / 60 GB RAM\).  
  
The most complex operation is OCR \(we use [Apache Tesseract](https://github.com/tesseract-ocr/tesseract/wiki)\) so if your documents don't contain many images, it might be worth deactivating it \("--ocr false"\).

