#!/bin/bash

value=`cat /Users/tommut/dev/ff-addons/pid.txt`
echo "$value"

kill -9 $value

/Applications/Firefox.app/Contents/MacOS/firefox-bin -p reminderfox-dev & echo $! > /Users/tommut/dev/ff-addons/pid.txt
