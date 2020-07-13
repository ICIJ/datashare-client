---
description: Install Datashare will help you set up the software on your computer.
---

# Install Datashare on Linux

There are two ways of installing datashare on linux :

1. install it standalone
2. install it with docker

### Standalone

download the deb package from [https://github.com/ICIJ/datashare-installer/releases/latest](https://github.com/ICIJ/datashare-installer/releases/latest)

Then you can install it from the command line : 

```text
$ sudo apt install /dir/to/debian/package/datashare-dist_7.2.0_all.deb
```

Then simply run datashare with 

```text
$ datashare -h
```

If you want to run it standalone with another linux distribution you can download latest version of the datashare jar here : [https://github.com/ICIJ/datashare/releases/latest](https://github.com/ICIJ/datashare/releases/latest)

And adapt the following launch script : [https://github.com/ICIJ/datashare/blob/master/datashare-dist/src/main/deb/bin/datashare](https://github.com/ICIJ/datashare/blob/master/datashare-dist/src/main/deb/bin/datashare) for your environment.

### Docker 

1. Install **Docker for Linux**:   
[ - **https://docs.docker.com/install/linux/docker-ce/centos/**](https://docs.docker.com/install/linux/docker-ce/centos/)\*\*\*\*

 **-** [**https://docs.docker.com/install/linux/docker-ce/debian/**](https://docs.docker.com/install/linux/docker-ce/debian/)\*\*\*\*

 **-** [**https://docs.docker.com/install/linux/docker-ce/fedora/**](https://docs.docker.com/install/linux/docker-ce/fedora/)\*\*\*\*

 **-** [**https://docs.docker.com/install/linux/docker-ce/ubuntu/**](https://docs.docker.com/install/linux/docker-ce/ubuntu/)\*\*\*\*

2. Don't forget \(if not done during the install process\) to **add your user to the docker group**:

```text
sudo usermod -aG docker your-user
```

if you do so, you'll have to close your session and open a new one \(**logout and login again**\). After having logged in again, you can check that it is effective with :

```text
docker ps
CONTAINER ID    IMAGE     COMMAND      CREATED     STATUS      PORTS          NAMES
```

3. Install **Docker Compose**: [**https://docs.docker.com/compose/install/**](https://docs.docker.com/compose/install/)\*\*\*\*

4. Go to the **Datashare's website:** [**https://datashare.icij.org/**](https://datashare.icij.org/).

5. Click the blue button '**DOWNLOAD FOR FREE'.**

![](../.gitbook/assets/group-42123131.png)

6. On the next window, select '**Save File'** and click '**OK'**.

![](../.gitbook/assets/linux.png)

7. In your Terminal, you can **start installing Datashare**:

![](../.gitbook/assets/screen-shot-2019-01-22-at-11.14.38-am.png)

8. Once installation is done, **open your browser and use Datashare at** [http://localhost:8080/\#/](http://localhost:8080/#/):

![](../.gitbook/assets/linux3.png)

9. It will :

* download [redis](https://redis.io), [elasticsearch](https://www.elastic.co/) and Datashare [docker](https://www.docker.com/docker-community) containers
* initialize an Elasticsearch index with Datashare mapping
* provide CLI to run Datashare extract, index, name finding tasks
* provide a WEB GUI to run Datashare extract, index, name finding tasks, and search in the documents

Let's [open Datashare now](https://icij.gitbook.io/datashare/linux/open-datashare-on-linux).

