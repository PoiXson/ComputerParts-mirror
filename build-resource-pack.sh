#!/usr/bin/bash


if [[ -f ComputerParts-resourcepack.zip ]]; then
	\rm -fv  ComputerParts-resourcepack.zip  || exit 1
fi


\pushd  "resourcepack/"  >/dev/null  || exit 1
	\zip -r -9  ../ComputerParts-resourcepack.zip *  || exit 1
\popd >/dev/null


\sha1sum ComputerParts-resourcepack.zip > ComputerParts-resourcepack.sha1  ||


\cp  ComputerParts-resourcepack.zip   plugin/resources/
\cp  ComputerParts-resourcepack.sha1  plugin/resources/
