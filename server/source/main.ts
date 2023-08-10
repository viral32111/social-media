import express from "express"
import log4js from "log4js"
import { config as dotenv } from "dotenv"
import { readFileSync, existsSync } from "fs"
import { MongoClient } from "mongodb"
import neo4j from "neo4j-driver"

log4js.configure( {
	appenders: { default: { type: "console" } },
	categories: { default: {
		appenders: [ "default" ],
		level: process.env.NODE_ENV === "test" ? "warn" : process.env.NODE_ENV === "production" ? "info" : "trace"
	} }
} )

const log = log4js.getLogger( "main" )
log.info( "Hello World!" )

process.on( "uncaughtException", ( error ) => {
	log.fatal( "%s: %s", error.name, error.message )
	if ( error.stack != null ) console.error( error.stack )

	process.exit( 1 )
} )

log.debug( "Loading environment variables file..." )
const dotenvResult = dotenv()
if ( dotenvResult.error || !dotenvResult.parsed ) {
	log.debug( "Failed to load environment variables file! (%s)", dotenvResult.error?.message ?? "Unknown" )
} else {
	log.debug( "Loaded %d environment variables.", Object.keys( dotenvResult.parsed ).length )
}

log.debug( "Checking required environment variables..." )
const EXPRESS_LISTEN_ADDRESS = process.env.EXPRESS_LISTEN_ADDRESS ?? "0.0.0.0"
if ( !EXPRESS_LISTEN_ADDRESS ) {
	log.fatal( "Environment variable 'EXPRESS_LISTEN_ADDRESS' value '%s' is invalid!", EXPRESS_LISTEN_ADDRESS )
	process.exit( 1 )
}

const EXPRESS_LISTEN_PORT = parseInt( process.env.EXPRESS_LISTEN_PORT ?? "3000" )
if ( !EXPRESS_LISTEN_PORT || isNaN( EXPRESS_LISTEN_PORT ) || EXPRESS_LISTEN_PORT < 0 || EXPRESS_LISTEN_PORT > 65535 ) {
	log.fatal( "Environment variable 'EXPRESS_LISTEN_PORT' value '%s' is not a valid port number! (must be between 0 and 65535)", EXPRESS_LISTEN_PORT )
	process.exit( 1 )
}

const EXPRESS_CLIENT_DIRECTORY = process.env.EXPRESS_CLIENT_DIRECTORY ?? "client/dist"
if ( !EXPRESS_CLIENT_DIRECTORY ) {
	log.fatal( "Environment variable 'EXPRESS_CLIENT_DIRECTORY' value '%s' is invalid!", EXPRESS_CLIENT_DIRECTORY )
	process.exit( 1 )
}

const PACKAGE_FILE = process.env.PACKAGE_FILE ?? "package.json"
if ( !PACKAGE_FILE ) {
	log.fatal( "Environment variable 'PACKAGE_FILE' value '%s' is invalid!", PACKAGE_FILE )
	process.exit( 1 )
}

const MONGODB_SCHEME = process.env.MONGODB_SCHEME ?? "mongodb"
if ( !MONGODB_SCHEME ) {
	log.fatal( "Environment variable 'MONGODB_SCHEME' value '%s' is invalid!", MONGODB_SCHEME )
	process.exit( 1 )
}

const MONGODB_USER_NAME = process.env.MONGODB_USER_NAME
if ( !MONGODB_USER_NAME ) {
	log.fatal( "Environment variable 'MONGODB_USER_NAME' value '%s' is invalid!", MONGODB_USER_NAME )
	process.exit( 1 )
}

const MONGODB_USER_PASSWORD = process.env.MONGODB_USER_PASSWORD
if ( !MONGODB_USER_PASSWORD ) {
	log.fatal( "Environment variable 'MONGODB_USER_PASSWORD' value '%s' is invalid!", MONGODB_USER_PASSWORD )
	process.exit( 1 )
}

const MONGODB_SERVER_ADDRESS = process.env.MONGODB_SERVER_ADDRESS ?? "127.0.0.1"
if ( !MONGODB_SERVER_ADDRESS ) {
	log.fatal( "Environment variable 'MONGODB_SERVER_ADDRESS' value '%s' is invalid!", MONGODB_SERVER_ADDRESS )
	process.exit( 1 )
}

const MONGODB_SERVER_PORT = parseInt( process.env.MONGODB_SERVER_PORT ?? "27017" )
if ( !MONGODB_SERVER_PORT || isNaN( MONGODB_SERVER_PORT ) || MONGODB_SERVER_PORT < 0 || MONGODB_SERVER_PORT > 65535 ) {
	log.fatal( "Environment variable 'MONGODB_SERVER_PORT' value '%s' is not a valid port number! (must be between 0 and 65535)", MONGODB_SERVER_PORT )
	process.exit( 1 )
}

const MONGODB_DATABASE = process.env.MONGODB_DATABASE ?? "social-media"
if ( !MONGODB_DATABASE ) {
	log.fatal( "Environment variable 'MONGODB_DATABASE' value '%s' is invalid!", MONGODB_DATABASE )
	process.exit( 1 )
}

const NEO4J_SERVER_ADDRESS = process.env.NEO4J_SERVER_ADDRESS ?? "127.0.0.1"
if ( !NEO4J_SERVER_ADDRESS ) {
	log.fatal( "Environment variable 'NEO4J_SERVER_ADDRESS' value '%s' is invalid!", NEO4J_SERVER_ADDRESS )
	process.exit( 1 )
}

