import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import needle from "needle";
import dotenv from "dotenv";
import { client } from "../../models/index";


@Controller("tweet")
export class UserController {
    @Post("isTweetGood")
    public async signup(req: Request, res: Response): Promise<Response> {
        
        return res.send("banger detected");
    }

    @Get("isTweetGood")
    public async twitterResponseTest(req: Request, res: Response): Promise<Response> {
        
        // res.setHeader('Content-Type', 'application/json');
        // res.setHeader('Access-Control-Allow-Origin', '*');
        // // Query the data from the "User" table
        // await client.query('SELECT * FROM "User"', (err, response) => {
        //     if (err) {
        //     console.error('Error querying the database:', err.stack);
        //     return;
        //     }
        
        //     console.log('Data from the "User" table:', response.rows);
        //     // return res.send(JSON.stringify(response.rows[0]))
        //     return res.send("YES")
        // });


        // Set the response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            // Query the data from the "Users" table in the "public" schema
            const data = await client.query('SELECT * FROM "User"');
            return res.json(data.rows);  // Send the query results to the client
        } catch (err) {
            console.error('Error querying the database:', err.stack);
            return res.send(err.stack);  // Send the error message to the client
        }
        // dotenv.config();
        // // Get Bearer Token from .env
        // // const bearerToken = "AAAAAAAAAAAAAAAAAAAAABApiQEAAAAAwCQQjmE5XzxmWhQmaIUqEt%2FddOw%3De7xJpALFTQa0ifQ8AuS8Q6iCHG35J6mxCboxEsF82o4IuaXnGx";
        // const bearerToken = process.env.TWITTER_BEARER_TOKEN;
        // // TODO: Fix fotenv issue
        // const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

        // console.log('bearerToken');
        // console.log(bearerToken);
        // // Get Tweets from Twitter API
        // // const getTweets = async(id:string) => {

        // const params = {
        //     'query': 'from:'+id+' -is:retweet',
        //     'tweet.fields': 'created_at',
        //     'expansions': 'author_id'
        // }
        // const response = await needle ('get', endpointUrl, params,{
        //     headers: {
        //         "User-Agent": "v2RecentSearchJS",
        //         "Authorization": `Bearer ${bearerToken}`
        //     }
        // })

        // console.log(response.body)

        // if (response.statusCode !== 200) {
        //     if (response.statusCode === 403) {
        //         res.status(403).send(response.body);
        //     }
        //     else {
        //         return res.send(response.body.error.message);
        //     }
        // }
        // if (response.body) return res.send(response.body);

        return res.send("Unsuccessful Request");
    }
  
}