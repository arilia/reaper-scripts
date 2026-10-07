class Beat {
    bar = null
    number = 1;
    div = null;

    constructor(bar) {
        this.bar = bar;
    }

    set playing(val) {
        if (val) {
            this.div.classList.add('beat_playing');
        } else {
            this.div.classList.remove('beat_playing');
        }
    }

    render() {
        this.div = document.createElement('div');
        this.div.classList.add('beat');
        this.div.id = this.bar.number + "." + this.number;
        this.bar.div.append(this.div);
    }
}



class Bar {
    song = null;
    row = null;
    div = null;
    beats = [];
    chords = [];
    number = 1;
    beatDuration = 4;
    startTime = 0;
    endTime = 0;
    isPlaying = false;

    constructor(b) {
        this.number = b.number;
        this.song = null;
        this.startTime = roundTime(b.startTime);
        this.endTime = roundTime(b.endTime);
        this.beatDuration = b.numOfBeats;
        this.createBeats();
    }

    createBeats() {
        this.beats = [];
        for (let b = 1; b <= this.beatDuration; b++)
        {
            const beat = new Beat(this);
            beat.number = b;
            this.beats.push(beat);
        }
    }

    set playing(val) {
        if (val) {
            this.div.classList.add('playing');
        } else {
            this.div.classList.remove('playing');
        }
        if (val && !this.isPlaying) {

            
//            const targetPosition = this.song.targetPosition;
            const rowBox = document.getElementById('position_row_chords').getBoundingClientRect();
            const targetPosition = rowBox.top + rowBox.height / 2;
            const positionInfo = this.div.getBoundingClientRect();
            const top = positionInfo.top + positionInfo.height / 2;
//            this.song.translate(targetPosition - top);
            this.song.viewManager.chordsView.translate(targetPosition - top);
//            console.log(top);
        }
        this.isPlaying = val;
    }

    checkPlaying(position) {
        this.playing = (position >= this.startTime && position < this.endTime);
    }

    get width() {
        const left = this.beats[0].div.getBoundingClientRect().left;
        const right = this.beats[this.beats.length - 1].div.getBoundingClientRect().right;
        const width = right - left;
        return width;
    }

    render() {
        this.div = document.createElement('div');
        this.div.classList.add('bar');
        this.div.style.setProperty("--beats", this.beats.length);
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('time');
        timeDiv.textContent  = this.number;
        this.div.appendChild(timeDiv);
        if(this.row.div) this.row.div.append(this.div); else console.log(this);
        for (let beat of this.beats)
        {
            beat.render();
        }
    }
}

class Row {
    bars = [];
    div = null;
    type = "";
    song = "";
    table = "";
    number = 0;
    elements = [];
    static MARKER = "marker";
    static LYRICS_MARKER = "lyrics_marker";
    static CHORDS = "chord";
    static LYRICS = "lyric";

    append(element)
    {
        this.elements.push(element);
        element.row = this;
    }

    constructor(song, type = Row.CHORDS) {
        this.type = type;
        this.song = song;
        this.number = song.rows.length + 1;
    }

    render() {
        this.div = document.createElement("div");
        switch(this.type) {
            case Row.CHORDS :
                this.div.classList.add('bar_row');
                break;
            case Row.LYRICS:
                this.div.classList.add('lyric_row');
                break;
            case Row.MARKER:
                this.div.classList.add('marker_row');
                break;
            case Row.LYRICS_MARKER:
                this.div.classList.add('lyric_marker_row');
                break;
        }
        this.div.id = "row_" + this.number;
        for (const element of this.elements) {
            if(element !== undefined) {
                element.render();
            }
        }
        this.song.viewManager.getTable().append(this.div);
    }
}


class Marker {
    text = "";
    index = 0;
    barNumber = 1;
    position = 0;
    color = '';
    duration = 0;
    div = null;
    clockDiv = null;
    row = null;

    constructor(m) {
        this.index = m.index;
        this.text = m.text;
        this.color = m.color;
        this.barNumber = m.barNumber;
        this.position = roundTime(m.position);
    }
    
    render() {
        this.div = document.createElement("div");
        this.div.id = "marker_" + this.index;
        this.div.textContent  = this.text;
        this.div.classList.add('marker');
        this.div.style.border = "1px solid rgb(" + this.color + ")";
        this.div.style.background = "rgba(" + this.color + ", .3)";
        if(this.row && this.row.div) this.row.div.append(this.div);
        
    }
    
    
    renderForClock() {
        if(this.clockDiv) return this.clockDiv;
        const progressDiv = document.createElement("div");
        progressDiv.id = "marker_" + this.index + "_progress";
        progressDiv.classList.add('marker_progress');
        progressDiv.style.background = "rgba(" + this.color + ", .8)";
        this.clockDiv = document.createElement("div");
        this.clockDiv.id = "clock_marker_" + this.index;
        this.clockDiv.textContent  = this.text;
        this.clockDiv.classList.add('marker');
//        this.clockDiv.style.border = "1px solid rgb(" + this.color + ")";
//        this.clockDiv.style.background = "rgba(" + this.color + ", .3)";
        this.clockDiv.style.color = "rgba(" + this.color + ", 1)";
        this.clockDiv.style.border = "0px"; 
        this.clockDiv.style.background = "transparent";
        this.clockDiv.append(progressDiv);
        return this.clockDiv;
        
    }
    
