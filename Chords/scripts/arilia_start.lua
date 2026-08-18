-- @description Reachords Start
-- @author arilia
-- @version 1.0.0
-- @link https://github.com/arilia/reaper-scripts
-- @license GPL-3.0-or-later
-- @changelog
--   Initial release

local workerSectionID = 0  -- usually 0 = Main
local workerCmdID = reaper.NamedCommandLookup("_RS2db92f0a1ab88f79fafb683fb9116d1ab6c097c7")

local workerState = reaper.GetToggleCommandStateEx(workerSectionID, workerCmdID)

if workerState ~= 1 then
    -- non risulta attivo: avvialo
    reaper.Main_OnCommand(workerCmdID, 0)
end
