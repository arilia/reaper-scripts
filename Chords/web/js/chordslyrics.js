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
        this.startTime = Math.round(Number(b.startTime) * 10000) / 10000;
        this.endTime = Math.round(Number(b.endTime) * 10000) / 10000;
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

            const row_box = document.getElementById('position_row').getBoundingClientRect()
            const target_position = row_box.top + row_box.height / 2;
            const positionInfo = this.div.getBoundingClientRect();
            const top = positionInfo.top + positionInfo.height / 2;
            this.song.translate(target_position - top);
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
        const time_div = document.createElement('div');
        time_div.classList.add('time');
        time_div.textContent  = this.number;
        this.div.appendChild(time_div);
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
        this.song.table.append(this.div);
    }
}


class Marker {
    text = "";
    barNumber = 1;
    position = 0;
    color = '';
    div = null;
    row = null;

    constructor(m) {
        this.text = m.text;
        this.color = m.color;
        this.barNumber = m.barNumber;
        this.position = m.position;
    }
    render() {
        this.div = document.createElement("div");
        this.div.textContent  = this.text;
        this.div.classList.add('marker');
        this.div.style.border = "1px solid rgb(" + this.color + ")";
        if(this.row.div) this.row.div.append(this.div);
        
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

    constructor(c) {
        this.startTime = Math.round(Number(c.startTime) * 10000) / 10000;
        this.endTime = Math.round(Number(c.endTime) * 10000) / 10000;
        this.barNumber = c.barNumber;
        this.beatStart = c.beatStart;
        this.beatDuration = c.beatDuration;
        this.name = c.text;
    }

    set playing(val) {
        this.isPlaying = val;
        if (val && this.div !== null) {
            this.div.classList.add('chord_playing');
        } else {
            this.div.classList.remove('chord_playing');
        }
    }

    checkPlaying(position) {

        if (position >= this.startTime && position < this.endTime) {
            this.playing = true;
        } else {
            this.playing = false;
        }
    }

    render()
    {
        this.div = document.createElement('div');
        this.div.classList.add('chord');
        this.div.textContent  = this.name;
        this.div.style.left = Number((this.beatStart - 1) * this.bar.width / this.bar.beats.length) + "px"
        this.div.style.width = Number(this.beatDuration * this.bar.width / this.bar.beats.length) - 4 + "px"
        this.bar.div.append(this.div);
    }
}




class Lyric {
    text = "Lyrics";
    startTime;  //in seconds
    endTime; //in seconds
    duration; //in seconds
    isPlaying = false;
    div = null;
    song = null;
    row = null;
    nextLyric = null;

    constructor(c) {
        this.startTime = c.startTime;
        this.endTime = c.endTime;
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

            const div = this.div;
            const row_box = document.getElementById('position_row').getBoundingClientRect();
            
            const target_position = row_box.top + row_box.height / 2;
            
            const positionInfo = this.div.getBoundingClientRect();
            
            const top = positionInfo.top;// + positionInfo.height/2;
            let height;
            if (this.nextLyric) {
                const nextLyricPositionInfo = this.nextLyric.div.getBoundingClientRect();
                height = nextLyricPositionInfo.top - positionInfo.top;
            } else {
                height = positionInfo.height;
            }
            const progress = height * (this.song.calculatedPosition - this.startTime) / this.duration;

            this.song.moveTo(target_position - top - progress);
        }
        this.isPlaying = val;

    }

    render()
    {
        this.div = document.createElement('div');
        this.div.classList.add('lyric');
        this.div.textContent  = this.text;
        if (this.playing)
        {
            this.div.classList.add('playing')
        }
        this.row.div.append(this.div);
    }

    checkPlaying(position) {

        if (position >= this.startTime && position < this.endTime) {

            this.playing = true;

        } else {

            this.playing = false;

        }
    }
}

class Song {
    id = "";
    table = null;
    lastInsertedLyric = null;
    bars = [];
    chords = [];
    lyrics = [];
    rows = [];
    songReady = false;
    json = "";
    markers = [];
    maxBeats = 16;
    barsPerRow = 4;
    translateY = 0;
    offset = 0;
    lastRecordedPosition = 0;
    lastRecordedTime = 0;
    calculatedPosition = 0;
    playState = 0;
    globalOffset = 0;
    version = -1;
    timestamp = -1;
    type = 'lyrics';
    project = "Song";
    complete = false;
    instantPositioning = false;
    static LYRICS = "lyrics";
    static CHORDS = "chords";
    

