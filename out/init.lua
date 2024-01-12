-- Compiled with roblox-ts v2.2.0
local TS = _G[script]
local PlayersService = TS.import(script, TS.getModule(script, "@rbxts", "services")).Players
local Signal = TS.import(script, TS.getModule(script, "@rbxts", "beacon").out).Signal
local UIResolver = TS.import(script, script, "UIResolver")
local _Timer = TS.import(script, script, "Timer")
local Timer = _Timer.default
local TimerType = _Timer.TimerType
--* The PromptTypes that can be used when creating a new Prompt object. 
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
--*The PromptPayload that is sent during accepted fullfillment of the prompt.  
local _script = script
local promptChoice = _script.PromptInstances.Prompt_Choice
local promptCompact = _script.PromptInstances.Prompt_Compact
local player = PlayersService.LocalPlayer
--* Creates the default UIListLayout inserted into Prompt._UI.content if it's a Scrolling Frame. 
local function createDefaultUIListLayout()
	local listLayout = Instance.new("UIListLayout")
	listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	listLayout.VerticalAlignment = Enum.VerticalAlignment.Top
	listLayout.ItemLineAlignment = Enum.ItemLineAlignment.Center
	listLayout.Padding = UDim.new(0.025, 0)
	listLayout.Wraps = true
	listLayout.SortOrder = Enum.SortOrder.LayoutOrder
	listLayout.FillDirection = Enum.FillDirection.Vertical
	return listLayout
end
--* Creates the default message label used for the Prompt.Message property. 
local function createDefaultMessageLabel(text)
	local messageLabel = Instance.new("TextLabel")
	messageLabel.Name = "Message"
	messageLabel.Size = UDim2.new(1, 0, 0.2, 0)
	messageLabel.Text = text
	messageLabel.TextColor3 = Color3.new(255, 255, 255)
	messageLabel.TextStrokeTransparency = 0.5
	messageLabel.TextStrokeColor3 = Color3.new(0, 0, 0)
	messageLabel.BorderSizePixel = 0
	return messageLabel
end
--* Gets the lowest layout order of all child elements if no elements are present '0' is returned. 
local function getLowestLayoutOrder(element)
	local lowestOrder = nil
	for _, child in element:GetChildren() do
		if not child:IsA("GuiObject") then
			continue
		end
		if not (lowestOrder ~= 0 and (lowestOrder == lowestOrder and lowestOrder)) then
			lowestOrder = child.LayoutOrder
		end
		if child.LayoutOrder < lowestOrder then
			lowestOrder = child.LayoutOrder
		end
	end
	return if lowestOrder ~= nil then lowestOrder else 0
end
--* Extracts content data from UI elements currently supports TextLabel & TextBox Instances.
local function extractDataFromElement(element)
	if element:IsA("Frame") or element:IsA("ScrollingFrame") then
		return extractDataFromElement(element)
	elseif element:IsA("TextLabel") or element:IsA("TextBox") then
		return element.Text
	end
	return nil
end
--* Extracts content data from a ScrollingFrame or Frame Instance children. 
local function extractDataFromContent(content, contentPayload)
	for _, child in content:GetChildren() do
		if not child:IsA("GuiObject") then
			continue
		end
		local data = extractDataFromElement(child)
		if data ~= "" and data then
			local _contentPayload = contentPayload
			local _name = child.Name
			_contentPayload[_name] = data
		end
	end
