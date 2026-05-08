import { Config } from '@stencil/core';
import { config as mainConfig } from './stencil.config';

export const config:Config = {...mainConfig, ...{minifyJs: false, minifyCss: false}};