    constructor(type) {
        this.id = Math.random();
        this.type = type;
        wwr_req("GET/PROJEXTSTATE/reaperchordsandlyrics/barsPerRow");
        //wwr_req("GET/EXTSTATE/reachords/song");
        wwr_req_recur("TRANSPORT;GET/EXTSTATE/reachords/status", 2000); //Get a JSON string containing the transport and the state of the project . If something changes it rebuild the Song
        setInterval(this.calculatePosition.bind(this), 50);
    }

    
    set recordedPosition(position) {
        this.lastRecordedTime = Date.now();
        this.calculatedPosition = position = this.lastRecordedPosition = position + this.offset;
    }

    calculatePosition() {
        let position = this.lastRecordedPosition;
        if (this.playState === 1) {
            const elapsedTime = Date.now() - this.lastRecordedTime;
            position += elapsedTime / 1000;
            this.calculatedPosition = position;
        }
        let playStateDiv = document.getElementById('play_state');
        switch(this.playState) {
            case 0:
                
                playStateDiv.textContent  = "Stop";
                playStateDiv.classList = "play_state stop"
                break;
            case 1:
                playStateDiv.textContent  = "Play";
                playStateDiv.classList = "play_state play"
                break;
            case 2:
                playStateDiv.textContent  = "Pause";
                playStateDiv.classList = "play_state stop"
                break;
            case 5:
                playStateDiv.textContent  = "Rec";
                playStateDiv.classList = "play_state rec"
                break;
            case 6:
                playStateDiv.textContent  = "Rec Pause";
                playStateDiv.classList = "play_state rec"
                break;
            
            
        }
        this.checkPlaying(position);
        this.instantPositioning = false;
        if (this.songReady) {          // <-- nuovo: non rivelare se stai ancora aspettando
            this.hideSong(false);
        }
    }

    translate(val) {
        this.translateY = val + this.translateY;
        const table_style = this.table.style;
        if (this.instantPositioning) {
            table_style.willChange = 'none';
        } else {
            
            table_style.willChange = 'transform';
            table_style.transition = 'transform 400ms ease';
        }
        table_style.transform = "translateY(" + this.translateY + "px)";
    }


    moveTo(val)
    {	
//        console.log(val);
        this.translateY = val + this.translateY;
        const table_style = this.table.style;
        table_style.transform = "translateY(" + this.translateY + "px)";
    }
    
    createTable() {
        this.instantPositioning = true;
        if (this.type === "chords") {
            this.createTableChords();
        } else {
            this.createTableLyrics();
        }
        
    }

    createTableLyrics() {
        let lastEnd = 0;
        
        for (let lyric of this.lyrics)
        {
            let row;
            for (let marker of this.markers)
            {
                if (marker !== undefined && marker.position >= lastEnd && marker.position < lyric.endTime)
                {
                    const markerRow = new Row(this, Row.LYRICS_MARKER);
                    markerRow.append(marker);
                    this.rows.push(markerRow);
                    row = new Row(this, Row.LYRICS);
                    this.rows.push(row);
                }
            }
            row = new Row(this, Row.LYRICS);
            row.append(lyric);
            this.rows.push(row);
            lastEnd = lyric.endTime;
        }
        this.render();
        this.complete = true;
    }

   
    increaseBars () {
        this.barsPerRow++;
        this.clear();
        this.parseJson();
        this.createTable();
    }
    
    decreaseBars() {
        this.barsPerRow--;
        if(this.barsPerRow<2) {
            this.barsPerRow = 2;
        }
        this.clear();
        this.parseJson();
        this.createTable();
    } 
    
    createTableChords() {
        let columnCount = 0;
        let row = null;
        for (const bar of this.bars)
        {
            
            columnCount++;
            if (columnCount === 1) {
                row = new Row(this);
                this.rows.push(row);
            }

            if (this.markers[bar.number] !== undefined)
            {

                const markerRow = new Row(this, Row.MARKER);
                markerRow.append(this.markers[bar.number]);
                this.rows.push(markerRow);
                columnCount = 1;
                row = new Row(this);
                this.rows.push(row);
            }
            row.append(bar);
            if (columnCount === this.barsPerRow) {
                columnCount = 0;
            }
        }
        this.render();
        this.complete = true;
    }

