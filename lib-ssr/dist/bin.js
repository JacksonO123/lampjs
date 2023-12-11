const mode = process.argv[2];
if (mode === 'serve') {
    const serverFile = '../dist/server.js';
    import(serverFile);
}
else if (mode === 'build') {
    const buildFile = '../dist/build.js';
    import(buildFile);
}
export {};
