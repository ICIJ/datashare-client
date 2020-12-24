# Datashare doesn't open. What should I do?

It can be due to extensions priorly installed. The tech team is [fixing the issue](https://github.com/ICIJ/datashare/issues/715). In the meantime, you need to remove them. To do so, you can **open your Terminal, copy and paste the text below**:

* On Mac 

```text
rm -rf ~/Library/datashare/plugins ~/Library/datashare/extensions
```

* On Linux

```text
rm -rf ~/.local/share/datashare/plugins ~/.local/share/datashare/extensions
```

* On Windows

```text
del /S %APPDATA%\Datashare\Extensions  %APPDATA%\Datashare\Plugins
```

  
**Press Enter. Open Datashare again.**

