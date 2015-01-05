#!/bin/sh

DIR=$( cd "$( dirname "$BASH_SOURCE[0]}" )" && pwd )

case `uname` in
  Darwin)
    CMD="open -n -a FirefoxNightly --args "
    ;;
  Linux)
    CMD="firefox"
    ;;
  *)
    echo "Not sure how to run Firefox Nightly in this platform."
    echo "Run Firefox Nightly with these arguments:"
    echo "firefox -app $DIR/runtime/application.ini $DIR/apps/browser/manifest.webapp"
    exit 1
    ;;
esac

$CMD -app $DIR/runtime/application.ini $DIR/apps/browser/manifest.webapp
