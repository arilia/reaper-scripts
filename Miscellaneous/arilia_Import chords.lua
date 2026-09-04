local function findTrackByName(name)
    local trackCount = reaper.CountTracks(0)
    for i = 1, trackCount do
        local tr = reaper.GetTrack(0, i - 1)
        local ok, trackName = reaper.GetTrackName(tr)
        if string.lower(trackName) == string.lower(name) then
            return tr
        end
    end
    return nil
end


local retval, filePath = reaper.GetUserFileNameForRead("", "Seleziona il file con gli accordi", "txt")
if not retval then return end

local f = io.open(filePath, "r")
local csv = f:read("*a")
f:close()

csv = csv:gsub("%s+", "")  -- rimuove \n, \r, spazi, tab ovunque si trovino
local measureNumber = 0
local tr = findTrackByName("chords")
for text in string.gmatch(csv, "(.-)|" ) do
      if text ~= "" then
chordsPerBar = 0;
local barStartTime = reaper.TimeMap_GetMeasureInfo(0, measureNumber)
local barEndTime = reaper.TimeMap_GetMeasureInfo(0, measureNumber+1)

       for subText in string.gmatch(text .."," , "(.-)," ) do
      chordsPerBar = chordsPerBar +1
    end
          local duration = (barEndTime  - barStartTime )/chordsPerBar 
          chordNumber = 0
       for subText in string.gmatch(text ..","  , "(.-)," ) do
      local startTime = barStartTime + duration*chordNumber 
     chord = reaper.AddMediaItemToTrack(tr)
reaper.SetMediaItemInfo_Value(chord, "D_POSITION", startTime)
reaper.SetMediaItemInfo_Value(chord, "D_LENGTH",duration)
reaper.GetSetMediaItemInfo_String(chord , "P_NOTES", subText , true)
chordNumber = chordNumber + 1
     end
end
      measureNumber = measureNumber +1
end

