let NUMS_OF_SNAPSHOT = 0;
let DataQuery = [];
let DataQueuePtr = 0;
let CurrentSortingState = [0, 0, 0, 0]
let CurrentViewMode = 100;
let CurrentVideoID = "000000";
let CurrentSnapID = "00";
let CurrentHighlight = "";
let isMobile = false;

const DATA_QUEUE_SIZE = 10;
const ICON_NOTFOUND = "data:image/svg+xml,%3Csvg width='320' height='180' viewBox='0 0 320 180' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3Cpath d='M152.88,118.162c-0.049,-1.758 -0.073,-3.077 -0.073,-3.956c0,-5.175 0.732,-9.643 2.197,-13.403c1.075,-2.832 2.808,-5.688 5.201,-8.569c1.757,-2.1 4.919,-5.164 9.484,-9.192c4.566,-4.028 7.532,-7.239 8.899,-9.631c1.368,-2.393 2.051,-5.005 2.051,-7.837c0,-5.127 -2.002,-9.632 -6.006,-13.514c-4.004,-3.881 -8.911,-5.822 -14.721,-5.822c-5.616,-0 -10.303,1.758 -14.063,5.273c-3.76,3.516 -6.226,9.009 -7.397,16.48l-13.55,-1.612c1.221,-10.009 4.846,-17.675 10.876,-22.998c6.031,-5.322 14.002,-7.983 23.914,-7.983c10.498,-0 18.872,2.856 25.122,8.569c6.25,5.713 9.375,12.622 9.375,20.728c-0,4.687 -1.099,9.009 -3.296,12.964c-2.197,3.955 -6.494,8.764 -12.891,14.428c-4.296,3.809 -7.104,6.617 -8.422,8.423c-1.319,1.807 -2.295,3.882 -2.93,6.226c-0.635,2.344 -1.001,6.152 -1.099,11.426l-12.671,-0Zm-0.805,26.44l-0,-15.015l15.014,0l0,15.015l-15.014,0Z' style='fill:%23737373;fill-rule:nonzero;'/%3E%3C/svg%3E"

const ICON_EMPTY = "data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 320 180' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3C/svg%3E"

function VideoSeekStep(MonitorIDIn, step) {
    if (1 == MonitorIDIn) {
        let VideoController = document.getElementById("VideoController");
    } else {
        let VideoController = document.getElementById("VideoController2");
    }
    VideoController.currentTime += step
}
window.VideoSeekStep = VideoSeekStep;

function VideoSpeed(MonitorIDIn, speed) {
    if (1 == MonitorIDIn) {
        let VideoController = document.getElementById("VideoController");
    } else {
        let VideoController = document.getElementById("VideoController2");
    }
    VideoController.playbackRate = parseFloat(speed);
}
window.VideoSpeed = VideoSpeed;

function GetNameItem(NameIn) {
    return '<a href="/?name=' + NameIn + '" target="_blank">' + NameIn + '</a>'
}

function GetTagItem(TagIn) {
    return '<a href="/?tag=' + TagIn + '" target="_blank">' + TagIn + '</a>' + ','
}


