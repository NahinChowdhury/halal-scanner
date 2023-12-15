import { Controller, ClassOptions, ChildControllers } from "@overnightjs/core";

import * as controllers from './Index';

const ctrlList = [];

for (const c in controllers) {
    if(controllers.hasOwnProperty(c)) {
        const ctrl = (controllers as any)[c];
        ctrlList.push(new ctrl());
    }
}

@Controller("api") // all api class have to have api to work properly
@ClassOptions({ mergeParams: true })
@ChildControllers(ctrlList)
export class ApiController {}


// setup a file like this and only pull the central controller for each folder
// suppose User has 10 controllers in it. Have a central controller (E.g: UserController)
// UserController will have the exact same setup as this page and will have something like @Controller("user")