    isOver(position) {
        if(position >= this.position) {
            return true;
        }
    }
    
}

class Chord {
    name = "C";
    beatDuration = 4;
    bar = null;
    barNumber = 1;
    beatStart = 1; //beat inside the bar
    startTime;  //in seconds
    endTime; //in seconds
    duration; //in seconds
    isPlaying = false;
    div = null;
    song = null;
    nextChord = null;

    constructor(c) {
        this.startTime = roundTime(c.startTime);
        this.endTime = roundTime(c.endTime);
        this.barNumber = c.barNumber;
        this.beatStart = c.beatStart;
        this.beatDuration = c.beatDuration;
        this.name = c.text;
        this.formattedName = this.formatChord(c.text);
    }


    formatChord(chordString) {
        const notes = ["A", "B", "C", "D", "E", "F", "G", "A", "B"];
        let root = chordString.substring(0,1);
        if(notes.indexOf(root) === -1) { 
            return chordString;
        }
        let index = 1;
        let accidental = "";
        let quality = "";
        
        if(chordString[1] === "♯" || chordString[1] === "#") {
            accidental = "♯" ;
            index++;
        } else if(chordString[1] === "b" || chordString[1] === "♭" ) {
            accidental = "♭" ;
            index++;
        }
        
        const qualities = ["maj", "min", "sus", "add", "dim", "aug", "m"];

        for (const q of qualities) {
            if (chordString.startsWith(q, index)) {
                quality = q;
                index += q.length;
                break;
            }
        }
        let modifiers = chordString.substring(index);
        let bassIndex = modifiers.indexOf("/");
        let bass = "";
        if(bassIndex !== -1)
        {
            const note = modifiers.substring(bassIndex+1,bassIndex+2);
            if(notes.indexOf(note) !== -1)
            {
                bass = modifiers.substring(bassIndex);
                modifiers = modifiers.substring(0, bassIndex);
            }
        }
        let chordJson = {
            root: root,
            accidental: accidental,
            quality: quality,
            modifiers: modifiers,
            bass: bass
        };
        return  root + accidental + quality + "<sup>" + modifiers + "</sup><sub>" + bass + "</sub>" ;
    }
    
    set playing(val) {
        if(val === this.isPlaying) return;
        if (this.div !== null) {
            this.div.classList.toggle('chord_playing', val);
        }
        this.isPlaying = val;
    }

    checkPlaying(position) {

        if (position >= this.startTime && position < this.endTime) {
            this.playing = true;
        } else {
            this.playing = false;
        }
        return this.isPlaying;
    }

    render()
    {
        this.div = document.createElement('div');
        this.div.classList.add('chord');
        if(song.decoratedChords)
        {
            this.div.innerHTML  = this.formattedName;
        } else {
            this.div.textContent = this.name;
        }
        this.div.style.left = Number((this.beatStart - 1) * this.bar.width / this.bar.beats.length) + "px";
        this.div.style.width = Number(this.beatDuration * this.bar.width / this.bar.beats.length) - 4 + "px";
        this.bar.div.append(this.div);
    }
}




class Lyric {
    text = "Lyrics";
    startTime;  //in seconds
    endTime; //in seconds
    duration; //in seconds
    isPlaying = false;
    height = 0;
    top =0;
    div = null;
    song = null;
    row = null;
    nextLyric = null;

    constructor(c) {
        this.startTime = roundTime(c.startTime);
        this.endTime = roundTime(c.endTime);
        this.duration = this.endTime - this.startTime;
        this.text = c.text;
    }   

    set playing(val) {
        
        if (val) {
            this.div.classList.add('lyric_playing');
        } else {
            this.div.classList.remove('lyric_playing');
        }
        if (val) {
            this.calculateHeight();
            const rowBox = document.getElementById('position_row_lyrics').getBoundingClientRect();
            const targetPosition = rowBox.top + rowBox.height / 2;
            
            const progress = this.height * (this.song.calculatedPosition - this.startTime) / this.duration;

//            this.song.moveTo(targetPosition - this.top - progress);
            this.song.viewManager.lyricsView.moveTo(targetPosition - this.top - progress);
        }
        this.isPlaying = val;

    }