function GetVideoItem(i) {
    let retVal = ""
    let t = "";
    if (i) {
        retVal += '<div class="VideoItem" id="row' + i['id'] + '" data-id="' + i['id'] + '">'
        retVal += '<div class="TdID" id="TdID' + i['id'] + '">'
        retVal += '<input class="CueButton1" id="cue' + i['id'] + '" type="button" value="Q" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Play video on Monitor#1\')" onclick="ShowVideo(this, 1, \'' + i['id'] + '\', \'0.0\')"" />'
        //retVal += '<input class="CueButton2" id="cue' + i['id'] + '" type="button" value="2" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Play video on Monitor#2\')" onclick="ShowVideo(this, 2, \'' + i['id'] + '\', \'0.0\')"" />'
        retVal += '<input class="DelButton" id="del' + i['id'] + '" type="button" value="D" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Delete video\')" onclick="VideoDeleteButtonHandler(\'' + i['id'] + '\');" />'
        retVal += '<input class="ListViewPickButton" id="pick' + i['id'] + '" type="button" value="P" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Move to pick folder\')" onclick="VideoPick(\'' + i['id'] + '\')" />'
        retVal += '</div>'
        retVal += '<div class="TdName" id="TdName' + i['id'] + '">'
        retVal += i['id'] + "<br>"
        retVal += i["rank"] + "<br>"

        retVal += GetNameItem(i['name'])
        retVal += '</div>'
        retVal += '<div class="TdTag" id="TdTag' + i['id'] + '">'

        for (tag of i['tag']) {
            retVal += GetTagItem(tag);
        }

        retVal += '</div>'

        for (const j of Array(NUMS_OF_SNAPSHOT).keys()) {
            if (i.hasOwnProperty('snap')) {
                if (typeof (i['snap'][j]) == "string") {
                    i['snap'][j] = parseFloat(i['snap'][j]);
                }

                if (0.0 != i['snap'][j])
                    t = i['snap'][j].toFixed(3).toString();
                else
                    t = "";
            }
            let DataId = i['id'] + '-' + j.toString().padStart(2, '0');
            let snap_id = j.toString().padStart(2, '0');
            retVal += '<div class="SnapshotContainer" id="snapshotcontainer' + DataId + '" data-id="' + DataId + '" onmouseenter="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',1)" onmouseleave="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',0)">'
            retVal += '<img class="Snapshot" data-id="' + DataId + '" id="img' + DataId + '" alt="" draggable="true" ondragstart="event.dataTransfer.setData(\'text/plain\',null)" src="thumbnail/' + i['id'] + "/" + snap_id + '/"  onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Click: GOTO, Drag&Drop: COPY\')" onclick="ShowVideo(this, 1, \'' + i['id'] + '\', ' + t + ')" onerror="SnapshotEmptyHandler(this)"></img>'

            retVal += '<div class=timecode id="time' + DataId + '">' + t + '</div>'
            retVal += '</div>'
        }
        retVal += '</div>'
    }
    return retVal;
}

function InfiniteScrollHandler() {
    /* List view only */
    if ((CurrentViewMode != 100) || (true == isMobile))
        return;


    ContentPanel = document.getElementById("ContentPanel");
    for (let i = 1; i <= DATA_QUEUE_SIZE; i++) {
        try {
            ContentPanel.insertAdjacentHTML('beforeend', GetVideoItem(DataQuery[DataQueuePtr + 1]))
            //ContentPanel.removeChild(ContentPanel.childNodes[0]);
            DataQueuePtr = DataQueuePtr + 1;
        } catch (e) {
            console.log("Out of boundary")
        }
    }

}
window.InfiniteScrollHandler = InfiniteScrollHandler

async function ShowListView(Start, End) {
    let retVal = "";

    if (End > DataQuery.length)
        End = DataQuery.length

    for (let i = Start; i <= End; i++) {
        retVal += GetVideoItem(DataQuery[i]);
    }

    let el = document.getElementById("ContentPanel");
    if (null != el)
        el.innerHTML = retVal;

    document.getElementById("SnapshotButton").style.visibility = "hidden";

}

async function ShowGridView(snap_id) {
    let retVal = "";
    CurrentSnapID = snap_id;

    for (i of DataQuery) {
        let DataId = i['id'] + '-' + snap_id;
        if (i.hasOwnProperty('snap')) {
            if (typeof (i['snap'][parseInt(snap_id)]) == "string") {
                i['snap'][parseInt(snap_id)] = parseFloat(i['snap'][parseInt(snap_id)]);
            }
            t = i['snap'][parseInt(snap_id)].toFixed(3).toString();

        } else {
            t = "0.000";

        }

        retVal += '<div class="SnapshotContainer" id="snapshotcontainer' + DataId + '" data-id="' + DataId + '" onmouseenter="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',1)" onmouseleave="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',0)">'
        retVal += '<img class="Snapshot" data-id="' + DataId + '" id="img' + DataId + '" id="img' + DataId + '" alt=""  src="thumbnail/' + i['id'] + "/" + snap_id + '/"  onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Click: GOTO, Drag&Drop: COPY\')" onclick="ShowVideo(this, 1, \'' + i['id'] + '\', ' + t + ')" onerror="SnapshotEmptyHandler(this)"></img>'
        retVal += '<div class=timecode id="time' + DataId + '">' + i['name'] + '</div>'
        retVal += '</div>'
    }

    let el = document.getElementById("ContentPanel");
    if (null != el)
        el.innerHTML = retVal;

    document.getElementById("SnapshotButton").style.visibility = "visible";

}

