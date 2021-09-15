/* Hotkeys handling */
// var KeyProcessed = false;

// function KeyUpListener(event) {
//     console.log("KeyProcessed = false")
//     KeyProcessed = false;
// }

// function KeyDownListener(event) {
//     if (event.metaKey && event.keyCode == 80) {
//         event.preventDefault();
//         if (true === KeyProcessed) {
//             return;
//         }

//         var VideoController = document.getElementById("VideoController");
//         if (VideoController.paused) { VideoController.play(); } else { VideoController.pause(); }


//         KeyProcessed = true
//     }
// }

// document.addEventListener('keydown', KeyDownListener, false);
// document.addEventListener('keyup', KeyUpListener, false);


/* Mouse Event handling */
let DragItem;

document.addEventListener('mousemove', e => {
    PageX = e.pageX
    PageY = e.pageY
});

document.addEventListener("dragstart", function (event) {
    DragItem = event.target;
    event.target.style.opacity = 0.5;
}, false);

document.addEventListener("dragend", function (event) {
    event.target.style.opacity = "";
}, false);

document.addEventListener("dragover", function (event) {
    event.preventDefault();
}, false);

document.addEventListener("dragenter", function (event) {
    if (event.target.className == "Snapshot") {
        event.target.style.background = "blue";
    }

}, false);

document.addEventListener("dragleave", function (event) {
    if (event.target.className == "Snapshot") {
        event.target.style.background = "";
    }

}, false);

document.addEventListener("drop", function (event) {
    event.preventDefault();

    if ((event.target.className == "Snapshot") || (event.target.className == "SnapshotContainer")) {
        event.target.style.background = "";

        re = /^(\d{6})\-(\d{2})/
        checkStr0 = DragItem.dataset.id.match(re);
        if (checkStr0 != null) {
            video_id0 = checkStr0[1]
            source_snap = checkStr0[2]
        }

        re = /^(\d{6})\-(\d{2})/
        checkStr1 = event.target.dataset.id.match(re);
        if (checkStr1 != null) {
            video_id1 = checkStr1[1]
            target_snap = checkStr1[2]
        }

        if (video_id0 === video_id1) {
            SnapshotCopy(video_id0, source_snap, target_snap);
        }

    }

}, false);

/* Seekbar functions */

let onTrack = false;
let SeekBar = document.getElementById("Seekbar");
let isPaused = false;

SeekBar.addEventListener("click", VideoProgressOnClick);

SeekBar.addEventListener("mousedown", function () {
    var vid = document.getElementById("VideoController");
    isPaused = vid.paused;
    vid.pause()
    document.addEventListener("mousemove", VideoProgressOnClick);
    onTrack = true;
});

document.addEventListener("mouseup", function () {
    if (onTrack) {
        document.removeEventListener("mousemove", VideoProgressOnClick);

        var vid = document.getElementById("VideoController");
        if (isPaused) {
            vid.pause()
        }
        else {
            vid.play()
        }
        onTrack = false;
    }
});

function VideoTimeUpdate() {
    var vid = document.getElementById("VideoController");
    var percentage = (vid.currentTime / vid.duration) * 100;
    progress = document.getElementById("Progress");
    progress.innerHTML = vid.currentTime;
    progress.style.width = percentage + "%"

}
window.VideoTimeUpdate = VideoTimeUpdate

function VideoProgressOnClick(e) {
    if (e.which = "1") {
        e.preventDefault();
        var vid = document.getElementById("VideoController");
        var percentage = (PageX / document.body.scrollWidth);
        var vidTime = vid.duration * percentage;
        vid.currentTime = vidTime;
        VideoTimeUpdate()
    }
}
window.VideoProgressOnClick = VideoProgressOnClick


/* Video Controller events handling */

function RegisterVideoControllerHandler() {

    var VideoController = document.getElementById("VideoController");

    VideoController.addEventListener("timeupdate", function () {
        VideoTimeUpdate()
    });

    VideoController.addEventListener("play", function () {
        var PlayButton = document.getElementById("PlayButton");
        PlayButton.value = "Pause";
    });

    VideoController.addEventListener("pause", function () {
        var PlayButton = document.getElementById("PlayButton");
        PlayButton.value = "Play";
    });

    VideoController.addEventListener("volumechange", function (e) {
        var btn = document.getElementById("MuteButton");
        if (e.target.muted)
            btn.value = "Unmute";
        else
            btn.value = "Mute";
    });

    VideoController.addEventListener("click", function (e) {

        if (e.target.paused == true) {
            e.target.play()
        } else {
            e.target.pause()
        }
    });

    /* Video Controller keys event handling */
    function Play(e) {
        var vid = document.getElementById("VideoController");
        var btn = document.getElementById("PlayButton");
        if (vid.paused) {
            vid.play();
        } else {
            vid.pause();
        }
    }
    window.Play = Play

    function Volume(direction) {
        console.log(direction)
        var vid = document.getElementById("VideoController");

        if ("1" == direction) {
            vol = vid.volume + 0.2;
        } else {
            vol = vid.volume - 0.2;
        }

        if (vol > 1)
            vol = 1
        else if (vol < 0)
            vol = 0

        console.log(vol)
        vid.volume = vol;

    }
    window.Volume = Volume

    function Mute() {
        var vid = document.getElementById("VideoController");
        if (true == vid.muted)
            vid.muted = false;
        else
            vid.muted = true

    }
    window.Mute = Mute
}


/* Register VideoControllerHandler for Desktop only */
try { document.createEvent("TouchEvent"); } catch (e) { RegisterVideoControllerHandler(); }

/* Scroll events handling */
function ScrollHandler(e) {
    if (e.target.body.clientHeight + e.target.body.scrollTop > e.target.body.scrollHeight * 0.7)
        InfiniteScrollHandler();
}
document.addEventListener("scroll", ScrollHandler);


VideoController.onloadeddata = (function (event) {
    const {
        videoHeight,
        videoWidth,
        duration
    } = event.srcElement
    console.log(videoWidth, videoHeight, duration)
    MediaInfo = document.getElementById("MediaInfo");
    MediaInfo.innerHTML = videoWidth + ', ' + videoHeight + ', ' + duration
})