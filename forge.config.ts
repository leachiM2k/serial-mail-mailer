import type { ForgeConfig } from '@electron-forge/shared-types';
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
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupIcon: path.join(process.cwd(), '/images/icon.ico'),
            },
        },
        {
            name: '@electron-forge/maker-zip',
            config: {},
        },
        {
            name: '@electron-forge/maker-deb',
            platforms: ['linux'],
            config: {
                maintainer: 'Michael Rotmanov',
                icon: path.join(process.cwd(), '/images/icon.png'),
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
            config: {
                icon: path.join(process.cwd(), '/images/icon.icns'),
            }
        },
        {
            name: '@electron-forge/maker-rpm',
            platforms: ['linux'],
            config: {
                maintainer: 'Michael Rotmanov',
                icon: path.join(process.cwd(), '/images/icon.png'),
            }
        }
    ],
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