    render()
    {
        this.div = document.createElement('div');
        this.div.classList.add('lyric');
        this.div.textContent  = this.text;
        if (this.isPlaying)
        {
            this.div.classList.add('playing');
        }
        this.row.div.append(this.div);
       
    }

    calculateHeight()
    {
        const positionInfo = this.div.getBoundingClientRect();
        this.top = positionInfo.top;// + positionInfo.height/2;
        if (this.nextLyric) {
            const nextLyricPositionInfo = this.nextLyric.div.getBoundingClientRect();
            this.height = nextLyricPositionInfo.top - positionInfo.top;
        } else {
            this.height = positionInfo.height;
        }
    }

    checkPlaying(position) {
        if (position >= this.startTime && position < this.endTime) {
            this.playing = true;
            

        } else {
            this.playing = false;

        }
        return this.isPlaying;
    }
    
    checkPlayingChords(position) {
        
        if (position >= this.startTime && position < this.endTime) {
            const lyrics_banner = document.getElementById("lyrics_banner");
            lyrics_banner.textContent = this.text;
            return true;
        } 
        return false;
    }
    
}

class Song {
    id = "";
    table = null; //TODO, move in View?
    lastInsertedLyric = null;
    bars = [];
    chords = [];
    lyrics = [];
    rows = [];
    markers = [];
    networkBuf = [];
    paintBuf = [];
    songReady = false; // stays false while a song rebuild is pending so the old song is never briefly shown before the new one is ready
    json = "";
    maxBeats = 16; 
    barsPerRow = 4;
    internalChordsOffset = 0;
    internallyricsOffset = 0;
    networkOffset = 0;
    paintOffset = 0;
    lastRecordedPosition = 0;
    lastRecordedTime = 0;
    calculatedPosition = 0;
    playState = -1;
    lastPlayState = -1;
    viewManager = null;
    globalOffset = 0;
    version = -1;
    timestamp = -1;
    length = 0;
    type = 'lyrics';
    project = "Song";
    complete = false;
    lock = true;
    instantPositioning = false;
    lastTimestamp = null;
    targetPosition = null;
    loaderDiv = null;
    playStateDiv = null;
    playingChord = null;
    chordsStyle =  "EN"; //TODO Move to ChordsView   
    decoratedChords = true; //TODO Move to ChordsView  
    bpm = 0;
    lastClockTime = ""; //TODO Move to ClockView 
    static LYRICSDELTA = 0.5;
    static STATUSPOLLING = 2000;
    static DEFAULT_BARS_PER_ROW = 4;
    static DEFAULT_DECORATED_CHORDS = true;
    static DEFAULT_CHORDS_STYLE = "EN";
    static DEFAULT_TYPE = "chords";

    constructor(type) {
        this.type = type;
        wwr_req_recur("TRANSPORT;GET/EXTSTATE/reachords/status", Song.STATUSPOLLING); //Get a JSON string containing the transport and the state of the project . If something changes it rebuild the Song
        setInterval(this.calculatePosition.bind(this), 50);
        this.loaderDiv = document.getElementById('loader');
        this.playStateDiv = document.getElementById('play_state');
        this.clockDiv = document.getElementById('clock_div'); 
    }

    play() {
        if(this.lock) return;
        wwr_req("1007;TRANSPORT");
    }
    
    pause() {
        if(this.lock) return;
        wwr_req("1008;TRANSPORT");
    }
    
    stop() {
        if(this.lock) return;
        wwr_req("1016;TRANSPORT");
    }
    
    forward() {
        if(this.lock) return;
        wwr_req("1016;40861;40042;TRANSPORT;GET/EXTSTATE/reachords/status");
    }
    
    rewind() {
        if(this.lock) return;
        if(this.playState === 0 && this.lastRecordedPosition === 0)
        {
            wwr_req("1016;40862;40042;TRANSPORT;GET/EXTSTATE/reachords/status");
        }
        else
        {
            wwr_req("1016;40042;TRANSPORT");
        }
        
    }
    
    prevBar() {
        if(this.lock) return;
        wwr_req("1016;41043;TRANSPORT");
    }
    
    saveProjectSettings() {
        this.settings = {
            common: {
                decoratedChords: this.decoratedChords,
                chordsStyle: this.chordsStyle,
                type: this.type
            }
        };

        this.settings[this.id] = {
            barsPerRow: this.barsPerRow
        };
        const stored = JSON.parse(localStorage.getItem("reachords")) || {};
        let settings = { ...stored };

        settings.common = {
            ...stored.common,
            ...this.settings.common
        };

        settings[this.id] = {
            ...stored[this.id],
            ...this.settings[this.id]
        };

        localStorage.setItem(
            "reachords",
            JSON.stringify(settings)
        );
        this.settings = settings;
    }
    
