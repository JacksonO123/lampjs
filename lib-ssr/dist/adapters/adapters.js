import { vercelBuild } from './vercel.js';
export const adapters = [
    {
        name: 'Vercel',
        test: () => !!process.env.VERCEL,
        adapter: vercelBuild
    }
];
export const runAdapter = async () => {
    for (let i = 0; i < adapters.length; i++) {
        if (adapters[i].test()) {
            console.log(`building for ${adapters[i].name}`);
            await adapters[i].adapter();
            return;
        }
    }
};
