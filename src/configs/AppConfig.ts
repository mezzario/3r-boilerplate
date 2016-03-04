export class AppConfig {
    // set true to render pages on server
    universal = true;

    server = {
        devPort: 3000,
        prodPort: 3005
    };
}

export default new AppConfig();