async function ShowNameView(snap_id) {
    let retVal = "";
    let LastName = "";
    CurrentSnapID = snap_id;

    for (i of DataQuery) {
        if (LastName == i['name'])
            continue;

        let DataId = i['id'] + '-' + snap_id;
        if (i.hasOwnProperty('snap')) {
            if (typeof (i['snap'][parseInt(snap_id)]) == "string") {
                i['snap'][parseInt(snap_id)] = parseFloat(i['snap'][parseInt(snap_id)]);
            }
            t = i['snap'][parseInt(snap_id)].toFixed(3).toString();

        } else {
            t = "0.000";

        }

        retVal += '<div class="SnapshotContainer" id="snapshotcontainer' + DataId + '" data-id="' + DataId + '" onmouseenter="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',1)" onmouseleave="ShowToolbox(\'' + i['id'] + '\', \'' + snap_id + '\',0)">'
        retVal += '<img class="Snapshot" data-id="' + DataId + '" id="img' + DataId + '" id="img' + DataId + '" alt=""  src="thumbnail/' + i['id'] + "/" + snap_id + '/"  onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Click: GOTO, Drag&Drop: COPY\')" onclick="ShowVideo(this, 1, \'' + i['id'] + '\', ' + t + ')" onerror="SnapshotEmptyHandler(this)"></img>'
        retVal += '<div class=timecode id="time' + DataId + '"><a href="/?name=' + i['name'] + '" target="_blank">' + i['name'] + '</a></div>'
        retVal += '</div>'

        LastName = i['name'];
    }

    let el = document.getElementById("ContentPanel");
    if (null != el)
        el.innerHTML = retVal;

    document.getElementById("SnapshotButton").style.visibility = "visible";

}

function ShowToolbox(VideoIDIn, SnapIDIn, Enable) {
    if (true == isMobile) {
        return;
    }

    let DataID = VideoIDIn + '-' + SnapIDIn;
    let container = document.getElementById("snapshotcontainer" + DataID);
    if (1 == Enable) {
        retVal = ""
        retVal += '<input class="SnapButton" id="SnapshotButton' + DataID + '" type="button" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Update snapshot\')" value="S" onclick="Snapshot(\'' + VideoIDIn + '\',' + SnapIDIn + ')">'
        retVal += '<input class="SnapDeleteButton" id="snapdel' + DataID + '" type="button" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Update snapshot\')" value="D" onclick="SnapshotDelete(\'' + VideoIDIn + '\',' + SnapIDIn + ')">'
        retVal += '<input class="SnapCropButton" id="snapcrop' + DataID + '" type="button" onmouseleave="ShowInfo(\'\')" onmousemove="ShowInfo(\'Crop snapshot\')" value="C" onclick="SnapshotCropperHandler(\'' + VideoIDIn + '\',' + SnapIDIn + ', 1)">'
        container.insertAdjacentHTML('beforeend', retVal)
    }
    else {
        container.removeChild(container.childNodes[4]);
        container.removeChild(container.childNodes[3]);
        container.removeChild(container.childNodes[2]);
    }
}
window.ShowToolbox = ShowToolbox;