    loadProjectSettings() {
        let settings = {
            common: {
                decoratedChords: Song.DEFAULT_DECORATED_CHORDS,
                chordsStyle: Song.DEFAULT_CHORDS_STYLE,
                type: Song.DEFAULT_TYPE
            },
            [this.id]: {
                barsPerRow: Song.DEFAULT_BARS_PER_ROW
            }
        };
        
        const stored = JSON.parse(localStorage.getItem("reachords"));
        if(stored)
        {
            settings.common = stored.common ? stored.common  : settings.common;
            settings[this.id] = stored[this.id] ? stored[this.id] : settings[this.id];
        }
        this.barsPerRow =  settings[this.id].barsPerRow;
        this.decoratedChords = settings.common.decoratedChords;
        this.chordsStyle = settings.common.chordsStyle;
        this.type = settings.common.type;
        this.settings = settings;
    }
    
    set chordsOffset(val) {
        this.internalChordsOffset = val;
    }
    
    get chordsOffset() {
        if(this.type === ViewManager.LYRICS || this.playState === 0 || this.playState === 2 || this.playState === 6)
        {
            return 0;
        }
        return this.internalChordsOffset + this.networkOffset + this.paintOffset;
    }
    
    set lyricsOffset(val) {
        this.internallyricsOffset = val;
    }
    
    get lyricsOffset() {
        if(this.type !== ViewManager.LYRICS  || this.playState === 0 || this.playState === 2 || this.playState === 6)
        {
            return 0;
        }
        return this.internallyricsOffset + Song.LYRICSDELTA  + this.networkOffset +  this.paintOffset;
    }
    
    set recordedPosition(position) {
        this.lastRecordedTime = Date.now();
        this.calculatedPosition = position = this.lastRecordedPosition = position + this.chordsOffset + this.lyricsOffset; 
        
    }

    calculatePosition() {
    
        let position = this.lastRecordedPosition;
        if (this.playState === 1) {
            const elapsedTime = Date.now() - this.lastRecordedTime;
            position += elapsedTime / 1000;
            this.calculatedPosition = position;
        }
        if(this.playState !== this.lastPlayState)
        {
            let content ="Stopped";
            let className = "play_state stop";
            switch(this.playState) {
                case 1:
                    content  = "Playing";
                    className  = "play_state play";
                    break;
                case 2:
                    content  = "Paused";
                    className  = "play_state stop";
                    break;
                case 5:
                    content  = "Recording";
                    className  = "play_state rec";
                    break;
                case 6:
                    content  = "Recording Paused";
                    className  = "play_state rec";
                    break;
            }
            this.playStateDiv.textContent = content;
            this.playStateDiv.className = className;
            this.lastPlayState = this.playState;
        }
        position = roundTime(position);
        const t0 = performance.now();
        this.checkPlaying(position);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.calculatePaintDelay(t0);
            
          });
        });
        
        // Skip the animated transition for the very first positioning after a
        // song rebuild. Without this, the page would visibly scroll from the top
        // down to the current playhead position before the user sees it settled.
        this.instantPositioning = false;
        if (this.songReady) {          
            this.hideSong(false);
        }
        
    }

//    translate(val) {
//        this.translateY = val + this.translateY;
//        const tableStyle = this.table.style;
//        if (this.instantPositioning) {
//            tableStyle.willChange = 'none';
//        } else {
//            
//            tableStyle.willChange = 'transform';
//            tableStyle.transition = 'transform 400ms ease';
//        }
//        tableStyle.transform = "translateY(" + this.translateY + "px)";
//    }


