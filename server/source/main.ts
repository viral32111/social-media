import express from "express"
import log4js from "log4js"
import { config as dotenv } from "dotenv"
import { readFileSync, existsSync } from "fs"

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
log.debug( "Checked required environment variables." )

const PACKAGE_FILE = process.env.PACKAGE_FILE ?? "package.json"
if ( !PACKAGE_FILE ) {
	log.fatal( "Environment variable 'PACKAGE_FILE' value '%s' is invalid!", PACKAGE_FILE )
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

log.debug( "Starting Express application..." )
export const httpServer = expressApp.listen( EXPRESS_LISTEN_PORT, EXPRESS_LISTEN_ADDRESS, () => {
	log.info( "Express application listening on http://%s:%d.", EXPRESS_LISTEN_ADDRESS, EXPRESS_LISTEN_PORT )
} )

const safeStop = () => {
	log.info( "Stopping..." )

	log.debug( "Stopping Express application..." )
	httpServer.close( () => {
		log.info( "Stopped Express application." )
	} )
}

process.once( "SIGINT", safeStop )
process.once( "SIGTERM", safeStop )
