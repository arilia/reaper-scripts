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


function getChordsJson(tr, chordsFound ) 
	local chordjs = "{"
	if chordsFound then
		offset =  reaper.GetMediaTrackInfo_Value(tr, "D_PLAY_OFFSET")
		local itemCount = reaper.CountTrackMediaItems(tr)
		for i=1, itemCount do
			  item = reaper.GetTrackMediaItem(tr, i-1)
			  position = reaper.GetMediaItemInfo_Value(item, "D_POSITION")
			  length = reaper.GetMediaItemInfo_Value(item, "D_LENGTH")
			  bpm = reaper.TimeMap_GetDividedBpmAtTime(position)
			  endTime = position + length
			  -- Converts time in beats
			  duration = length * (bpm / 60)
			  _, text = reaper.GetSetMediaItemInfo_String(item, "P_NOTES", '', false)
			  
			  local positionString = reaper.format_timestr_pos( position, '', 2 )
			  
			  measure, beat, sub = positionString:match("^(%d+)%.(%d+)%.(%d+)$")
			  
			  if measure then
			      measure = tonumber(measure)
			      beat    = tonumber(beat)
			      sub     = tonumber(sub)
			  end
			  chordjs = chordjs .. '"' .. i .. '": { "text":'.. '"' .. jsonEscape(text) .. '"'
			  chordjs = chordjs .. ', "barNumber":' .. measure
			  chordjs = chordjs .. ', "beatStart":'.. beat;
			  chordjs = chordjs .. ', "sub":'.. sub;
			  chordjs = chordjs .. ', "beatDuration":'.. duration;
			  chordjs = chordjs .. ', "startTime":'.. position;
			  chordjs = chordjs .. ', "endTime":'.. endTime;
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
for i=0, markerCount do 
	retval, isrgn,  pos,  rgnend,  name,  markrgnindexnumber, color = reaper.EnumProjectMarkers3(0, i)
  
	if(isrgn or #name == 0) then
	else
		r=0
		g=0
		b=0
			r, g, b = reaper.ColorFromNative(color)
		markCount = markCount +1
		if markCount>1 then
		  mark = mark .. ','
		end
		local bar = reaper.format_timestr_pos( pos, '', 2 )
		bar, _, _ = bar:match("^(%d+)%.(%d+)%.(%d+)$")
		mark = mark .. '"' .. bar .. '": {' 
		mark = mark .. '"barNumber":' .. bar
		mark = mark .. ', "position": ' .. pos 
		mark = mark .. ', "text": "' .. jsonEscape(name) .. '"'
		mark = mark .. ', "color": "' .. r .. ", " .. g .. ", " .. b .. '"'
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
lastMeasure, _, _ = lastBarString:match("^(%d+)%.(%d+)%.(%d+)$")
if lastMeasure then 
  lastMeasure = tonumber(lastMeasure)
end

local firstBarString = reaper.format_timestr_pos( 0, '', 2 )
firstMeasure, _, _ = firstBarString:match("([^.]+)")
if firstMeasure then 
  firstMeasure = tonumber(firstMeasure)
end
local meas = "{";
for m=firstMeasure, lastMeasure do

	barStart, _, _, numOfBeats, _, BPM = reaper.TimeMap_GetMeasureInfo(0, m-1)
	barEnd = reaper.TimeMap_GetMeasureInfo(0, m)
	barStart = barStart - globalOffset
	barEnd = barEnd - globalOffset
	meas = meas .. '"' .. m .. '": {' 
	meas = meas .. '"number":' .. m
	meas = meas .. ', "startTime": "' .. barStart .. '"'
	meas = meas .. ', "endTime": "' .. barEnd .. '"'
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


local trackCount = reaper.CountTracks(0);
local trackNumber = 0

-- FIND THE TRACK NAMED "chords" TODO make this string an option
local chordsFound = false
for i=1, trackCount do 
  local tr = reaper.GetTrack(0,i-1)
  local ok, trackName = reaper.GetTrackName(tr)
  if (trackName == "Chords" or trackName == "chords") then
    chordsFound = true
    trackNumber = i-1
  end
end
tr = reaper.GetTrack(0, trackNumber)

local offset = 0

--reaper.ShowConsoleMsg(offset)

-- Iterates all the items in the track and create a JSON objet with the list of the chords

local chordjs = "{}"
chordjs  = getChordsJson(tr, chordsFound)

--reaper.ShowConsoleMsg(chordjs .. "\n")
-------------------
-- LYRICS LIST    
-------------------


local trackNumber = 0
local lyricsFound = false
-- FIND THE TRACK NAMED "lyrics" TODO make this string an option
for i=1, trackCount do 
  local tr = reaper.GetTrack(0,i-1)
  local ok, trackName = reaper.GetTrackName(tr)
  if trackName == "lyrics" or trackName == "Lyrics" then
    lyricsFound = true
    trackNumber = i-1
  end
end
tr = reaper.GetTrack(0, trackNumber)


-- Iterates all the items in the track and create a JSON objet with the list of the chords

local lyrjs = "{"
if lyricsFound then
	local itemCount = reaper.CountTrackMediaItems(tr)
	for i=1, itemCount do
	  item = reaper.GetTrackMediaItem(tr, i-1)
	  position = reaper.GetMediaItemInfo_Value(item, "D_POSITION")
	  length = reaper.GetMediaItemInfo_Value(item, "D_LENGTH")
	  bpm = reaper.TimeMap_GetDividedBpmAtTime(position)
	  endTime = position + length
	  -- Converts time in beats
	  duration = length * (bpm / 60)
	  _, text = reaper.GetSetMediaItemInfo_String(item, "P_NOTES", '', false)
	  
	  local positionString = reaper.format_timestr_pos( position, '', 2 )
	  
	 
	  lyrjs = lyrjs .. '"' .. i .. '": { "text":'.. '"' .. jsonEscape(text) .. '"'
	  lyrjs = lyrjs .. ', "duration":'.. duration;
	  lyrjs = lyrjs .. ', "startTime":'.. position;
	  lyrjs = lyrjs .. ', "endTime":'.. endTime;
	  lyrjs = lyrjs .. '}'
	  if i<itemCount then
	    lyrjs = lyrjs .. ','
	  end
	  
	end
end
lyrjs = lyrjs .. '}'


--reaper.ShowConsoleMsg(lyrjs .. "\n")
old_json = reaper.GetExtState("reachords", "chords")

local json = "{"
json = json .. '"chords":' .. chordjs
json = json .. ', "lyrics":' .. lyrjs
json = json .. ', "bars":' .. meas
json = json .. ', "markers":' .. mark
json = json .. ', "title": "' .. jsonEscape(projectName) .. '"'
json = json .. ', "offset": "' .. offset .. '"'
json = json .. ', "globalOffset": "' .. globalOffset .. '"'
json = json .. '}'

if json ~= old_json then 
	reaper.SetExtState("reachords", "dirty", "true", false)
	
else
	reaper.SetExtState("reachords", "dirty", "false", false)
end
reaper.SetExtState("reachords", "chords", json, false)

