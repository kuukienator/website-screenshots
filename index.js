#!/usr/bin/env node

const path = require('path');
const { Command, Option } = require('commander');
const puppeteer = require('puppeteer');

const PRESETS = {
    iphone11: {
        isMobile: true,
        device: puppeteer.devices['iPhone 11'],
    },
    pixel2: {
        isMobile: true,
        device: puppeteer.devices['Pixel 2'],
    },
    galaxy: {
        isMobile: true,
        device: puppeteer.devices['Galaxy S9+'],
    },
    '4k': {
        isMobile: false,
        w: 3840,
        h: 2160,
    },
    wqhd: {
        isMobile: false,
        w: 2560,
        h: 1440,
    },
    fhd: {
        isMobile: false,
        w: 1920,
        h: 1080,
    },
};

const DEFAULT_PRESET = 'fhd';

const getFileName = (imageFormat, preset = DEFAULT_PRESET, name) => {
    return `website-screenshot${
        name ? '-' + name : ''
    }-${preset}-${Date.now()}.${imageFormat}`;
};

const getFilePath = (name, outputPath) => {
    return outputPath ? path.resolve(outputPath, name) : name;
};

const getPresetData = (preset) => {
    const p = PRESETS[preset];
    return p ? p : PRESETS.fhd;
};

const takeScreenShot = async ({
    url,
    fullPage,
    preset,
    name,
    dark,
    imageFormat,
    outputPath,
}) => {
    console.log(
        `📷 Taking screenshot of "${url}" in preset ${
            preset || DEFAULT_PRESET
        }...`
    );

    const presetData = getPresetData(preset);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    if (dark) {
        await page.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: 'dark' },
        ]);
    }

    if (presetData.isMobile) {
        await page.emulate(presetData.device);
    } else {
        await page.setViewport({
            width: presetData.w,
            height: presetData.h,
            deviceScaleFactor: 1,
        });
    }

    await page.goto(url, { waitUntil: 'networkidle0' });
    const filePath = getFilePath(
        getFileName(imageFormat, preset, name),
        outputPath
    );
    const screenShotOptions = {
        type: imageFormat,
        path: filePath,
        fullPage,
    };

    if (imageFormat === 'jpeg') {
        screenShotOptions.quality = 90;
    }
    await page.screenshot(screenShotOptions);

    await browser.close();
    console.log(`🖼 Saved image as "${filePath}".`);
};

const runTasks = async (tasks, takeScreenShot) => {
    if (tasks.length === 0) {
        console.log('Done! Have a nice day. 👋😃');
        return;
    }

    const nextTask = tasks[0];

    await takeScreenShot(nextTask);
    await runTasks(tasks.slice(1), takeScreenShot);
};

(async () => {
    const program = new Command();
    program
        .name('website-screenshots')
        .description('Take a screenshot of a website and saves it as a file.')
        .version('0.0.4')
        .requiredOption('-u, --url <url>', 'a url to screenshot')
        .option('-f, --fullPage', 'capture full page', false)
        .option('-d, --dark', 'use dark mode, if available', false)
        .option('-n --name <name>', 'optional name for file')
        .option('-a, --all', 'capture for all presets', false)
        .option('-o, --output <path>', 'path where to save images')
        .addOption(
            new Option('-p, --preset <name>', 'resolution preset', 'fhd')
                .choices(Object.keys(PRESETS))
                .default('fhd')
        )
        .addOption(
            new Option('-i, --imageFormat <name>', 'image format', 'png')
                .choices(['png', 'jpeg'])
                .default('png')
        )

        .parse(process.argv);

    const {
        fullPage,
        preset,
        name,
        dark,
        url,
        all,
        imageFormat,
        output: outputPath,
    } = program.opts();

    const tasks = all
        ? Object.keys(PRESETS).map((preset) => ({
              url,
              fullPage,
              preset,
              name,
              dark,
              imageFormat,
              outputPath,
          }))
        : [
              {
                  url,
                  fullPage,
                  preset,
                  name,
                  dark,
                  imageFormat,
                  outputPath,
              },
          ];

    try {
        await runTasks(tasks, takeScreenShot);
    } catch (e) {
        console.error(e);
        if (e.code === 'ENOENT') {
            console.log(`Output directory "${outputPath}" does not exist.`);
        }
        console.log('An error happened while taking screenshots.');
        process.exit(1);
    }
})();
