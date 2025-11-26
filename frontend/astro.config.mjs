// // @ts-check
// import { defineConfig } from 'astro/config';

// // https://astro.build/config
// export default defineConfig({});

import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
    integrations: [vue()],
});