# osu!Collector Downloader

This program downloads beatmap collections from osu!Collector, it's as simple as that.

Linux - Available ✔️

Windows - Unavailable ❌

MacOS - Unavailable ❌

# Usage

Currently if you need to produce a build for an operating system other than Linux you will need to build and pack from source, on your own operating system. Cross platform builds are not supported in this release, due to this limitation.

- Clone this repository

`git clone https://github.com/seanmcbroom/osu-collector-downloader`

- Install dependencies

`npm install`

- Build and pack from source

`npm run build && npx nodegui-packer --pack ./dist`

# Requirements

- Nodejs v14.4.0+
