# reaper-script

A collection of personal REAPER scripts and web interfaces.

Each subfolder is a self-contained project with its own README, following
the folder structure below.

## Projects

- **[Web Interfaces](https://github.com/arilia/reaper-scripts/tree/main/Web%20Interfaces)** 
  - **reachords** a web interface that displays chords and lyrics in
  real time as a song plays in REAPER, synced with the playhead. Designed
  for use on a tablet during rehearsals or live shows.

## Repository structure

```
reaper-script/
├── README.md              (this file)
├── Web Interfaces/
|   |                      (Lua scripts)
│   ├── README.md          (folder-specific documentation)
│   └── reachords/         (HTML/CSS/JS, go in REAPER's web server folder)
└── (future projects follow the same pattern)
```

## Naming convention

Scripts and web interfaces follow the common ReaScript community
convention: `{author}_Description with spaces.ext` — this makes them
identifiable in REAPER's Action list and, eventually, in the ReaPack
package browser.



## License

GPL-3.0 license
