# website-screenshots

Take a screenshot of a website and saves it as a file.

## Install

```sh
npm i -g website-screenshots-cli
```

## Simple usage

Run `website-screenshots -u <url>` to capture a screenshot in fhd (1920x1080), in your current folder.

## Usage

```sh
Usage: website-screenshots [options]

Take a screenshot of a website and saves it as a file.

Options:
  -V, --version             output the version number
  -u, --url <url>           a url to screenshot
  -f, --fullPage            capture full page (default: false)
  -d, --dark                use dark mode, if available (default: false)
  -n --name <name>          optional name for file
  -a, --all                 capture for all presets (default: false)
  -o, --output <path>       path where to save images
  -p, --preset <name>       resolution preset (choices: "iphone11", "iphoneSE", "pixel2", "ipadPro", "ipad", "4k",
                            "wqhd", "fhd", default: "fhd")
  -i, --imageFormat <name>  image format (choices: "png", "jpeg", default: "png")
  -h, --help                display help for command
```