function ShowVideo(e, monitor_id, video_id, time) {

    if (false === isMobile)
        document.getElementById("ControlPanel").style.display = "block";

    if ("" != CurrentHighlight) {
        el = document.getElementById(CurrentHighlight);
        if (el)
            el.style.borderColor = "#858585";
        CurrentHighlight = "";
    }

    if (e.dataset.id) {
        el = document.getElementById("img" + e.dataset.id);
        if (el)
            el.style.borderColor = "#007ACC";
        CurrentHighlight = "img" + e.dataset.id
    }

    let id = video_id.toString().padStart(6, '0')

    let RankInput = document.getElementById("RankInput");
    let NameInput = document.getElementById("NameInput");
    let TagInput = document.getElementById("TagInput");
    let VideoController;
    if (monitor_id == 1) {
        VideoController = document.getElementById("VideoController");
        fetch('/json/' + id, { method: 'GET' })
            .then(function (response) {
                return response.json();
            })
            .then(function (JSONData) {
                RankInput.value = JSONData['rank'];
                NameInput.value = JSONData['name'];
                TagInput.value = JSONData['tag'];
            });

        if (CurrentVideoID != "000000") {
            CurrentRow = document.getElementById("row" + CurrentVideoID);
            if (null != CurrentRow) {
                CurrentRow.style.backgroundColor = "rgb(30,30,30)";
            }
        }

        TargetRow = document.getElementById("row" + video_id);
        if (null != TargetRow)
            TargetRow.style.backgroundColor = "rgb(51,51,51)";

        CurrentVideoID = video_id;
    } else {
        VideoController = document.getElementById("VideoController2");
    }

    VideoController.src = "/video/" + video_id.toString().padStart(6, '0') + '#t=' + time;
    VideoController.play();
}
window.ShowVideo = ShowVideo;

/* Information tag */
function ShowInfo(message) {
    // if (isMobile === false) {
    //     Info = document.getElementById("Info");

    //     if (message == "") {
    //         Info.style.display = "none";
    //     }
    //     else {

    //         if (PageY != null) { Info.style.top = PageY + 15; }
    //         if (PageX != null) { Info.style.left = PageX + 15; }
    //         Info.innerHTML = message
    //         Info.style.display = "block";
    //     }
    // }
}
window.ShowInfo = ShowInfo

function SnapshotCropperHandler(VideoIDIn, SnapIDIn, OperationIn) {
    let CropPanel = document.getElementById('CropPanel');
    switch (OperationIn) {
        case 0:
            SnapshotCropSave();
            CropPanel.style.display = "none"
            break;
        case 1:
            SnapshotCrop(VideoIDIn, SnapIDIn);
            CropPanel.style.display = "block"
            break;

        default:
            break;
    }
}
window.SnapshotCropperHandler = SnapshotCropperHandler

function SnapshotEmptyHandler(e) {
    e.src = ICON_EMPTY;
}
window.SnapshotEmptyHandler = SnapshotEmptyHandler;

function SortButtonHandler(id) {
    for (let i = 0; i < CurrentSortingState.length; i++) {
        button = document.getElementById("SortButton" + i.toString());
        if (i == id) {
            if ((CurrentSortingState[id] == 0) || (CurrentSortingState[id] == -1)) {
                CurrentSortingState[id] = 1
                button.value = "▼";
            } else {
                CurrentSortingState[id] = -1
                button.value = "▲";
            }
        } else {
            button.value = "-";
        }
    }

    DataSort((id + 1) * CurrentSortingState[id]);
    RefreshView(99)
}
window.SortButtonHandler = SortButtonHandler

function SnapshotButtonHandler(video_id, snap_id) {
    if ((video_id === '') || (snap_id === '')) {
        Snapshot(CurrentVideoID, CurrentSnapID)
    } else {
        let id = video_id.toString().padStart(6, '0')
        /* Snapshot for current video only */
        if (id != CurrentVideoID) {
            return;
        }
        Snapshot(video_id, snap_id)
    }

}
window.SnapshotButtonHandler = SnapshotButtonHandler

function VideoPickButtonHandler(VideoIDIn) {
    if ('' === VideoIDIn) {
        VideoPick(CurrentVideoID)
    } else {
        VideoPick(VideoIDIn)
    }
}
window.VideoPickButtonHandler = VideoPickButtonHandler

function VideoDeleteButtonHandler(VideoIDIn) {
    if ('' === VideoIDIn) {
        VideoDelete(CurrentVideoID)
    } else {
        VideoDelete(VideoIDIn)
    }
}
window.VideoDeleteButtonHandler = VideoDeleteButtonHandler