//    moveTo(val)
//    {	
//        this.translateY = val + this.translateY;
//        const tableStyle = this.table.style;
//        tableStyle.transform = "translateY(" + this.translateY + "px)";
//    }
    
    
    changeLayout(layoutType) {
        this.type = layoutType;
        this.saveProjectSettings();
        this.repaint();
    }
    
    
    createTable() {
        document.getElementById('change_to_chords').classList.toggle('button_on', this.type === ViewManager.CHORDS );
        document.getElementById('change_to_lyrics').classList.toggle('button_on', this.type === ViewManager.LYRICS );
        document.getElementById('change_to_clock').classList.toggle('button_on', this.type === ViewManager.CLOCK );
        this.instantPositioning = true;
        switch(this.type) {
        case ViewManager.LYRICS :
            this.viewManager.lyricsView.createTable();
            break;
        case ViewManager.CHORDS :
            this.viewManager.chordsView.createTable();
            break;
        
        }
        this.render();
        this.complete = true;
        
    }
 
   
    increaseBars () {
        this.barsPerRow++;
        this.saveProjectSettings();
        this.repaint();
    }
    
    decreaseBars() {
        this.barsPerRow--;
        if(this.barsPerRow<2) {
            this.barsPerRow = 2;
        }
        this.saveProjectSettings();
        this.repaint();
    } 
    
    toggleDecoratedChords() {
        this.decoratedChords = ! this.decoratedChords;
        const button = document.getElementById('decorated_chords');
        if(this.decoratedChords)
        {
            button.classList.add('button_on');
        }
        else
        {
            button.classList.remove('button_on');
        }
        this.saveProjectSettings();
        this.repaint();
    }
    
    

    clear() {
        this.viewManager.chordsView.translateY = 0;
        this.viewManager.lyricsView.translateY = 0;
        this.viewManager.chordsView.table = null; //TODO Move in view
        this.viewManager.lyricsView.table = null;//TODO Move in view
//        this.table = null;
        this.complete = false;
        this.rows = [];
        this.chords = [];
        this.bars = [];
        this.lyrics = [];
        this.markers = [];
        this.playingChord = null;
    }

    render() {
        document.getElementById('song_title').textContent  = this.project;
        this.viewManager.renderView(this.type);
    }
    
    toggleLock() {
        this.lock = !this.lock;
        const value = this.lock ? 1 : 0;
        wwr_req("SET/EXTSTATE/reachords/lock/" +  value );
    }
    
    hideSong(hide) {
        if(hide) this.viewManager.hideAll();
        this.loaderDiv.hidden = !hide;
    }
    
    
    appendChord(chord) {
        if (this.type === ViewManager.LYRICS ) {
            return;
        }
        this.bars.forEach(function (bar) {
            if (bar.number === chord.barNumber) {
                chord.bar = bar;
                bar.chords.push(chord);
            }
        });
        chord.song = this;
        this.chords.push(chord);
    }

    appendBar(bar) {
        if (this.type === ViewManager.LYRICS ) {
            return;
        }
        bar.song = this;
        this.bars.push(bar);

    }

    appendMarker(marker) {
        this.markers[marker.barNumber] = marker;
    }

    appendLyric(lyric) {
        if (this.type === ViewManager.CHORDS ) {
            //return;
        }
        lyric.song = this;
        if(this.lastInsertedLyric) {
            this.lastInsertedLyric.nextLyric = lyric;
        }
        this.lyrics.push(lyric);
        this.lastInsertedLyric = lyric;
    }


    formatTime(position)
    {
        let formattedTime = "";
        const time = (position - this.chordsOffset - this.lyricsOffset + this.globalOffset);
        if(time)
        {
            formattedTime = new Date(Math.abs(time) * 1000).toISOString().slice(14, 22);
        }
        if (time < 0)
        {
            formattedTime = "-" + formattedTime;
        }
        return formattedTime;
    }
    
    
    findPlayingChord(position)
    {
        if(this.playingChord && this.playingChord.checkPlaying(position)) {
            return;
        }
        if(this.playingChord && this.playingChord.nextChord && this.playingChord.nextChord.checkPlaying(position)) {
            this.playingChord = this.playingChord.nextChord;
            return;
        }
        let found = false;
        for (let chord of this.chords) {
            found = chord.checkPlaying(position);
            if(found) {
                this.playingChord = chord;
                return;
            } 
        }
    }
    
    
    checkPlaying(position) {
        if (!this.complete) {
            return;
        }
        let formattedTime = this.formatTime(position);
        
        if(formattedTime !== this.lastClockTime)
        {
            this.clockDiv.innerHTML  = formattedTime + "<p class ='bpm'>" + this.bpm + " bpm</p>";
            this.lastClockTime = formattedTime;
        }
        this.viewManager.updateView(this.type, position);
        
    }

    parseJson() {
        this.loadProjectSettings();
        const json = this.json;
        this.project = json.title;
        this.chordsOffset = json.chordsOffset * 1;
        this.lyricsOffset = json.lyricsOffset * 1;
        this.globalOffset = json.globalOffset * 1;
        this.length = json.length * 1;
        const markers = json.markers;
        let previousMarker = null;
        for (let j in markers) {
            
            const m = markers[j];
            const marker = new Marker(m);
            this.appendMarker(marker);
            if(previousMarker) {
                previousMarker.duration = marker.position - previousMarker.position;
            }
            previousMarker = marker;
        }
        if(previousMarker) {
            previousMarker.duration = this.length - previousMarker.position;
        }
        const bars = json.bars;
        let maxBeatPerRow = 0;
        let beatPerRow = 0;
        let barInRow = 0;
        for (let j in bars) {
            barInRow++;
            const b = bars[j];
            const bar = new Bar(b);
            this.appendBar(bar);
            beatPerRow = beatPerRow + bar.beatDuration;
            if (beatPerRow > maxBeatPerRow) {
                maxBeatPerRow = beatPerRow;
            }
            if (barInRow >= this.barsPerRow) {
                beatPerRow = 0;
                barInRow = 0;
            }
        }
        this.bars.sort(compareBar);
        this.maxBeats = maxBeatPerRow;

        const lyrics = json.lyrics;
        for (let j in lyrics)
        {
            const l = lyrics[j];
            const lyric = new Lyric(l);
            this.appendLyric(lyric);
        }

        const chords = json.chords;
        let previousChord = null;
        for (let j in chords)
        {
            const c = chords[j];
            const chord = new Chord(c);
            this.appendChord(chord);
            if(previousChord) {
                previousChord.nextChord = chord;
            }
            previousChord = chord;
        }
    }
    
    setScriptActive(active)  {
        this.scriptActive = active;
        const scriptstatus_div = document.getElementById('scriptstatus_div');
        const scriptstatus = document.getElementById('scriptstatus');
        if (active) {
            scriptstatus.textContent  = "Script is Running...";
            scriptstatus_div.classList.remove('inactive');
            scriptstatus_div.classList.add('active');       
        } else {
            scriptstatus.innerHTML  = "Script is not running<br>Click Here to run.";
            scriptstatus_div.classList.remove('active');
            scriptstatus_div.classList.add('inactive');    
        }
        
    }
    
    calculateNetwordDelay(t0) {
        const RTT_SAMPLES = 20;
        const t1 = (new Date).getTime();
        const delta = (t1 - t0)/2;
        
        this.networkBuf.push(delta);
        if(this.networkBuf.length > RTT_SAMPLES) {
            this.networkBuf.shift();
        }
        this.networkOffset = trimmedMean(this.networkBuf)/1000;
        
        document.getElementById('latency').innerHTML = "Latency: " +  delta.toFixed(1) + " ms";
        let offs =this.chordsOffset;
        if(this.type === ViewManager.LYRICS )
        {
            offs = this.lyricsOffset;
        }
        document.getElementById('offset').innerHTML = "Offset: " +  (1000*offs).toFixed(1) + " ms";

    }

    calculatePaintDelay(t0) {
        const RTT_SAMPLES = 20;
        const t1 = performance.now();
        const delta = (t1 - t0)/2;
        
        this.paintBuf.push(delta);
        if(this.paintBuf.length > RTT_SAMPLES) {
            this.paintBuf.shift();
        }
        this.paintOffset = trimmedMean(this.paintBuf)/1000;
        
        //console.log(this.paintOffset);
    }
    
    repaint() {
        this.hideSong(true);
        this.songReady = false;
        this.clear();
        this.parseJson();
        this.createTable();
        this.songReady = true; 
    }

}


