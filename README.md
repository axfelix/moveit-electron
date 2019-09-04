# MoveIt

## Development
```
$ pip install -r requirements.txt --user
$ cd gui
$ npm install
$ npm start
```

## Building
The Python code needs to be built on its target platform using `pyinstaller`:

`pyinstaller -w moveit.py --distpath gui`

After building the crawler, the GUI can be built from the `gui` subdirectory with:

`electron-packager . --icon=resources/icon.ico` (Windows)

`electron-packager . --icon=resources/icon.icns` (Mac)

Finally, to package for install:

`electron-installer-windows --src moveit-win32-x64/ --dest install/ --config config.json` (Windows)

`hdiutil create tmp.dmg -ov -volname "MoveIt" -fs HFS+ -srcfolder moveit-darwin-x64/ && hdiutil convert tmp.dmg -format UDZO -o MoveIt.dmg && rm tmp.dmg` (Mac)
