import { Controller, ClassOptions, ChildControllers, Get, Post, Put, Delete } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";

import * as controllers from './Index';


const ctrlList = [];

for (const c in controllers) {
    if(controllers.hasOwnProperty(c)) {
        const ctrl = (controllers as any)[c];
        ctrlList.push(new ctrl());
    }
}

@Controller("user") // all api class have to have api to work properly
@ClassOptions({ mergeParams: true })
@ChildControllers(ctrlList)
export class UserApiController {}