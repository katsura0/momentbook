let PageX, PageY
let CroppingVideoId;
let CroppingSnapId;
let ImageCropper;

/* Croppie initialization */
let el = document.getElementById('CropWindow');
ImageCropper = new Croppie(el, {
    viewport: { width: 320, height: 180 },
    boundary: { width: 640, height: 360 },
    showZoomer: false,
    enableOrientation: true
});

function Snapshot(VideoIDIn, SnapIDIn) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    let snap_id = SnapIDIn.toString().padStart(2, '0')
    // let canvas = document.getElementById("SnapshotCanvas");
    let canvas = document.createElement('canvas')
    let video = document.getElementById("VideoController");
    let CurrentTime = video.currentTime;
    let uri;

    if (video != null) {
        /* Get image */
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        ImageDataURL = canvas.toDataURL("image/png")

        /* Save image by backend */
        uri = '/image/' + video_id + "/" + snap_id + "/";

        fetch(uri, {
            method: 'POST',
            body: JSON.stringify({
                data: ImageDataURL
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {

        });

        /* Refresh Snapshot on the UI */
        img = document.getElementById("img" + video_id + "-" + snap_id);
        img.setAttribute('onclick', 'ShowVideo(this, "1", "' + video_id + '" ,"' + CurrentTime.toString() + '")');
        img.src = ImageDataURL

        t = document.getElementById("time" + video_id + "-" + snap_id);
        if (null != t)
            t.innerHTML = CurrentTime.toFixed(3);

        uri = '/json/' + video_id;
        fetch(uri, {
            method: 'POST',
            body: JSON.stringify({
                snap: snap_id,
                time: CurrentTime
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

    }
}
window.Snapshot = Snapshot

function SnapshotRefresh(VideoIDIn, SnapIDIn) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    let snap_id = SnapIDIn.toString().padStart(2, '0')
    let img = document.getElementById("img" + video_id + "-" + snap_id);
    setTimeout(function () {
        img.src = ""
        img.src = 'thumbnail/' + video_id + "/" + snap_id + '/';
    }, 500);
}
window.SnapshotRefresh = SnapshotRefresh

function SnapshotDelete(VideoIDIn, SnapIDIn) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    let snap_id = SnapIDIn.toString().padStart(2, '0');
    let uri = "";

    /* Refresh Snapshot on the UI */
    let img = document.getElementById("img" + video_id + "-" + snap_id);
    t = document.getElementById("time" + video_id + "-" + snap_id);
    if (null != t)
        t.innerHTML = "0.000";
    setTimeout(function () {
        img.src = ""
        img.src = 'image/' + video_id + "/" + snap_id + '/';
    }, 500);

    uri = '/image/' + video_id + '/' + snap_id;
    fetch(uri, {
        method: 'DELETE',

    });
}
window.SnapshotDelete = SnapshotDelete

function SnapshotCrop(VideoIDIn, SnapIDIn) {
    CroppingVideoId = VideoIDIn.toString().padStart(6, '0');
    CroppingSnapId = SnapIDIn.toString().padStart(2, '0')
    SnapshotCropOrientation = 0;
    ImageCropper.bind({
        url: '/image/' + CroppingVideoId + '/' + CroppingSnapId + '/',
        orientation: 1
    });
}
window.SnapshotCrop = SnapshotCrop

function SnapshotCropSave() {
    ImageCropper.result({
        type: 'base64',
        size: 'viewport',
        format: 'webp',
        quality: '1',
        circle: 'false'
    }).then(function (retVal) {
        uri = '/thumbnail/' + CroppingVideoId + '/' + CroppingSnapId,
            fetch(uri, {
                method: 'POST',
                body: JSON.stringify({
                    data: retVal
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function () { SnapshotRefresh(CroppingVideoId, CroppingSnapId); })
    });
}
window.SnapshotCropSave = SnapshotCropSave

function SnapshotCropRotate(DegreeIn) {
    ImageCropper.rotate(DegreeIn)
}
window.SnapshotCropRotate = SnapshotCropRotate

function VideoDelete(video_id) {
    if (confirm("Delete " + video_id + "?")) {
        TargetRow = document.getElementById("row" + video_id);
        TargetRow.style.display = "none";

        const uri = '/' + video_id;
        fetch(uri, {
            method: 'DELETE',

        });
    }
}
window.VideoDelete = VideoDelete;

function VideoPick(VideoIDIn) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    if (confirm("Pick " + video_id + "?")) {
        const uri = '/pick/' + video_id;
        fetch(uri, {
            method: 'POST',
        });
    }
}
window.VideoPick = VideoPick;

function MetadataSave(VideoIDIn) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    let RankInput = document.getElementById("RankInput");
    let NameInput = document.getElementById("NameInput");
    let TagInput = document.getElementById("TagInput");

    const uri = '/json/' + video_id;
    fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
            rank: RankInput.value,
            name: NameInput.value,
            tag: TagInput.value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });


}
window.MetadataSave = MetadataSave;

async function SnapshotCopy(VideoIDIn, src, target) {
    let video_id = VideoIDIn.toString().padStart(6, '0');
    uri = '/copy/' + video_id;
    fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
            src: src,
            target: target,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    /* Refresh Snapshot on the UI */
    let img = document.getElementById("img" + video_id + "-" + target);
    setTimeout(function () {
        img.src = ""
        img.src = 'image/' + video_id + "/" + target + '/';
    }, 500);

    t0 = document.getElementById("time" + video_id + "-" + src);
    t1 = document.getElementById("time" + video_id + "-" + target);
    t1.innerHTML = t0.innerHTML
    img.setAttribute('onclick', 'ShowVideo("1", "' + video_id + '" ,"' + t1.innerHTML + '")');
}
window.SnapshotCopy = SnapshotCopy;

async function DatabaseQuery(keyword, key) {
    var retVal = [];

    await fetch('/query', { method: 'GET' })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if ("" != keyword) {
                for (i of data) {
                    switch (key) {
                        case 1:
                            if (i.id >= parseInt(keyword)) { retVal.push(i); }
                            break;
                        case 2:
                            if (i.rank.toUpperCase().indexOf(keyword) > -1) { retVal.push(i); }
                            break;
                        case 3:
                            if (i.name.toUpperCase().indexOf(keyword) > -1) { retVal.push(i); }
                            break;
                        case 4:
                            for (j of i.tag) { if (j.toUpperCase().indexOf(keyword) > -1) { retVal.push(i); break; } }
                            break;
                    }
                }
            }

            if (0 == retVal.length) {
                retVal = data;
            }
        });
    return retVal;
}
window.DatabaseQuery = DatabaseQuery