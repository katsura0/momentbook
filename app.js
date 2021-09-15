/* ========================================================================== */
/* Include */
/* ========================================================================== */

const fs = require("fs");
const path = require("path");
const sharp = require('sharp');
const express = require('express');
const bodyParser = require('body-parser')
const child_process = require("child_process");
const SETTINGS = require('./settings.js');

/* ========================================================================== */
/* Global variable */
/* ========================================================================== */

let app = express();

/* For save image by POST */
let jsonParser = bodyParser.json({ limit: '50mb' })

/* ========================================================================== */
/* Local functions */
/* ========================================================================== */

function getVideosIDs() {
    let filenames = fs.readdirSync(SETTINGS.DATABASE_FOLDER);

    let retVal = [];
    filenames.forEach((file) => {
        f = fs.lstatSync(SETTINGS.DATABASE_FOLDER + file);
        if (f.isFile()) {

            const re = /(^\d{6})(\.mp4)/;
            checkStr = file.match(re);
            if (checkStr != null) {
                retVal.push(checkStr[1])
            }
        }
    });

    return retVal;
}

/* ========================================================================== */
/* Express route functions */
/* ========================================================================== */

app.get('/', function (req, res) {
    try {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(fs.readFileSync(__dirname + '/dist/html/index.html'))
        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }

});

