import chai from "chai"
import chaiHTTP from "chai-http"
import chaiString from "chai-string"
import { expressApp } from "../../main.js"

chai.use( chaiHTTP )
chai.use( chaiString )

suite( "API Routes", () => {
	test( "Hello", async () => {
		const response = await chai.request( expressApp ).get( "/api/v0/hello" )
		chai.assert.equal( response.status, 200, "HTTP response status code should be 200 OK." )
		chai.assert.equalIgnoreCase( response.type, "application/json", "HTTP response content type should be JSON." )
		chai.assert.equal( response.body[ "code" ], 0, "JSON payload status code should be success." )
		chai.assert.deepEqual( response.body[ "data" ], { message: "Hello World!" }, "JSON payload data should match." )
	} )
} )
