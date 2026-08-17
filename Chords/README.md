# Reachords

A web interface for REAPER that displays scrolling chords and lyrics in real time as a
song is played — designed to be opened on a tablet during rehearsals or a
live show.

## How it works

1. In the REAPER project, create a track named `Chords` containing items;
   each item's notes field holds the chord name. Optionally, a `Lyrics`
   track works the same way for song lyrics.
2. The script `scripts/arilia_Reachords Export.lua` reads the project and
   exports chords, lyrics, markers, and measures as JSON via `ExtState`.
3. The web page (`web/`) reads this data through REAPER's built-in web
   server and displays it, scrolling in sync with the playhead.

## Installation

### Script

Copy `scripts/arilia_Reachords Export.lua` and `arilia_start.lua` into REAPER's `Scripts/arilia-scripts`
folder (or install via ReaPack, once available). The path is important.

### Web interface

1. Copy the `web/` folder into REAPER's built-in web server directory
   (set in *Options > Preferences > Control/OSC/Web*), for example as a
   `reachords/` subfolder.
2. Make sure REAPER's web server is enabled.
3. From a browser on the same local network (including a tablet), open the
   web server address followed by `reachords/chords`.
4. For the lyrics go to `reachords/lyrics`.

## Usage

1. Add items to a `Chords` track (and optionally a `Lyrics` track) in your
   project.
2. Open/refresh the web page on your tablet.
3. The `arilia_Reachords Export.lua` action in REAPER should be running.
   You can do it manually from the action list or click on the dedicated button in the web interface


## Project status

Personal project for the author and their band, currently being stabilized
before a possible release on ReaPack.

### TODO

- [ ] 

## Known issue

Many

## Author

arilia

## License

TBD.
