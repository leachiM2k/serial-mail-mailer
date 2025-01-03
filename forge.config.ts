import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import * as path from "node:path";

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        icon: './images/icon',
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            setupIcon: './images/icon.ico',
        }),
        new MakerZIP({}, ['darwin']),
        new MakerDMG({
            icon: path.join(process.cwd(), '/images/icon.icns'),
        }),
        new MakerRpm({}),
        new MakerDeb({
            options: {
                maintainer: 'Michael Rotmanov',
                icon: './images/icon.png',
            }
        })],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.ts',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
    ],
};

export default config;
