#!/bin/bash
if [[ $# -ne 3 ]]
then
  echo "usage: run.sh path/to/python/folder entry/point/filename version"
  exit 1
fi

set -x

WORKDIR="/tmp/appimage"
rm -rf $WORKDIR/squashfs-root
mkdir -p $WORKDIR
url="https://github.com/niess/python-appimage/releases/download/python3.8/python3.8.6-cp38-cp38-manylinux2014_$(uname -m).AppImage"
echo $url
curl -L -C - $url --output $WORKDIR/python3.8.AppImage
chmod +x $WORKDIR/python3.8.AppImage
pushd $WORKDIR
$WORKDIR/python3.8.AppImage --appimage-extract
popd
temp=$(basename ${1%"/"})
PYTHON_FILES_DIR=$WORKDIR/squashfs-root/opt/${temp#"/"}
mkdir -p $PYTHON_FILES_DIR
rsync -av --info=progress2 --exclude env --exclude dist --exclude build --exclude __pycache__ ${1%"/"}/ $PYTHON_FILES_DIR
APPRUN=$WORKDIR/squashfs-root/AppRun
$APPRUN -m pip install -r $PYTHON_FILES_DIR/requirements.txt
rm -rf $WORKDIR/squashfs-root/opt/python3.8/lib/python3.8/site-packages/pip*
rm -rf $WORKDIR/squashfs-root/opt/python3.8/lib/python3.8/site-packages/setuptools*
rm -rf $WORKDIR/squashfs-root/opt/python3.8/lib/python3.8/site-packages/wheel*
rm -rf $WORKDIR/squashfs-root/opt/python3.8/lib/python3.8/ensurepip
rm -rf $WORKDIR/squashfs-root/opt/python3.8/lib/python3.8/distutils
PYTHON_FILES_DIR="\$APPDIR/opt/${temp#"/"}"
ORIGSTR="/opt/python3.8/bin/python3.8\""
ORIGSTR=$(echo $ORIGSTR | sed 's/\//\\\//g')
REPLACESTR="/opt/python3.8/bin/python3.8\" \"$PYTHON_FILES_DIR/$2\""
REPLACESTR=$(echo $REPLACESTR | sed 's/\//\\\//g')
cp $APPRUN $APPRUN.orig
sed -r "s/($ORIGSTR)/$REPLACESTR/g" $APPRUN.orig | sed -r "s/^(executable=\"[\${}a-zA-Z0-9./\\]*\").*/\1/g" > $APPRUN
rm $WORKDIR/squashfs-root/usr/share/applications/* -f
rm $WORKDIR/squashfs-root/*.desktop -f
cat > $WORKDIR/squashfs-root/appimagebuilder.desktop <<EOL
[Desktop Entry]
Type=Application
Name=${temp#"/"}
Exec=$2
Comment=AppImage Built from AppImageBuilder
Icon=python
Categories=Development;
Terminal=true
X-AppImage-Version=1.0.0
EOL
pushd $WORKDIR
wget -c https://github.com/$(wget -q https://github.com/probonopd/go-appimage/releases -O - | grep "appimagetool-.*-$(uname -m).AppImage" | head -n 1 | cut -d '"' -f 2)
chmod +x appimagetool-*.AppImage
popd
# curl -L -C - "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-$(uname -m).AppImage" --output $WORKDIR/appimagetool.AppImage
# chmod +x $WORKDIR/appimagetool.AppImage
VERSION=$3 ARCH=$(uname -m) $WORKDIR/appimagetool-*-$(uname -m).AppImage $WORKDIR/squashfs-root