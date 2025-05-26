/* eslint-disable prettier/prettier */
module.exports = {
    apps: [
        {
            name: 'core-service',
            script: 'dist/apps/core-service/src/main.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'notification-service',
            script: 'dist/apps/notification-service/src/main.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
