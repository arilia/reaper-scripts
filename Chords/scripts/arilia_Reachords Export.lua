reaper.set_action_options(1)
reaper.ClearConsole()

-- QUA VA IL RECUPERO/CREAZIONE DELL'ID PROGETTO
local projectId = "TODO"

local lastChangeCount = -1
local version = 0
local offset = 0
local lastCheckTime = 0
local globalOffset = 0
local projectName = ""





local function jsonEscape(str)
    if str == nil then return "" end
    str = tostring(str)
    str = str:gsub('\\', '\\\\')
    str = str:gsub('"', '\\"')
    str = str:gsub('\n', '\\n')
    str = str:gsub('\r', '\\r')
    str = str:gsub('\t', '\\t')
    return str
end


  
  


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


-------------------
-- CHORDS LIST    
-------------------

local function getChordsJson(tr) 
  local chordjs = "{"
  if tr then
    offset =  reaper.GetMediaTrackInfo_Value(tr, "D_PLAY_OFFSET")
    local itemCount = reaper.CountTrackMediaItems(tr)
    for i=1, itemCount do
        local item = reaper.GetTrackMediaItem(tr, i-1)
        local position = reaper.GetMediaItemInfo_Value(item, "D_POSITION")
        local length = reaper.GetMediaItemInfo_Value(item, "D_LENGTH")


        --- local bpm = reaper.TimeMap_GetDividedBpmAtTime(position)
        --- local endTime = position + length


        --- Converts time in beats
        --- local duration = length * (bpm / 60)
        
      local bpmStart = reaper.TimeMap_GetDividedBpmAtTime(position)
        local endTime = position + length
        local bpmEnd = reaper.TimeMap_GetDividedBpmAtTime(endTime)

        -- Converts time in beats, accounting for linear tempo changes
        local bpmAvg = (bpmStart + bpmEnd) / 2
        local duration = length * (bpmAvg / 60)



        local _, text = reaper.GetSetMediaItemInfo_String(item, "P_NOTES", '', false)
        
        local positionString = reaper.format_timestr_pos( position, '', 2 )
        
        local measure, beat, sub = positionString:match("^(%d+)%.(%d+)%.(%d+)")
        
        if measure then
            measure = tonumber(measure)
            beat    = tonumber(beat)
            sub     = tonumber(sub)
        end
        chordjs = chordjs .. '"' .. i .. '": { "text":'.. '"' .. jsonEscape(text) .. '"'
        chordjs = chordjs .. ', "barNumber":' .. measure
        chordjs = chordjs .. ', "beatStart":'.. beat
        chordjs = chordjs .. ', "sub":'.. sub
        chordjs = chordjs .. ', "beatDuration":'.. duration
        chordjs = chordjs .. ', "startTime":'.. position
        chordjs = chordjs .. ', "endTime":'.. endTime
        chordjs = chordjs .. '}'
        if i<itemCount then
         chordjs = chordjs .. ','
        end
      
     end
  end 
  
  chordjs = chordjs .. '}'
  -- reaper.ShowConsoleMsg(chordjs .. "\n")
  return chordjs
end

-------------------
-- MARKERS LIST    
-------------------


