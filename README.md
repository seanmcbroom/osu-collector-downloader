# osu!Collector Downloader

This program downloads beatmap collections from osu!Collector, it's as simple as that.

Linux - Available ✔️

Windows - Available ✔️

MacOS - Unavailable ❌

# Usage

- First, you will need to select a directory. This this is where the downloader will create a folder and download all the beatmaps .osz archive files.

- The second input asks for the collection id, you can find this at the end of the collection URL on the website.

![Untitled](https://user-images.githubusercontent.com/57121175/213617957-a8fa772c-b23f-4932-87bc-3088803c4e63.png)


# Building

Currently if you need to produce a build for an operating system other than Linux you will need to build and pack from source, on your own operating system. Cross platform builds are not supported in this release, due to this limitation.

- Clone this repository

`git clone https://github.com/seanmcbroom/osu-collector-downloader`

- Install dependencies

`npm install`

- Build and pack from source

`npm run build && npx nodegui-packer --pack ./dist`

# Requirements

- Nodejs v14.4.0+
