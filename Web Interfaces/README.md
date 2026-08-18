# Reachords

A web interface for REAPER that displays scrolling chords and lyrics in real
time as a song is played — designed to be opened on a tablet during
rehearsals or a live show.

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

Copy `scripts/arilia_Reachords Export.lua` and `arilia_start.lua` into
REAPER's `Scripts/arilia-scripts` folder (or install via ReaPack, once
available). The path is important.

### Web interface

1. Copy the `web/` folder into REAPER's built-in web server directory (set
   in *Options > Preferences > Control/OSC/Web*), for example as a
   `reachords/` subfolder.
2. Make sure REAPER's web server is enabled.
3. From a browser on the same local network (including a tablet), open the
   web server address followed by `reachords/chords`.
4. For lyrics, go to `reachords/lyrics`.

## Usage

1. Add items to a `Chords` track (and optionally a `Lyrics` track) in your
   project (track names are case insensitive).
2. Open/refresh the web page on your tablet.
3. The `arilia_Reachords Export.lua` action in REAPER should be running.
   You can start it manually from the action list, or by clicking the
   dedicated button in the web interface.
4. You can have multiple projects/songs open at the same time, and the web
   page automatically shows the project you're currently working on.
5. You can set an offset on the `Chords` track to compensate for network
   latency.

## Project status

Personal project for the author and their band, currently being stabilized
before a possible release on ReaPack.

### TODO

- [X] rethink Lua script logic
- [X] review javascript code
- [ ] review HTML and CSS
- [ ] files naming
- [ ] add an option for choosing different names for `Chords` and `Lyrics`
      tracks

## Known issue

- The script compares the project paths and the number of changes made to
  determine whether to rebuild the web page. If you are working on two or
  more projects that have not yet been saved, there is a remote
  possibility that the web page will show the wrong song. Solution: name
  and save your projects.
- If a chord spans two or more bars and the second bar is on a new row,
  the chord is not split between the two rows but overflows into the row
  above.
- There could be a delay of up to 2 seconds (usually less) between a
  play/pause action in Reaper and what happens on the web page. This is
  the intended behavior. Once started, the scrolling on the web page is
  always in sync with the transport. Every two seconds the client asks
  Reaper's web server for the transport position and the play state; in
  the meantime, javascript interpolates the information to estimate the
  actual position.

## Author

arilia

## License

TBD.
