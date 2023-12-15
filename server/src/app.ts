import { Server } from "@overnightjs/core";

import { initDB } from "./models";
import { ApiController } from "./controllers/ApiController";
import * as bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import cookieParser  from "cookie-parser";
import * as io from 'socket.io';
import * as http from 'http';
import cors from 'cors';

import 'dotenv/config';

export class App extends Server {
	private close: http.Server;

	constructor() {
		super();
		// setting up session
		this.app.use( 
			session({
				secret: process.env.EXPRESS_SERCET,
				resave: true,
				saveUninitialized: true,
				cookie: {maxAge: 60 * 1000 * 300},
				rolling: true // reset exipration date with every request
			})
		);
		this.applyMiddleWares();
		this.boostrap();
		this.setupControllers();
	}

	public start(): void {
		const port = process.env.PORT || 3001;

		this.app.use( (req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			next();
		});
		
		// Enable CORS for all routes
		this.app.use(cors());
		
		// Use the cookie-parser middleware
		this.app.use(cookieParser());

		this.app.get('/set-session', (req, res) => {
			// Set a session variable with a key of 'mySession' and a value of 'myValue'
			req.session.mySession = 'myValue';
			console.log('req.session.mySession');
			console.log(req.session.mySession);
			res.send('Session variable set');
		});
		
		// Add a route that gets the value of the session variable
		this.app.get('/get-session', (req, res) => {
			// Get the value of the session variable with the key 'mySession'
			const sessionValue = req.session.mySession;
			res.send(`Session variable value: ${sessionValue}`);
		});
		
		this.close = this.app.listen(port, () => {
            console.log('Server listening on port: ' + port);
        });

	}

	private applyMiddleWares() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	initSocket() {
		// console.log("Connecting to socket")
		
        const io = require('socket.io')(this.close);

		// io. anything means you are sendin the message to everyone
		// socket. anything means you are sending the message to yourself only unless you use broadcast(then everyone but you gets it)
		io.on('connection', (socket: io.Socket) => {
			// console.log(`A user has connected: ${socket.id}`);
		
			// Broadcast a message to all clients except the one that just connected
			// socket.broadcast.emit('receive_message', {message: 'A new user has joined the chat', username: socket.id});
		
			socket.on('join_room', (data) => {
				// console.log(`Join request received: ${data.room}, ${data.username}, ${socket.id}`);
				
				socket.join(data.room);

				// Send the message back to all clients
				// socket.to(data.room).emit('receive_message', {message: "A new user has joined the room", username: data.username});
			})

			socket.on('send_message', (data) => {
				// console.log(`Received Room message: ${data.message}, ${data.username}, ${socket.id}`);
				
				// Send the message back to all clients
                // Expecting data of format {room, messageId, sender, details, read, updatedAt}
				io.to(data.room).emit('receive_message', data);
			});

			socket.on('delete_message', (data) => {
				// console.log(`Deleted Room message: ${data.message}, ${data.username}, ${socket.id}`);
				
				// Send the message back to all clients
				// Expecting data to be {room, messageId, sender, details, read, updatedAt}
				io.to(data.room).emit('message_deleted', data);
			});
			
			socket.on('edit_message', (data) => {
				// console.log(`Edited Room message: ${data.message}, ${data.username}, ${socket.id}`);
				
				// Send the message back to all clients
				// Expecting data to be {room, messageId, sender, details, read, updatedAt}
				io.to(data.room).emit('message_edited', data);
			});
		
			// Listen for a "disconnect" event from the client
			// socket.on('disconnect', () => {
			// 	// console.log(`A user has disconnected: ${socket.id}`);
			
			// 	// Broadcast a message to all clients except the one that just disconnected
			// 	// socket.broadcast.emit('receive_message', {message: 'A user has left the chat', username: socket.id});
			// });
		});
	}

	private async boostrap() {
		// Connect to db
		await initDB();
	}

	private setupControllers() {
		super.addControllers(new ApiController());
	}
}