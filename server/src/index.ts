// // template taken from:
// // https://developer.okta.com/blog/2018/11/15/node-express-typescript

// // folder structure taken from:
// // https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/

// // model setup taken from:
// // https://medium.com/@lamtienphat/using-overnightjs-sequelize-in-typescript-to-create-nodejs-app-6eb1f613c8a

// Start backend server using command: npm run start

import { App } from "./app";

const app = new App();
app.start();
app.initSocket();