function MetadataSaveButtonHandler(VideoIDIn) {
    let html = '';
    MetadataSave(CurrentVideoID)

    TdName = document.getElementById("TdName" + CurrentVideoID)
    if (TdName)
        TdName.innerHTML = CurrentVideoID + '<br>' + RankInput.value + '<br>' + GetNameItem(NameInput.value)

    for (tag of TagInput.value.split(',')) {
        html += GetTagItem(tag);
    }

    TdTag = document.getElementById("TdTag" + CurrentVideoID)
    if (TdTag) {
        TdTag.innerHTML = html
    }
    if (100 != CurrentViewMode) {
        console.log("Update label")
        let Label = document.getElementById("time" + CurrentVideoID + '-' + CurrentSnapID);
        let NameInput = document.getElementById("NameInput");
        Label.innerHTML = NameInput.value;
    }

}
window.MetadataSaveButtonHandler = MetadataSaveButtonHandler

function RefreshView(mode) {
    tmp = parseInt(mode);
    switch (tmp) {
        case 99:
            RefreshView(CurrentViewMode)
            break;
        case 100:
            ShowListView(0, DATA_QUEUE_SIZE);
            DataQueuePtr = DATA_QUEUE_SIZE;
            CurrentViewMode = mode;
            break;
        case 11:
            DataSort(3);
            ShowNameView('00');
            CurrentViewMode = mode;
            break;
        default:
            ShowGridView(tmp.toString().padStart(2, '0'));
            CurrentViewMode = mode;
            break;
    }

}
window.RefreshView = RefreshView;

async function Query(keyword, key) {
    DataQuery = await DatabaseQuery(keyword.toUpperCase(), key)
    RefreshView(99)
}
window.Query = Query

function DataSort(key) {
    switch (key) {
        case 1:
            DataQuery.sort((a, b) => { return a['id'].localeCompare(b['id']) });
            break;
        case -1:
            DataQuery.sort((a, b) => { return -a['id'].localeCompare(b['id']) });
            break;
        case 2:
            DataQuery.sort((a, b) => { return a['rank'].localeCompare(b['rank']) });
            break;
        case -2:
            DataQuery.sort((a, b) => { return -a['rank'].localeCompare(b['rank']) });
            break;
        case 3:
            DataQuery.sort((a, b) => { return a['name'].localeCompare(b['name']) });
            break;
        case -3:
            DataQuery.sort((a, b) => { return -a['name'].localeCompare(b['name']) });
            break;
        default:
            break;
    }
}
window.DataSort = DataSort

async function main() {
    await fetch('/settings', { method: 'GET' })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            NUMS_OF_SNAPSHOT = parseInt(data["nums_of_snapshot"]);
            let retVal = "";

            for (const i of Array(NUMS_OF_SNAPSHOT).keys()) {
                retVal += '<input class="RoundButton" type="button" value="' + i + '" onmousemove="ShowInfo(\'Grid view\')" onclick="RefreshView(this.value)"/>'
            }
            document.getElementById("SearchBar").insertAdjacentHTML('beforeend', retVal)


            /* Query by URL parameters */
            let urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('id')) {
                Query(urlParams.get('id'), 1);
            } else if (urlParams.has('rank')) {
                Query(urlParams.get('rank'), 2);
            } else if (urlParams.has('name')) {
                Query(urlParams.get('name'), 3);
            } else if (urlParams.has('tag')) {
                Query(urlParams.get('tag'), 4);
            } else {
                Query("", 0);
            }

            /* Adjust layout for Mobile/Desktop */
            try {
                document.createEvent("TouchEvent");
                document.getElementById("VideoController").controls = "true";
                document.getElementById("SearchBar").style.top = document.getElementById("VideoController").clientHeight;
                document.getElementById("SearchBar").style.display = "block";
                isMobile = true;
                RefreshView(0);

            }
            catch (e) {
                document.getElementById("Seekbar").style.display = "block";
                document.getElementById("SearchBar").style.display = "block";
                document.getElementById("ListViewButton").style.display = "inline";
                isMobile = false;
                RefreshView(100);
            }
        });

}

main();