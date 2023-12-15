import { Controller, ClassOptions, ChildControllers } from "@overnightjs/core";

import * as controllers from './Index';

const ctrlList = [];

for (const c in controllers) {
    if(controllers.hasOwnProperty(c)) {
        const ctrl = (controllers as any)[c];
        ctrlList.push(new ctrl());
    }
}

@Controller("tweetCentral") // all api class have to have api to work properly
@ClassOptions({ mergeParams: true })
@ChildControllers(ctrlList)
export class TweetCentralApiController {}