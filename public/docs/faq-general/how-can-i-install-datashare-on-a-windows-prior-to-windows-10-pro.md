# How can I install Datashare on a Windows prior to Windows 10 Pro?

1. On [datashare.icij.org](https://datashare.icij.org), click '**Download for free'.** Follow the steps [here](https://icij.gitbook.io/datashare/windows/install-datashare-on-windows) until step 4 included. Docker Toolbox is then going to be installed. To do so, click '**Next &gt;'**:

![](../.gitbook/assets/1%20%281%29.png)

 2. Click '**Next &gt;'** \(or, if you want to change the location, click 'Browse'\):

![](../.gitbook/assets/5.png)

3. Make sure the boxes below are selected and click '**Next &gt;'**:

![](../.gitbook/assets/6.png)

4. Make sure the boxes below are selected and click '**Next &gt;'**:

![](../.gitbook/assets/7.png)

5. Click '**Install'**:

![](../.gitbook/assets/8.png)

6. Wait for installing:

![](../.gitbook/assets/9.png)

7. Once installing is finished, click '**Finish'**:

![](../.gitbook/assets/10.png)

7. Installing Datashare is almost finished. Click '**Yes'** to reboot. Your computer is going to restart:

![](../.gitbook/assets/11.png)

8. Datashare for Windows and Docker Toolbox are installed, we now need to use the Linux launching script. To do so, go back to [datashare.icij.org](https://datashare.icij.org) and, under the blue button, click the text '**Other platforms and versions'**. 

![](../.gitbook/assets/17.png)

 9. Click '**Linux'** and the **last version available** \(here '1.36'\): 

![](../.gitbook/assets/18%20%281%29.png)

 10. Click '**Save'**:

![](../.gitbook/assets/19.png)

 11. Go to your desktop, you should see a '**Docker Quickstart'** icon. Double-click it:

![](../.gitbook/assets/12.png)

12. A terminal window opens:

![](../.gitbook/assets/15.png)

13. Then, you should see the command line windows below. 

![](../.gitbook/assets/16.png)

 14. Type '**cd'** and press '**Enter'**:

![](../.gitbook/assets/21.png)

 15. Type '**cd Downloads'** and press '**Enter'**. Then type '**ls'** and check that 'datashare.sh' appears \(there can be other text, just make sure 'datashare.sh' is here\):

![](../.gitbook/assets/22.png)

16. Type 'BIND\_HOST=0.0.0.0 ./datashare.sh' and press '**Enter'.**

17. To use Datashare, open your browser and go to URL '**192.168.99.100:8080'**:

![](../.gitbook/assets/screenshot-24.png)

Datashare is now running as a server. **Each time you want to use Datashare**, open URL '**192.168.99.100:8080'** in your browser. 

After having logged out or restarted your computer, **you will need to restart the server and go from step 11 to step 17 above**.