class LyricsView {
  
    song = null;
    table = null;
    translateY = 0;
    
    ELEMENTS = {
        big_clock_section: false,
        lyrics_section: true,
        chords_section: false,
        decorated_chords: false,
        increase_bars: false,
        decrease_bars: false
    };
        
    constructor(song) {
        this.song = song;
        
    }
    
    
    createTable() {
        let lastEnd = 0;
        
        for (let lyric of this.song.lyrics)
        {
            let row;
            for (let marker of this.song.markers)
            {
                if (marker !== undefined && marker.position >= lastEnd && marker.position < lyric.endTime)
                {
                    const markerRow = new Row(this.song, Row.LYRICS_MARKER);
                    markerRow.append(marker);
                    this.song.rows.push(markerRow);
//                    row = new Row(this, Row.LYRICS); // Probably not needed,
//                    this.rows.push(row);             // TODO remove
                }
            }
            row = new Row(this.song, Row.LYRICS);
            row.append(lyric);
            this.song.rows.push(row);
            lastEnd = lyric.endTime;
        }
    }
    
    render() {
        const table = document.createElement('div');
//        this.song.table = table;
        this.table = table;
        table.id = 'song_content_lyrics';
        for (let row of this.song.rows) {
            row.table = table;
            row.render();
        }
        this.song.clockDiv.style.visibility = "visible";
        table.classList.add("lyrics_table");
        document.title = this.song.project + " - Lyrics";
        let content = document.getElementById('song_content_lyrics');
        content.parentNode.replaceChild(table, content);
        Object.entries(this.ELEMENTS).forEach(([key, value]) => { 
            document.getElementById(key).hidden = !value;
        });
    }
    
    
    update(position) {
        for (let lyric of this.song.lyrics) {
            lyric.checkPlaying(position);
        }
    }
    
    moveTo(val)
    {	
        this.translateY = val + this.translateY;
        const tableStyle = this.table.style;
        tableStyle.transform = "translateY(" + this.translateY + "px)";
    }
}


class ChordsView {

    song = null;
    translateY = 0;
    decoratedChords =  false;
    rows = [];
    teble = null;

    ELEMENTS = {
        big_clock_section: false,
        lyrics_section: false,
        chords_section: true,
        decorated_chords: true,
        increase_bars: true,
        decrease_bars: true
    };
    