    clear() {
        this.translateY = 0;
        this.table = null;
        this.complete = false;
        this.rows = [];
        this.chords = [];
        this.bars = [];
        this.lyrics = [];
        this.markers = [];
    }

    render() {
        document.getElementById('song_title').textContent  = this.project;
        if (this.type === Song.LYRICS) {
            document.title = this.project + " - Lyrics";
        } else {
            document.title = this.project + " - Chords";
        }
        this.table = document.createElement('div');
        for (let row of this.rows) {
            row.table = this.table;
            row.render();
        }

        const table = document.getElementById('chords')
        this.table.classList.add("chords_table");
        this.table.id = "chords";
        this.table.style.setProperty("--maxbeats", this.maxBeats);
        table.parentNode.replaceChild(this.table, table);
        for (const chord of this.chords) {
            chord.render();
        }
    }
    
    hideSong(hide) {
        //console.log(hide);
        document.getElementById('song').style.visibility = hide ? 'hidden' : 'visible';
        document.getElementById('loader').style.visibility = hide ? 'visible' : 'hidden';
    }
    
    
    appendChord(chord) {
        if (this.type === Song.LYRICS) {
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
        if (this.type === "lyrics") {
            return;
        }
        bar.song = this;
        this.bars.push(bar);

    }

    appendMarker(marker) {
        this.markers[marker.barNumber] = marker;
        ;
    }

    appendLyric(lyric) {
        if (this.type === Song.CHORDS) {
            return;
        }
        lyric.song = this;
        if(this.lastInsertedLyric) {
            this.lastInsertedLyric.nextLyric = lyric;
        }
        this.lyrics.push(lyric);
        this.lastInsertedLyric = lyric;
    }

    checkPlaying(position) {
        if (!this.complete) {
            return;
        }
        let formattedTime = "";
        const time = (position - this.offset + this.globalOffset);
        if(time)
        {
            formattedTime = new Date(Math.abs(time) * 1000).toISOString().slice(14, 22);
        }
        if (time < 0)
        {
            formattedTime = "-" + formattedTime;
        }
        document.getElementById('clock_div').textContent  = formattedTime;

        switch (this.type) {
            case Song.CHORDS:
                for (let chord of this.chords) {
                    chord.checkPlaying(position);
                }
                for (let bar of this.bars) {
                    bar.checkPlaying(position);
                }
                break;
            case Song.LYRICS:
                for (let lyric of this.lyrics) {
                    lyric.checkPlaying(position);
                }
                break;
        }
        
    }

    parseJson() {
        const json = this.json;
        this.project = json.title;
        this.offset = json.offset * 1;
        this.globalOffset = json.globalOffset * 1;
        const markers = json.markers;
        for (let j in markers) {
            const m = markers[j];
            const marker = new Marker(m);
            this.appendMarker(marker);
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
            song.appendLyric(lyric);
        }

        const chords = json.chords;
        for (let j in chords)
        {
            const c = chords[j];
            const chord = new Chord(c);
            this.appendChord(chord);
        }
    }
    
    setScriptActive(active)  {
        this.scriptActive = active;
        const dot = document.getElementById('scriptstatus_div');
        if (active) {
            dot.textContent  = "Running"
            dot.classList.remove('inactive');
            dot.classList.add('active');       
        } else {
            dot.textContent  = "Click to run"
            dot.classList.remove('active');
            dot.classList.add('inactive');    
        }
        
    }

}

function wwr_onreply(results) {
    const ar = results.split("\n");
    for (let i = 0; i < ar.length; i++) {
        const tok = ar[i].split("\t");          // split a responded line into its individual fields into the array "tok"
        if (tok && tok.length > 0) {
            switch (tok[0]) {
                case "TRANSPORT":
                    song.playState = tok[1]*1;
                    song.recordedPosition = tok[2]*1;
                    break;
                case "PROJEXTSTATE":
                    if (tok[2] === "barsPerRow" && 1 * tok[3] >= 1) {
                        song.barsPerRow = Math.abs(Math.floor(tok[3]));
                    }
                    break;
                case "EXTSTATE":
                   if (tok[2] === "status" ) {
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
                        const TIMELIMIT = 3; //TODO Move from here
                        const isActive = Date.now()/1000 - status.timestamp <= TIMELIMIT;
                        song.setScriptActive(isActive);

                        if (isActive) {
                            if(status.version !== song.version || status.projectid !== song.id)
                            {
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
                            json = JSON.parse(tok[3]);
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


wwr_start();//Starts the Server
