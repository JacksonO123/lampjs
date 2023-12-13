const mode = process.argv[2];
if (mode === 'serve') {
    const serverFile = '../dist/server.js';
    const startServer = (await import(serverFile)).default;
    startServer();
}
else if (mode === 'build') {
    const buildFile = '../dist/build.js';
    await import(buildFile);
}
export {};