    constructor(song) {
        this.song = song;
    }
    
    createTable() {
        let columnCount = 0;
        let row = null;
        for (const bar of this.song.bars)
        {
            
            columnCount++;
            if (columnCount === 1) {
                row = new Row(this.song);
                this.song.rows.push(row);
            }

            if (this.song.markers[bar.number] !== undefined)
            {

                const markerRow = new Row(this.song, Row.MARKER);
                markerRow.append(this.song.markers[bar.number]);
                this.song.rows.push(markerRow);
                columnCount = 1;
                row = new Row(this.song);  // Needed to create a new line when there is a marker 
                this.song.rows.push(row);  // In the middle of the line
            }
            row.append(bar);
            if (columnCount === this.song.barsPerRow) {
                columnCount = 0;
            }
        }
        
    }
    
    translate(val) {
        this.translateY = val + this.translateY;
        const tableStyle = this.table.style;
        if (this.instantPositioning) {
            tableStyle.willChange = 'none';
        } else {
            
            tableStyle.willChange = 'transform';
            tableStyle.transition = 'transform 400ms ease';
        }
        tableStyle.transform = "translateY(" + this.translateY + "px)";
    }
    
    render() {
        Object.entries(this.ELEMENTS).forEach(([key, value]) => { 
            document.getElementById(key).hidden = !value;
        });
        const table = document.createElement('div');
        this.song.table = table;
        this.table = table;
        table.id = 'song_content_chords';
        this.song.clockDiv.style.visibility = "visible";
        const button = document.getElementById('decorated_chords');
        button.classList.toggle('button_on', this.decoratedChords);
        table.classList.add("chords_table"); //TODO do better
        document.getElementById('lyrics_banner').textContent  = "";
        document.title = this.song.project + " - Chords";
        table.style.setProperty("--maxbeats", this.song.maxBeats);

        let content = document.getElementById('song_content_chords');
        content.parentNode.replaceChild(table, content);

        for (let row of this.song.rows) {
            row.table = table;
            row.render();
        }
        for (const chord of this.song.chords) {
            chord.render();
        }   
        
    }
    
    update(position) {
        this.song.findPlayingChord(position);
        let foundLyric = false;

        for (let bar of this.song.bars) {
            bar.checkPlaying(position);
        }
        for (let lyric of this.song.lyrics) {
            foundLyric = foundLyric || lyric.checkPlayingChords(position);
        }
        if(!foundLyric)
        {
            const lyrics_banner = document.getElementById("lyrics_banner");
            lyrics_banner.textContent = "";
        }
    }
}

class ClockView {
    
    bigClockDiv = null;
    progressDiv = null;
    bigTimeDiv = null;
    song = null;
    lastMarker = null;
    lastMarkerContainer = null;
    lastClockTime = null;
    ELEMENTS = {
        big_clock_section: true,
        lyrics_section: false,
        chords_section: false,
        decorated_chords: false,
        increase_bars: false,
        decrease_bars: false
    };
    
    constructor(song) {
        this.song = song;
        this.bigClockDiv = document.getElementById('big_clock_bpm'); 
        this.progressDiv = document.getElementById('progress_fill');
        this.bigTimeDiv = document.getElementById('big_time');  
        this.lastMarkerContainer = document.getElementById('last_marker');
    }
    
    
    render() {
        Object.entries(this.ELEMENTS).forEach(([key, value]) => { 
            document.getElementById(key).hidden = !value;
        });
        this.song.clockDiv.style.visibility = "hidden";
        document.title = this.song.project + " - Clock";
    }
    
    update(position) {
        
        const formattedTime = this.song.formatTime(position);
        this.lastMarker = null;
        if(formattedTime !== this.lastClockTime)
        {
            this.bigTimeDiv.textContent  = formattedTime ;
            this.bigClockDiv.textContent = this.song.bpm + "bpm";
            this.progressDiv.style.width = 100*this.song.calculatedPosition/this.song.length + "%";
            this.lastClockTime = formattedTime;
        }
        
//      TODO Bar number
        for (let marker of this.song.markers) {
            //TODO, the search of last marker can be done in the song.
            if(!marker) continue;
            
            let isOver = marker.isOver(position);
            if(!isOver) break;
            this.lastMarker = marker;
        }

        if(this.lastMarker && this.lastMarker.index !== this.lastMarkerIndex) {
            this.lastMarkerContainer.innerHTML = "";
            this.lastMarkerContainer.append(this.lastMarker.renderForClock());
            this.lastMarkerIndex = this.lastMarker.index;
        }
        if(this.lastMarker === null) {
            this.lastMarkerContainer.innerHTML = "";
        } else {
            const progress = 100*(this.song.calculatedPosition - this.lastMarker.position)/this.lastMarker.duration;
            document.getElementById("marker_" + this.lastMarker.index + "_progress").style.width = progress + "%";
        }
    }
    
}

