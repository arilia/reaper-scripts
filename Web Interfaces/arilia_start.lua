-- @description Reachords Start
-- @author arilia
-- @version 1.0.1
-- @link https://github.com/arilia/reaper-scripts
-- @license GPL-3.0-or-later
-- @changelog
--   Initial release
--   Change ID


local workerSectionID = 0  -- usually 0 = Main
local workerCmdID = reaper.NamedCommandLookup("_RS49fce34133949e0d9fa2711e868490836c2fa8cb")

local workerState = reaper.GetToggleCommandStateEx(workerSectionID, workerCmdID)

if workerState ~= 1 then
    -- non risulta attivo: avvialo
    reaper.Main_OnCommand(workerCmdID, 0)
end
