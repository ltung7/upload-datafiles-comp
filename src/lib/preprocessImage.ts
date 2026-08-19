import { FileTypeConfig } from './index.d';

export default {
    preprocess: async () => false ,
    extensions: [ 'png', 'jpg', 'webp' ]
} as FileTypeConfig;