local workerSectionID = 0  -- di solito 0 = Main
local workerCmdID = reaper.NamedCommandLookup("_RS2db92f0a1ab88f79fafb683fb9116d1ab6c097c7")

local workerState = reaper.GetToggleCommandStateEx(workerSectionID, workerCmdID)

if workerState ~= 1 then
    -- non risulta attivo: avvialo
    reaper.Main_OnCommand(workerCmdID, 0)
end
