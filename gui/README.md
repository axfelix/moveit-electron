# MoveIt

![MoveIt](moveit.png)

This is MoveIt, a tool for building bag packages from files and folders on your desktop for transfer to repositories! The metadata fields entered into this app will be written into the bag's `bag-info.txt`. Right now, the compiled versions listed under the releases tab are customized for Simon Fraser University (as is one documentation link built into the app), but it's very easy to customize for your local context if you want.

User properties (those before the "jump" halfway down the app window) are automatically saved between runs and repopulated; bag-specific properties are not. Uses the Library of Congress' Python bagit library.

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

(On Mac, this also builds a .app version of the Python code, which you'll actually want to delete -- just keep the folder of CLI tools.)

After building the crawler, the GUI can be built from the `gui` subdirectory with:

`electron-packager . --icon=resources/icon.ico` (Windows)

`electron-packager . --icon=resources/icon.icns` (Mac)

On Mac, you can sign for distribution with `electron-osx-sign` and `electron-notarize-cli`, and you need to include the embedded Python binaries:

`IFS=$'\n' && electron-osx-sign sfu-moveit-darwin-x64/sfu-moveit.app/ $(find sfu-moveit-darwin-x64/sfu-moveit.app/Contents/Resources/app/ -type f -perm -u+x) --identity [hash] --entitlements=entitlements.plist --entitlements-inherit=entitlements.plist --hardenedRuntime`

`electron-notarize --bundle-id ca.sfu.moveit --username my.apple.id@example.com --password @keystore:AC_PASSWORD sfu-moveit-darwin-x64/sfu-moveit.app/`

Finally, to package for install:

`electron-installer-windows --src moveit-win32-x64/ --dest install/ --config config.json` (Windows)

`hdiutil create tmp.dmg -ov -volname "MoveIt" -fs HFS+ -srcfolder moveit-darwin-x64/ && hdiutil convert tmp.dmg -format UDZO -o sfu-moveit.dmg && rm tmp.dmg` (Mac)
