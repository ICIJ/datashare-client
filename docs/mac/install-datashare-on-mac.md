---
description: It will help you set up and install Datashare on your computer.
---

# Install Datashare on Mac

You have **2 options:**

* the simplest, if you have **any Mac**, is to use the **standard** option which installs Datashare without Docker. [Make sure you install Homebrew before by following these steps.](https://icij.gitbook.io/datashare/mac/install-datashare-on-mac#standard-high-sierra-and-more-recent-versions)
* if you have **OS X El Capitan 10.11** or a more recent version: you can use the version which installs Datashare with Docker; it is a more powerful version.



### Standard \(High Sierra and more recent versions\)

1. Let's first install **Homebrew**, which is needed for installing Tesseract OCR. You can find Homebrew's instructions [here](https://brew.sh/) or follow the next steps. Open your **Finder**:

![](../.gitbook/assets/screenshot-2020-04-03-at-16.55.39.png)

2. Search for '**Terminal**' in your applications and double click on '**Terminal.app**' to open it:

![](../.gitbook/assets/screenshot-2020-04-03-at-16.54.02.png)

3. A Terminal window opens:

![](../.gitbook/assets/screenshot-2020-04-03-at-16.56.50.png)

**Copy and paste** this and press **Enter**:

```text
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

4. Press '**Enter**' when it displays this message:

![](../.gitbook/assets/screenshot-2020-04-03-at-17.09.56.png)

5. **Close the windows** when it displays this:

![](../.gitbook/assets/screenshot-2020-04-03-at-17.10.26.png)

6. **Go to this page**: [datashare.icij.org](https://datashare.icij.org), scroll down and click '**Download for free**'.

![](../.gitbook/assets/capture-de-cran-2020-09-24-a-09.59.47.png)

7. Go to your '**Downloads**' and double-click '**DatashareStandalone.pkg**':

![](../.gitbook/assets/screenshot-2020-04-03-at-17.34.40.png)

8. You might see this window which says '"DatashareStandalone.pkg” can’t be opened because it was not downloaded from the App Store.' Click '**OK**'.

![](../.gitbook/assets/7%20%281%29.png)

9. Go to your Mac's **System Preferences**:

![](../.gitbook/assets/8%20%281%29.png)

10. Open '**Security & Privacy**':

![](../.gitbook/assets/screenshot-2020-01-09-at-14.42.10.png)

11. Click '**Open Anyway**':

![](../.gitbook/assets/screenshot-2020-01-09-at-14.42.22.png)

12. Click '**Open**':

![](../.gitbook/assets/screenshot-2020-01-09-at-14.42.29%20%281%29.png)



13. Click '**Continue**', '**Install**', enter your password and '**Close**':

![](../.gitbook/assets/screenshot-2020-04-03-at-17.41.03.png)

![](../.gitbook/assets/screenshot-2020-04-03-at-17.41.10.png)

![](../.gitbook/assets/screenshot-2020-04-03-at-17.41.16.png)

![](../.gitbook/assets/screenshot-2020-04-03-at-17.41.23.png)

The installation begins. You see a progress bar. It stays a long time on "Running package scripts" because it is installing Tesseract OCR, Java Runtime Environment, Datashare backend and Datashare frontend.

You can see what it actually does by typing command+L, it will open a window which logs every action made.

In the end, you should see this screen:

![](../.gitbook/assets/screenshot-2020-04-03-at-17.42.02.png)

You can now [open Datashare](https://icij.gitbook.io/datashare/mac/open-datashare-on-mac).



### Version with Docker installer \(OS X El Capitan 10.11\)

You need **OS X El Capitan 10.11 or a more recent version.**

1. Go to Datashare's website: [**https://datashare.icij.org/**](https://datashare.icij.org/)\*\*\*\*

2. Click '**Other platforms and versions'**:

![](../.gitbook/assets/capture-de-cran-2020-09-24-a-10.07.38.png)

3. **Turn on** the toggle button '**Use Docker installer**':

![](../.gitbook/assets/capture-de-cran-2020-09-24-a-10.08.06.png)

4. Click on the **latest version on top**:

![](../.gitbook/assets/capture-de-cran-2020-09-24-a-10.11.19.png)

5. **Follow the steps** starting at point 7 [here](https://icij.gitbook.io/datashare/mac/install-datashare-on-mac#standard-high-sierra-and-more-recent-versions).

