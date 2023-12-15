import { Controller, ClassOptions, ChildControllers, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { isLoggedIn } from "../../middlewares/LoggedIn";

import * as controllers from './Index';


const ctrlList = [];

for (const c in controllers) {
    if(controllers.hasOwnProperty(c)) {
        const ctrl = (controllers as any)[c];
        ctrlList.push(new ctrl());
    }
}

@Controller("global") // all api class have to have api to work properly
@ClassOptions({ mergeParams: true })
@ChildControllers(ctrlList)
export class GlobalApiController {}