const NEO4J_SERVER_PORT = process.env.NEO4J_SERVER_PORT ?? "7474"
if ( !NEO4J_SERVER_PORT ) {
	log.fatal( "Environment variable 'NEO4J_SERVER_PORT' value '%s' is invalid!", NEO4J_SERVER_PORT )
	process.exit( 1 )
}

const NEO4J_USER_NAME = process.env.NEO4J_USER_NAME
if ( !NEO4J_USER_NAME ) {
	log.fatal( "Environment variable 'NEO4J_USER_NAME' value '%s' is invalid!", NEO4J_USER_NAME )
	process.exit( 1 )
}

const NEO4J_USER_PASSWORD = process.env.NEO4J_USER_PASSWORD
if ( !NEO4J_USER_PASSWORD ) {
	log.fatal( "Environment variable 'NEO4J_USER_PASSWORD' value '%s' is invalid!", NEO4J_USER_PASSWORD )
	process.exit( 1 )
}

const NEO4J_DATABASE = process.env.NEO4J_DATABASE ?? "social-media"
if ( !NEO4J_DATABASE ) {
	log.fatal( "Environment variable 'NEO4J_DATABASE' value '%s' is invalid!", NEO4J_DATABASE )
	process.exit( 1 )
}
log.debug( "Checked required environment variables." )

let packageMajorVersion = "0"
try {
	const pkg = JSON.parse( readFileSync( PACKAGE_FILE, "utf-8" ) )
	packageMajorVersion = pkg.version.split( "." )[ 0 ]
	log.debug( "Package version is '%s' so major version will be '%d'.", pkg.version, packageMajorVersion )
} catch ( error ) {
	log.warn( "Failed to read package file '%s' to set major version! (%s)", PACKAGE_FILE, error ?? "Unknown" )
}

log.debug( "Initialising Express application..." )
export const expressApp = express()

expressApp.use( express.json( {
	limit: 1024 * 1024 * 1, // 1 MiB
	type: "application/json",
	strict: true
} ) )

if ( log.isDebugEnabled() ) expressApp.use( ( request, response, next ) => {
	response.on( "finish", () => log.debug( "HTTP %s %s %s => %d", request.method, request.path, JSON.stringify( request.body ), response.statusCode ) )
	next()
} )

expressApp.set( "etag", false )
expressApp.use( ( _, response, next ) => {
	response.set( "Cache-Control", "no-store" )
	next()
} )

const apiBasePath = `/api/v${ packageMajorVersion }`
expressApp.use( ( request, response, next ) => {
	const match = request.path.match( /^\/api\/(?!v\d)(.*)$/i )
	if ( match ) return response.redirect( `${ apiBasePath }/${ match[ 1 ] }` )
	next()
} )

if ( existsSync( EXPRESS_CLIENT_DIRECTORY ) ) {
	expressApp.use( express.static( EXPRESS_CLIENT_DIRECTORY, {
		etag: false
	} ) )
} else {
	log.warn( "Client-side will not be served as directory '%s' does not exist!", EXPRESS_CLIENT_DIRECTORY )
}

log.info( "Initialised Express application." )

log.debug( "Importing API routes..." )
export const expressRouter = express.Router()
import( "./routes/hello.js" )
expressApp.use( apiBasePath, expressRouter )
log.debug( "Serving API routes at '%s'.", apiBasePath )

log.debug( "Setting up Mongo client..." )
export const mongoClient = new MongoClient( `${ MONGODB_SCHEME }://${ MONGODB_USER_NAME }:${ MONGODB_USER_PASSWORD }@${ MONGODB_SERVER_ADDRESS }:${ MONGODB_SERVER_PORT }/${ MONGODB_DATABASE }?retryWrites=true&directConnection=true` )
export const mongoDatabase = mongoClient.db( MONGODB_DATABASE )
log.debug( "Setup Mongo client." )

log.debug( "Setting up Neo4j driver..." )
export const neo4jDriver = neo4j.driver( `neo4j://${ NEO4J_SERVER_ADDRESS }:${ NEO4J_SERVER_PORT }`, neo4j.auth.basic( NEO4J_USER_NAME, NEO4J_USER_PASSWORD ) )
export const neo4jSession = neo4jDriver.session( {
	database: NEO4J_DATABASE,
	defaultAccessMode: neo4j.session.WRITE
} )
log.debug( "Setup Neo4j driver." )

log.debug( "Starting Express application..." )
export const httpServer = expressApp.listen( EXPRESS_LISTEN_PORT, EXPRESS_LISTEN_ADDRESS, async () => {
	log.info( "Express application listening on http://%s:%d.", EXPRESS_LISTEN_ADDRESS, EXPRESS_LISTEN_PORT )

	log.debug( "Connecting Mongo client to database..." )
	await mongoClient.connect()
	await mongoDatabase.command( { ping: 1 } )
	log.info( "Connected to MongoDB." )
} )

const safeStop = () => {
	log.info( "Stopping..." )

	log.debug( "Stopping Express application..." )
	httpServer.close( async () => {
		log.info( "Stopped Express application." )

		log.debug( "Closing Mongo client..." )
		await mongoClient.close()
		log.info( "Disconnected from MongoDB." )

		log.debug( "Closing Neo4j driver..." )
		await neo4jSession.close()
		await neo4jDriver.close()
		log.info( "Disconnected from Neo4j." )
	} )
}

process.once( "SIGINT", safeStop )
process.once( "SIGTERM", safeStop )