local function getMarkersJson() 
  local mark = "{";
  local markerCount = reaper.CountProjectMarkers(0)
  local markCount =0;
  for i=0, markerCount - 1 do 
    local retval, isrgn,  pos,  rgnend,  name,  markrgnindexnumber, color = reaper.EnumProjectMarkers3(0, i)
    
    if(isrgn or #name == 0) then
    else
      local r, g, b = 0, 0, 0
      r, g, b = reaper.ColorFromNative(color)
      markCount = markCount +1
      if markCount>1 then
        mark = mark .. ','
      end
      local bar = reaper.format_timestr_pos( pos, '', 2 )
      bar, _, _ = bar:match("^(%d+)%.(%d+)%.(%d+)")
      mark = mark .. '"' .. bar .. '": {' 
      mark = mark .. '"barNumber":' .. bar
      mark = mark .. ', "position":' .. pos 
      mark = mark .. ', "text":"' .. jsonEscape(name) .. '"'
      mark = mark .. ', "color":"' .. r .. ", " .. g .. ", " .. b .. '"'
      mark = mark .. '}'
      
    end
    
    end
  mark = mark .. '}'
  return mark
end


-------------------
-- MEASURES LIST    
-------------------

local function getMeasuresJson() 
  local projectLength = reaper.GetProjectLength()
  local lastBarString = reaper.format_timestr_pos( projectLength, '', 2 )
  local lastMeasure, _, _ = lastBarString:match("^(%d+)%.(%d+)%.(%d+)")
  if lastMeasure then 
    lastMeasure = tonumber(lastMeasure)
  end
  
  local firstBarString = reaper.format_timestr_pos( 0, '', 2 )
  local firstMeasure, _, _ = firstBarString:match("([^.]+)")
  if firstMeasure then 
    firstMeasure = tonumber(firstMeasure)
  end
  local meas = "{";
  for m=firstMeasure, lastMeasure do
  
    local barStart, _, _, numOfBeats, _, BPM = reaper.TimeMap_GetMeasureInfo(0, m-1)
    local barEnd = reaper.TimeMap_GetMeasureInfo(0, m)
    barStart = barStart - globalOffset
    barEnd = barEnd - globalOffset
    meas = meas .. '"' .. m .. '": {' 
    meas = meas .. '"number":' .. m
    meas = meas .. ', "startTime":' .. barStart 
    meas = meas .. ', "endTime":' .. barEnd 
    meas = meas .. ', "numOfBeats":' .. numOfBeats
      
    meas = meas .. '}'
   if m<lastMeasure then
      meas = meas .. ','
    end
    
  end
  meas = meas .. '}'
  return meas
end








-------------------
-- LYRICS LIST    
-------------------


local function getLyricsJson(tr)
  -- Iterates all the items in the track and create a JSON objet with the list of the chords
  
  local lyrjs = "{"
  if tr then
    local itemCount = reaper.CountTrackMediaItems(tr)
    for i=1, itemCount do
      local item = reaper.GetTrackMediaItem(tr, i-1)
      local position = reaper.GetMediaItemInfo_Value(item, "D_POSITION")
      local length = reaper.GetMediaItemInfo_Value(item, "D_LENGTH")
      local bpm = reaper.TimeMap_GetDividedBpmAtTime(position)
      local endTime = position + length
      -- Converts time in beats
      local duration = length * (bpm / 60)  -- likely useless, remove in future TODO and BPM too
      local _, text = reaper.GetSetMediaItemInfo_String(item, "P_NOTES", '', false)
      
      local positionString = reaper.format_timestr_pos( position, '', 2 )
      
     
      lyrjs = lyrjs .. '"' .. i .. '": { "text":'.. '"' .. jsonEscape(text) .. '"'
      lyrjs = lyrjs .. ', "duration":'.. duration
      lyrjs = lyrjs .. ', "startTime":'.. position
      lyrjs = lyrjs .. ', "endTime":'.. endTime
      lyrjs = lyrjs .. '}'
      if i<itemCount then
        lyrjs = lyrjs .. ','
      end
      
    end
  end
  lyrjs = lyrjs .. '}'
  return lyrjs
end



local function getSongJson()
  globalOffset = reaper.GetProjectTimeOffset(0, false)
  projectName = reaper.GetProjectName()
  projectName = projectName:match("(.+)%..+$") or projectName
  
  local tr = findTrackByName('lyrics')
  local lyrjs = getLyricsJson(tr)
  local tr = findTrackByName('chords')
  local chordjs  = getChordsJson(tr)
  local markjs = getMarkersJson()
  local measjs = getMeasuresJson()
  
  local json = "{"
  json = json .. '"chords":' .. chordjs
  json = json .. ', "lyrics":' .. lyrjs
  json = json .. ', "bars":' .. measjs
  json = json .. ', "markers":' .. markjs
  json = json .. ', "title":"' .. jsonEscape(projectName) .. '"'
  json = json .. ', "offset":' .. offset 
  json = json .. ', "globalOffset":' .. globalOffset
  json = json .. '}'
  return json
end  


-------------------
-- LOOP    
-------------------


local function loop()
    local now = reaper.time_precise()

    -- Check the project just one time a second,
    if now - lastCheckTime >= 1 then
        lastCheckTime = now

        local changeCount = reaper.GetProjectStateChangeCount(0)

        -- Build the json only if the project is changed
        if changeCount ~= lastChangeCount then
            lastChangeCount = changeCount

            -- QUA VA IL CODICE PER RICOSTRUIRE IL JSON DELLA CANZONE
            -- (findTrackByName "chords"/"lyrics", getChordsJson, marker, misure)
            local json = getSongJson()

            -- QUA VA IL CONFRONTO COL JSON PRECEDENTE
            -- per capire se il cambiamento rilevato da GetProjectStateChangeCount
            -- ha effettivamente prodotto un JSON diverso
            local oldJson = reaper.GetExtState("reachords", "song")
            if json ~= oldJson then
                version = changeCount
                reaper.SetExtState("reachords", "song", json, false)
            end
        end

        -- QUA VA LA SCRITTURA DELLO STATUS
        -- (version, os.time() come timestamp, projectId)
        local statusJson = '{"version":' .. version .. ', "timestamp":' .. os.time() .. ', "projectid": "'  ..  projectId ..  '"}'  -- placeholder
        reaper.SetExtState("reachords", "status", statusJson, false)
        -- reaper.ShowConsoleMsg(statusJson .. "\n")
    end

    reaper.defer(loop)
end

reaper.atexit(function()
    reaper.DeleteExtState("reachords", "song", true)
end)

loop()

