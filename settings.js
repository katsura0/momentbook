let SETTINGS = {}
SETTINGS.NUMS_OF_SNAPSHOT = 10
SETTINGS.THUMBNAIL_RESOLUTION = 180
SETTINGS.PORT = 3000;
//const homedir = require('os').homedir();
const rootdir = __dirname;
SETTINGS.DATABASE_FOLDER = rootdir + "/video/";
SETTINGS.METADATA_FOLDER = rootdir + "/metadata/";

module.exports = SETTINGS;