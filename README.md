# reaper-script

A collection of personal REAPER scripts and web interfaces.

Each subfolder is a self-contained project with its own README, following
the folder structure below.

## Projects

- **[Chords](Chords/)** — Web interface that displays chords and lyrics in
  real time as a song plays in REAPER, synced with the playhead. Designed
  for use on a tablet during rehearsals or live shows.

## Repository structure

```
reaper-script/
├── README.md              (this file)
├── Chords/
│   ├── README.md          (project-specific documentation)
│   ├── scripts/           (Lua scripts, go in REAPER's Scripts folder)
│   └── web/                (HTML/CSS/JS, go in REAPER's web server folder)
└── (future projects follow the same pattern)
```

## Naming convention

Scripts and web interfaces follow the common ReaScript community
convention: `{author}_Description with spaces.ext` — this makes them
identifiable in REAPER's Action list and, eventually, in the ReaPack
package browser.

## How to install

Reapack for this project is not available yet.

To install it create a folder named *arilia* into reaper default scripts directory and copy the two files *arilia_Reachords Export.lua* and *arilia_start.lua* in it
then copy all the *web* folder into www_root folder and rename it as *reachords*

Then manually load the two scripts from the action list

After that enable the web server from the setting menu

Finally open any browser on any device connected to you network and go to *youripaddress:8080/reachords/chords* to see the Chords page or go to *youripaddress:8080/reachords/lyrics* to see the Lyrics page


## How it works

### Chords
Creat a track named *chords* (case insensitive) and put an empty item in it. Double click on the item and add a note with the chord name. The chord is now shown in the web page. Repeat for every chord in you song. The duration of the item is also the duration of the chord

### Lyrics
Same as chords. Create a track named *lyrics* and add an item for every lyric row


## Todo

- [ ] Improve interface
- [ ] Bug fix
- [ ] Add packege to ReaPack

## License

TBD.
