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


reaper.ClearConsole()
--reaper.ShowConsoleMsg("Starting...\n")


local projectName = reaper.GetProjectName()
projectName = projectName:match("(.+)%..+$") or projectName
reaper.SetExtState("reachords", "project", projectName, false)
--reaper.ShowConsoleMsg(projectName .. "\n")

local globalOffset = reaper.GetProjectTimeOffset(0, false)
--reaper.ShowConsoleMsg(offset .. "\n")

local dirty = reaper.IsProjectDirty(0)
--reaper.ShowConsoleMsg(dirty .. "\n")

local offset = 0




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


--reaper.ShowConsoleMsg(mark .. "\n")

-------------------
-- MEASURES LIST    
-------------------


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





-------------------
-- CHORDS LIST    
-------------------

local tr = findTrackByName('chords')

-- Iterates all the items in the track and create a JSON objet with the list of the chords

local chordjs = "{}"
chordjs  = getChordsJson(tr)

--reaper.ShowConsoleMsg(chordjs .. "\n")

-------------------
-- LYRICS LIST    
-------------------

local tr = findTrackByName('lyrics')


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
	  local duration = length * (bpm / 60)
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


--reaper.ShowConsoleMsg(lyrjs .. "\n")
local old_json = reaper.GetExtState("reachords", "chords")

local json = "{"
json = json .. '"chords":' .. chordjs
json = json .. ', "lyrics":' .. lyrjs
json = json .. ', "bars":' .. meas
json = json .. ', "markers":' .. mark
json = json .. ', "title":"' .. jsonEscape(projectName) .. '"'
json = json .. ', "offset":' .. offset 
json = json .. ', "globalOffset":' .. globalOffset
json = json .. '}'

if json ~= old_json then 
	reaper.SetExtState("reachords", "dirty", "true", false)
	
else
	reaper.SetExtState("reachords", "dirty", "false", false)
end
reaper.SetExtState("reachords", "chords", json, false)
