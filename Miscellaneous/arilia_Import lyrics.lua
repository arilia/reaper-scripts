pos = reaper.GetCursorPosition()
-- reaper.ShowConsoleMsg(pos)

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

--csv = csv:gsub("%s+", "")  -- rimuove \n, \r, spazi, tab ovunque si trovino
csv = csv:gsub("\r\n", "\n"):gsub("\r", "\n")
local measureNumber = 0
local tr = findTrackByName("lyrics_tmp")
for text in string.gmatch(csv .. "\n", "(.-)\n" ) do
    local barStartTime = pos + reaper.TimeMap_GetMeasureInfo(0, measureNumber)
    local barEndTime = pos + reaper.TimeMap_GetMeasureInfo(0, measureNumber+2)
  
    local duration = (barEndTime  - barStartTime ) 
    lyric = reaper.AddMediaItemToTrack(tr)
    reaper.SetMediaItemInfo_Value(lyric, "D_POSITION", barStartTime)
    reaper.SetMediaItemInfo_Value(lyric, "D_LENGTH",duration)
    reaper.GetSetMediaItemInfo_String(lyric , "P_NOTES", text , true)
    measureNumber = measureNumber +2
end

