export class AppConfig {
    // set true to render pages on server
    universal = true;

    buildSubpath = "build";
    staticSubpath = "static";

    inlineFileSizeLimit = 0x4000;

    server = {
        devPort: 3000,
        prodPort: 3005
    };
}

export default new AppConfig();