end
--* PromptOptions allow you to configure the prompts behavior. 
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
		self.timeOut = 0
		self.options = {
			destroyOnTimeout = true,
		}
		self.OnFullfill = Signal.new()
		self.OnCancel = Signal.new()
		self._triggered = false
		self._cancelled = false
		self._destroyed = false
		self._UIConnections = {}
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
			-- Create a timer for this prompt
			if self.timeOut > 1 then
				self._timer = Timer.new(TimerType.Digit, self.timeOut)
			end
		elseif promptType == PromptType.Choice then
			self.title = title
			self.message = message
			self._UI = UIResolver.new():setBG(promptChoice):setTitle(promptChoice.Title):setContent(promptChoice.Content):setAccept(promptChoice.YBtn):setDecline(promptChoice.NBtn)
			-- Create a timer for this prompt
			if self.timeOut > 1 then
				self._timer = Timer.new(TimerType.Bar, self.timeOut)
			end
		else
			error("Unknown PromptType: '" .. (tostring(promptType) .. "'"))
		end
		self._type = promptType
		self._UI.title.Text = self.title
		if self._UI.content:IsA("ScrollingFrame") then
			-- Check for a UIListLayout adding one if it doesn't exist
			local listLayout = self._UI.content:FindFirstChildOfClass("UIListLayout")
			if not listLayout then
				listLayout = createDefaultUIListLayout()
				listLayout.Parent = self._UI.content
			end
		end
		local _value = self.message
		if _value ~= "" and _value then
			-- Add a text label to the content to represent the message
			local messageLabel = createDefaultMessageLabel(self.message)
			messageLabel.LayoutOrder = getLowestLayoutOrder(self._UI.content) - 1
			messageLabel.Parent = self._UI.content
		end
		self._UI.BG.Parent = Prompt._promptsScreenUI
	end
	function Prompt:Trigger()
		-- Only trigger if not already triggered
		if self._triggered then
			return nil
		end
		self._triggered = true
		-- Show the prompt UI
		self._UI.BG.ZIndex = #Prompt._promptsScreenUI:GetChildren() + 1
		self._UI.BG.Visible = true
		local __UIConnections = self._UIConnections
		local _arg0 = self._UI.acceptBtn.MouseButton1Click:Connect(function()
			-- Clean the UI connections connections
			self:cleanConnections()
			local promptPayload = {
				prompt = self,
				promptContent = {},
			}
			extractDataFromContent(self._UI.content, promptPayload.promptContent)
			self.OnFullfill:Fire(true, promptPayload)
			self._triggered = false
		end)
		table.insert(__UIConnections, _arg0)
		local __UIConnections_1 = self._UIConnections
		local _arg0_1 = self._UI.declineBtn.MouseButton1Click:Connect(function()
			-- Clean the UI connections connections
			self:cleanConnections()
			self.OnFullfill:Fire(false)
			self._triggered = false
		end)
		table.insert(__UIConnections_1, _arg0_1)
		if self.timeOut > 1 then
			local _result = self._timer
			if _result ~= nil then
				_result:Set(self.timeOut)
			end
			task.defer(function(prompt)
				local initial = os.time()
				while prompt._triggered and (not prompt._cancelled and not prompt._destroyed) do
					if prompt._timer then
						prompt._timer:Decrement(1)
					end
					-- Check if the prompt has timed out
					if os.difftime(os.time(), initial) >= prompt.timeOut then
						prompt.OnFullfill:Fire(false)
						if prompt.options.destroyOnTimeout then
							-- Destroy the Prompt since it has timed out.
							prompt:Destroy()
						else
							break
						end
					end
					task.wait(1)
				end
			end, self)
		end
	end
	function Prompt:Cancel(reason)
		self._triggered = false
		self._cancelled = true
		self:cleanConnections()
		self.OnCancel:Fire(reason)
	end
	function Prompt:Destroy()
		self:cleanConnections()
		if self._timer then
			self._timer:Destroy()
			self._timer = nil
		end
		self._destroyed = true
	end
	function Prompt:cleanConnections()
		local __UIConnections = self._UIConnections
		local _arg0 = function(conn)
			return conn:Disconnect()
		end
		for _k, _v in __UIConnections do
			_arg0(_v, _k - 1, __UIConnections)
		end
		self._UIConnections = {}
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
	PromptType = PromptType,
	Prompt = Prompt,
	UIResolver = UIResolver,
	promptChoice = promptChoice,
	promptCompact = promptCompact,
}
