import { expressRouter } from "../main.js"

expressRouter.get( "/hello", ( _, response ) => response.json( {
	code: 0,
	data: {
		message: "Hello World!"
	}
} ) )
