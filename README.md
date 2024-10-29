# osu!Collector Downloader

This program downloads beatmap collections from osu!Collector, it's as simple as that. [Download latest release](https://github.com/seanmcbroom/osu-collector-downloader/releases/tag/alpha-v0.3.0)

Linux - Build from source 🟨

Windows - Available ✔️

MacOS - Build from source 🟨

# Usage

- First, you will need to select a directory. This this is where the downloader will create a folder and download all the beatmaps .osz archive files.

- The second input asks for the collection id, you can find this at the end of the collection URL on the website.

![Untitled](https://user-images.githubusercontent.com/57121175/213617957-a8fa772c-b23f-4932-87bc-3088803c4e63.png)

# Building from source

Currently if you need to produce a build for MacOS you will need to build and pack from source. Cross platform builds are not supported in the packager, due to this limitation I cannot provide a MacOS build. However you're more than welcome to build from source on your own system.

- Clone this repository

`git clone https://github.com/seanmcbroom/osu-collector-downloader`

- Change working directory

`cd osu-collector-downloader`

- Install dependencies

`npm install`

- Run the build command

`npm run build`

# Requirements

- Nodejs v14.4.0+