app.get('/query', jsonParser, function (req, res) {
    try {
        retVal = []
        let videos = getVideosIDs()
        if ("" != videos) {
            for (item of videos) {
                let foo = JSON.parse(fs.readFileSync(SETTINGS.METADATA_FOLDER + item + '.json', 'utf8'));

                if (!foo.hasOwnProperty('snap')) {
                    jsonData = {
                        "id": item,
                        "rank": foo['rank'],
                        "name": foo['name'],
                        "tag": foo['tag'],
                        "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                    }
                } else {
                    jsonData = {
                        "id": item,
                        "rank": foo['rank'],
                        "name": foo['name'],
                        "tag": foo['tag'],
                        "snap": foo['snap'],
                    }
                }
                retVal.push(jsonData)
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(retVal));
        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }
})

app.delete('/:video_id', jsonParser, function (req, res) {
    try {
        filelist = fs.readdirSync(SETTINGS.METADATA_FOLDER)

        for (f of filelist) {
            if (f.search(req.params['video_id']) >= 0) {
                fs.rename(SETTINGS.METADATA_FOLDER + f, SETTINGS.METADATA_FOLDER + "DEL" + f, function (err) { if (err) throw err; });
            }
        }

        fs.rename(SETTINGS.DATABASE_FOLDER + req.params['video_id'] + ".mp4", SETTINGS.DATABASE_FOLDER + "DEL" + req.params['video_id'] + ".mp4", function (err) { if (err) throw err; });

        res.end();
    } catch (e) {
        res.status(500).send("Error")
        throw e;
    }
})

app.post('/copy/:video_id', jsonParser, function (req, res) {
    try {
        src_filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.body['src'];
        target_filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.body['target'];

        fs.copyFile(src_filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp', target_filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp', (err) => {
            if (err) console.log(src_filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp' + " -> " + target_filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp' + "failed")
        });
        fs.copyFile(src_filename + ".png", target_filename + ".png", (err) => {
            if (err) console.log(src_filename + ".png" + " -> " + target_filename + ".png" + "failed")
        });

        let foo = JSON.parse(fs.readFileSync(SETTINGS.METADATA_FOLDER + req.params['video_id'] + '.json', 'utf8'));
        let jsonData;

        /* Attach 'snap' to JSON */
        if (!foo.hasOwnProperty('snap')) {
            jsonData = {
                "rank": foo['rank'],
                "name": foo['name'],
                "tag": foo['tag'],
                "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            }
        } else {
            jsonData = {
                "rank": foo['rank'],
                "name": foo['name'],
                "tag": foo['tag'],
                "snap": foo['snap'],
            }
        }

        jsonData['snap'][parseInt(req.body['target'])] = jsonData['snap'][parseInt(req.body['src'])];

        fs.writeFile(SETTINGS.METADATA_FOLDER + req.params['video_id'] + '.json', JSON.stringify(jsonData), function (err) {
            if (err) { console.log(err); }
        });
        res.end();
    } catch (e) {
        res.status(500).send("Error")
    }
})

app.post('/pick/:video_id', jsonParser, function (req, res) {
    try {
        fs.rename(SETTINGS.DATABASE_FOLDER + req.params['video_id'] + ".mp4", SETTINGS.DATABASE_FOLDER + "_pick/" + req.params['video_id'] + ".mp4", function (err) { if (err) throw err; });

        res.end();
    } catch (e) {
        res.status(500).send("Error")
        throw e;
    }
})

app.delete('/image/:video_id/:snap_id', jsonParser, function (req, res) {
    try {
        /* Update JSON */
        let foo = JSON.parse(fs.readFileSync(SETTINGS.METADATA_FOLDER + req.params['video_id'] + '.json', 'utf8'));
        let jsonData;

        /* Attach 'snap' to JSON */
        if (!foo.hasOwnProperty('snap')) {
            jsonData = {
                "rank": foo['rank'],
                "name": foo['name'],
                "tag": foo['tag'],
                "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            }
        } else {
            jsonData = {
                "rank": foo['rank'],
                "name": foo['name'],
                "tag": foo['tag'],
                "snap": foo['snap'],
            }
        }

        jsonData['snap'][parseInt(req.params['snap_id'])] = 0.0;


        fs.writeFile(SETTINGS.METADATA_FOLDER + req.params['video_id'] + '.json', JSON.stringify(jsonData), function (err) {
            if (err) {
                console.log(err);
            }
        });

        /* Rename *.png snapshot */
        filename0 = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.params['snap_id'] + ".png";
        filename1 = SETTINGS.METADATA_FOLDER + "DEL" + req.params['video_id'] + '-' + req.params['snap_id'] + ".png";;
        fs.rename(filename0, filename1, function (err) { if (err) console.log(err) });

        /* Rename *.webp snapshot */
        filename0 = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.params['snap_id'] + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + ".webp";
        filename1 = SETTINGS.METADATA_FOLDER + "DEL" + req.params['video_id'] + '-' + req.params['snap_id'] + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + ".webp";;
        fs.rename(filename0, filename1, function (err) { if (err) console.log(err) });

        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }

})

app.get('/image/:video_id/:snap_id', jsonParser, function (req, res) {

    try {
        filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + "-" + req.params['snap_id'];
        if (true === fs.existsSync(filename + '.png')) {
            let img = fs.readFileSync(filename + '.png');
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(img, 'binary');
        }
        else {
            res.status(404).send("Not found")
        }
    } catch (e) {
        res.status(404).send("Not found")

    }
})

app.post('/image/:video_id/:snap_id', jsonParser, function (req, res) {
    try {
        filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.params['snap_id'];
        let base64Data = req.body.data.replace(/^data:image\/png;base64,/, "")

        require("fs").writeFileSync(filename + '.png', base64Data, 'base64');
        sharp(Buffer.from(base64Data, 'base64'))
            .resize({
                fit: sharp.fit.contain,
                height: SETTINGS.THUMBNAIL_RESOLUTION
            }).toFile(filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION + '.webp');

        res.end();

    } catch (e) {
        res.status(404).send("Not found")
    }
})

app.get('/thumbnail/:video_id/:snap_id', jsonParser, function (req, res) {
    try {
        filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + "-" + req.params['snap_id'];

        if (true === fs.existsSync(filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp')) {
            let img = fs.readFileSync(filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp');
            res.writeHead(200, { 'Content-Type': 'image/webp' });
            res.end(img, 'binary');
        }
        else {
            if (true === fs.existsSync(filename + '.png')) {
                let img = fs.readFileSync(filename + ".png");
                sharp(img)
                    .resize({
                        fit: sharp.fit.contain,
                        height: SETTINGS.THUMBNAIL_RESOLUTION
                    }).toFile(filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp');

                let empty = fs.readFileSync(__dirname + "/icon/loading.svg");
                res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
                res.end(empty, 'binary');

            } else {
                res.status(404).send("Not found")
            }
        }
    } catch (e) {
        res.status(404).send("Not found")
    }
})

app.post('/thumbnail/:video_id/:snap_id', jsonParser, function (req, res) {
    try {
        filename = SETTINGS.METADATA_FOLDER + req.params['video_id'] + '-' + req.params['snap_id'];

        let base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");
        require("fs").writeFile(filename + '-' + SETTINGS.THUMBNAIL_RESOLUTION.toString() + '.webp', base64Data, 'base64', function (err) { });

        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }
})

app.get('/json/:video_id', jsonParser, function (req, res) {
    try {
        id = req.params['video_id']

        let jsonData = fs.readFileSync(SETTINGS.METADATA_FOLDER + id + '.json', 'utf8');
        res.write(jsonData);
        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }


})

app.post('/json/*', jsonParser, function (req, res) {
    try {
        file = fs.readFileSync(SETTINGS.METADATA_FOLDER + req.params['0'] + '.json', 'utf8');
        let foo = JSON.parse(fs.readFileSync(SETTINGS.METADATA_FOLDER + req.params['0'] + '.json', 'utf8'));
        let jsonData;

        for (t = 0; t < foo['tag'].length; t++)
            foo['tag'][t] = foo['tag'][t].replace(/^\s+|\s+$/g, '')

        /* Attach 'snap' to JSON */
        if (!foo.hasOwnProperty('snap')) {
            jsonData = {
                "rank": foo['rank'].replace(/^\s+|\s+$/g, ''),
                "name": foo['name'].replace(/^\s+|\s+$/g, ''),
                "tag": foo['tag'],
                "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            }
        } else {
            jsonData = {
                "rank": foo['rank'].replace(/^\s+|\s+$/g, ''),
                "name": foo['name'].replace(/^\s+|\s+$/g, ''),
                "tag": foo['tag'],
                "snap": foo['snap'],
            }
        }

        if (req.body.rank != null) {
            jsonData["rank"] = req.body.rank;
            jsonData["name"] = req.body.name;
            jsonData["tag"] = req.body.tag.split(",")

        } else if (req.body.snap != null) {
            jsonData["snap"][parseInt(req.body.snap, 10)] = req.body.time;

        }

        fs.writeFile(SETTINGS.METADATA_FOLDER + req.params['0'] + ".json", JSON.stringify(jsonData), function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }
});

app.get('/video/:video_id/', function (req, res) {
    try {
        const path = SETTINGS.DATABASE_FOLDER + req.params['video_id'] + '.mp4'
        const stat = fs.statSync(path)
        const fileSize = stat.size

        const range = req.headers.range
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1
            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    } catch (e) {
        res.status(404).send("Not found")
    }
});

app.get('/settings', jsonParser, function (req, res) {
    try {
        jsonData = {
            nums_of_snapshot: SETTINGS.NUMS_OF_SNAPSHOT,
            thumbnail_resolution: SETTINGS.THUMBNAIL_RESOLUTION,
        }
        res.json(jsonData);
        res.end();
    } catch (e) {
        res.status(404).send("Not found")
    }

})


const IMPORT_FOLDER = __dirname + "/import/";
const TRANSCODE_FOLDER = __dirname + "/transcode/";
const VIDEO_FOLDER = __dirname + "/video/";
const METADATA_FOLDER = __dirname + "/metadata/";

function ParseImportItem(file, video_id, jsonData) {
    let retVal = ""
    retVal = retVal + file + "<br>";
    retVal = retVal + VIDEO_FOLDER + video_id + ".mp4" + "<br>";
    retVal = retVal + METADATA_FOLDER + video_id + ".json" + "<br>";
    retVal = retVal + JSON.stringify(jsonData) + "<br>";

    fs.writeFile(METADATA_FOLDER + video_id + ".json", JSON.stringify(jsonData), function (err) {
        if (err) { console.log(err); }
    });

    fs.rename(file, VIDEO_FOLDER + video_id + ".mp4", function (err) {
        if (err) console.log('ERROR: ' + err);
    });

    return retVal;
}

app.get('/import', jsonParser, function (req, res) {
    let id = 0;
    let html = "";

    /* Check the last video ID */

    fs.readdirSync(VIDEO_FOLDER).forEach((file) => {
        retVal = fs.lstatSync(VIDEO_FOLDER + file);
        if (retVal.isFile()) {
            const Re = /(^\d{6})(\.mp4)/;
            if ((checkStr = file.match(Re)) != null) {
                if (parseInt(checkStr[1]) > id) {
                    id = parseInt(checkStr[1]);
                }
            }

        }
    });

    fs.readdirSync(IMPORT_FOLDER).forEach((file) => {
        let paramaterList = [];
        if (fs.lstatSync(IMPORT_FOLDER + file).isFile()) {

            const ReWithMetadata = /(^[SA]+,.*)(\.mp4)/;
            const Re = /(^.*)(\.mp4)/;
            if ((checkStr = file.match(ReWithMetadata)) != null) {
                paramaterList = checkStr[1].split(",");
                jsonData = {
                    "rank": paramaterList[0],
                    "name": paramaterList[1],
                    "tag": paramaterList.slice(2),
                    "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
                }
                id = id + 1;
                html = html + ParseImportItem(IMPORT_FOLDER + file, id.toString().padStart(6, '0'), jsonData)
            }
            // else if (file.match(Re) != null) {
            //     jsonData = {
            //         "rank": "NA",
            //         "name": "NA",
            //         "tag": "NA",
            //         "snap": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            //     }
            //     id = id + 1;
            //     html = html + ParseImportItem(IMPORT_FOLDER + file, id.toString().padStart(6, '0'), jsonData)
            // }

        }

    });
    res.send(html)
    res.end();
})

function Transcode(filename, ext) {
    if (fs.existsSync(filename + "_vaapi.mp4")) {
        console.log(filename + "_vaapi.mp4 exist")
    }
    else {
        console.log(filename + ext)
        child_process.execSync("ffmpeg " +
            "-hwaccel vaapi -hwaccel_output_format vaapi -i " +
            TRANSCODE_FOLDER + filename + ext +
            " -c:v h264_vaapi " +
            TRANSCODE_FOLDER + filename + "_vaapi.mp4",
            (error, stdout, stderr) => {
                //console.log(`${stdout}`);
                console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })
    }

}

app.get('/transcode', jsonParser, function (req, res) {
    let html = "";

    fs.readdir(TRANSCODE_FOLDER, (err, files) => {
        files.forEach(file => {
            if (fs.lstatSync(TRANSCODE_FOLDER + file).isFile()) {
                re = /(^.*)(\.wmv)/;
                if ((checkStr = file.match(re)) != null) {
                    Transcode(checkStr[1], checkStr[2])
                }
                re = /(^.*)(\.mp4)/;
                if ((checkStr = file.match(re)) != null) {
                    Transcode(checkStr[1], checkStr[2])
                }
            }
        })
    })

    res.send("Start to transcode")
    res.end();
})

app.use('/js', express.static(__dirname + '/dist/js'));

app.listen(SETTINGS.PORT, function () {
    console.log('VideoDB listening on port 3000!');
});