class ViewManager {
    
    static LYRICS = "lyrics";
    static CHORDS = "chords";
    static CLOCK = "clock";
    song = null;
    clockView = null;
    chordsView = null;
    
    constructor(song) {
        this.song = song;
        song.viewManager = this;
        this.clockView = new ClockView(song);
        this.chordsView = new ChordsView(song);
        this.lyricsView = new LyricsView(song);
    }
    
    hideAll() {
        document.getElementById('chords_section').hidden = true;
        document.getElementById('lyrics_section').hidden = true;
        document.getElementById('big_clock_section').hidden = true;
    }
    
    getTable() {
        switch(song.type) {
        case ViewManager.LYRICS :
            return this.lyricsView.table;
            break;
        case ViewManager.CHORDS :
            return this.chordsView.table;
            break;
        case ViewManager.CLOCK :
            return null;
            break;
        }
    }
    
    updateView(type, position) {
        
        switch(type) {
        case ViewManager.LYRICS :
            this.lyricsView.update(position);
            break;
        case ViewManager.CHORDS :
            this.chordsView.update(position);
            break;
        case ViewManager.CLOCK :
            this.clockView.update(position);
            break;
        }
    }
    
    renderView(type) {
        switch(type) {
        case ViewManager.LYRICS :
            this.lyricsView.render();
            break;
        case ViewManager.CHORDS :
            this.chordsView.render();
            break;
        case ViewManager.CLOCK :
            this.clockView.render();
            break;
        }
    }
}


function trimmedMean(arr, trimPct=0.1) {
  if (!arr.length) return 0;

  const a = arr.slice().sort((x,y)=>x-y);
  const t = Math.floor(a.length * trimPct);
  const mid = a.slice(t, a.length - t);
  return mid.length ? mid.reduce((s,v)=>s+v,0)/mid.length : a.reduce((s,v)=>s+v,0)/a.length;
}


function wwr_onreply(results, t0) {
    const ar = results.split("\n");
    for (let i = 0; i < ar.length; i++) {
        const tok = ar[i].split("\t");          // split a responded line into its individual fields into the array "tok"
        if (tok && tok.length > 0) {
            switch (tok[0]) {
                case "TRANSPORT":
                    song.playState = tok[1]*1;
                    song.recordedPosition = tok[2]*1;
                    break;
                case "EXTSTATE":
                   if (tok[2] === "status" ) {
                       
                        song.calculateNetwordDelay(t0);
                        let status = null;
                        try {
                            status = tok[3] ? JSON.parse(tok[3]) : null;
                        } catch (e) {
                            status = null;
                        }
                        if (status === null) {
                            song.setScriptActive(false);
                            break;
                        }
                        song.bpm = status.bpm;
                        song.lock = status.lock*1;
                        if(song.lock) {
                            document.getElementById('lock').classList.add('locked');
                            document.getElementById('lock').classList.remove('unlocked');
                        } else
                        {
                           document.getElementById('lock').classList.remove('locked');
                            document.getElementById('lock').classList.add('unlocked'); 
                        }
                        // Comparing server timestamps
                        // if they differ it means the script is not running
                        
                        const isActive = status.timestamp !== song.lastTimestamp;
                        song.lastTimestamp = status.timestamp;
                        song.setScriptActive(isActive);
                        status.projectid = simple_unescape(status.projectid);
                        if (isActive) {
                            if(status.version !== song.version || status.projectid !== song.id)
                            {
                                // Hide immediately on detecting a change, before the "song" data has
                                // even been fetched — avoids a brief window where the old song is shown
                                // with a playhead position that already belongs to the new one.
                                song.hideSong(true);
                                song.songReady = false; 
                                song.version = status.version;
                                
                                song.id = status.projectid;
                                wwr_req("GET/EXTSTATE/reachords/song");
                            }
                        }
                    }
                    if (tok[2] === "song" ) {
                        
                        let json = "";
                        if(tok[3] !== "") {
//                            console.log(tok[3]);
                            json = JSON.parse(simple_unescape(tok[3]));
                        }
                        if(json){
                            
                            song.json = json;
                            song.clear();
                            song.parseJson();
                            song.createTable();
                            song.songReady = true; 
                        }
        
                        
                    }
                    break;
            }
        }
    }
}




function compareBar(a, b) {
    if (a.number * 1 < b.number * 1) {
        return -1;
    } else if (a.number * 1 > b.number * 1) {
        return 1;
    }
    return 0;
}

function roundTime(time) {
    const PRECISION = 1000000;
    const formattedTime = Math.round(Number(time) * PRECISION) / PRECISION;
    return formattedTime;
}




wwr_start();//Starts the Server
