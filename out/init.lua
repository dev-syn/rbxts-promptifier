-- Compiled with roblox-ts v2.2.0
local TS = _G[script]
local PlayersService = TS.import(script, TS.getModule(script, "@rbxts", "services")).Players
local Signal = TS.import(script, TS.getModule(script, "@rbxts", "beacon").out).Signal
local UIResolver = TS.import(script, script, "UIResolver")
local PromptType
do
	local _inverse = {}
	PromptType = setmetatable({}, {
		__index = _inverse,
	})
	PromptType.Custom = "Custom"
	_inverse.Custom = "Custom"
	PromptType.Compact = "Compact"
	_inverse.Compact = "Compact"
	PromptType.Choice = "Choice"
	_inverse.Choice = "Choice"
end
local _script = script
local promptChoice = _script.PromptInstances.Prompt_Choice
local promptCompact = _script.PromptInstances.Prompt_Compact
local player = PlayersService.LocalPlayer
local Prompt
do
	Prompt = setmetatable({}, {
		__tostring = function()
			return "Prompt"
		end,
	})
	Prompt.__index = Prompt
	function Prompt.new(...)
		local self = setmetatable({}, Prompt)
		return self:constructor(...) or self
	end
	function Prompt:constructor(promptType, title, message, UI)
		self.timeOut = -1
		self.OnFullfill = Signal.new()
		self.OnCancel = Signal.new()
		self._cancelled = false
		if promptType == PromptType.Custom then
			self.title = title
			self.message = message
			-- Validate the UI
			if not UI then
				error("UIResolver must be given when using custom prompt type.")
			end
			UI:validate()
			self._UI = UI
		elseif promptType == PromptType.Compact then
			self.title = title
			self.message = message
			self._UI = UIResolver.new():setBG(promptCompact):setTitle(promptCompact.Title):setContent(promptCompact.Content):setAccept(promptCompact.ConfirmBtn):setDecline(promptCompact.CloseBtn)
		elseif promptType == PromptType.Choice then
			self.title = title
			self.message = message
			self._UI = UIResolver.new():setBG(promptChoice):setTitle(promptChoice.Title):setContent(promptChoice.Content):setAccept(promptChoice.YBtn):setDecline(promptChoice.NBtn)
		else
			error("Unknown PromptType: '" .. (tostring(promptType) .. "'"))
		end
		self._UI.BG.Parent = Prompt._promptsScreenUI
	end
	function Prompt:trigger(payloadMap)
		-- Show the prompt UI
		self._UI.BG.LayoutOrder = #Prompt._promptsScreenUI:GetChildren() + 1
		self._UI.BG.Visible = true
		return TS.Promise.new(function(resolve, reject)
			self._UI.acceptBtn.MouseButton1Click:Connect(function()
				self.OnFullfill:Fire(true)
			end)
			self._UI.declineBtn.MouseButton1Click:Connect(function()
				self.OnFullfill:Fire(false)
			end)
		end)
	end
	function Prompt:cancel(reason)
		self._cancelled = true
		self.OnCancel:Fire(reason)
	end
	Prompt.ClassName = "Prompt"
	Prompt._promptsScreenUI = Instance.new("ScreenGui")
	do
		Prompt._promptsScreenUI.Name = "Prompts"
		Prompt._promptsScreenUI.ResetOnSpawn = false
		-- Try to have it so the prompts are drawn above every other UI
		Prompt._promptsScreenUI.DisplayOrder = 5000
		local _exp = TS.Promise.promisify(function()
			return player:WaitForChild("PlayerGui", 25)
		end)()
		local _arg0 = function(playerGui)
			Prompt._promptsScreenUI.Parent = playerGui
		end
		_exp:andThen(_arg0):catch(function(reason)
			return warn("Yield timed out for 'PlayerGui' in Prompts with: " .. tostring(reason))
		end)
	end
end
return {
	Prompt = Prompt,
	PromptType = PromptType,
	promptChoice = promptChoice,
	promptCompact = promptCompact,
}
