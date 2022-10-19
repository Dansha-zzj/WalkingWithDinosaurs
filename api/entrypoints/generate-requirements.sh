#!/bin/bash
set -e
cd /var/src/api/

echo "Use pip-tools to expand key requirements into an expended requirements file"
pip3 install pip-tools
pip-compile -U requirements.in --output-file requirements.tmp
cp requirements.tmp requirements.txt
rm requirements.tmp

echo "Use pip-sync command to bring installed packages into line with new requirements.txt file"
pip-sync requirements.txt
pip3 uninstall -y pip-tools

echo "Verify no further changes are made"
pip3 install -r requirements.txt