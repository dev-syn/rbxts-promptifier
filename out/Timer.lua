-- Compiled with roblox-ts v2.2.0
local TS = _G[script]
local TweenService = TS.import(script, TS.getModule(script, "@rbxts", "services")).TweenService
local TimerType
do
	local _inverse = {}
	TimerType = setmetatable({}, {
		__index = _inverse,
	})
	TimerType.Bar = 0
	_inverse[0] = "Bar"
	TimerType.Digit = 1
	_inverse[1] = "Digit"
end
local TimerPosition
do
	local _inverse = {}
	TimerPosition = setmetatable({}, {
		__index = _inverse,
	})
	TimerPosition.TopLeft = 0
	_inverse[0] = "TopLeft"
	TimerPosition.TopRight = 1
	_inverse[1] = "TopRight"
	TimerPosition.Top = 2
	_inverse[2] = "Top"
	TimerPosition.BottomLeft = 3
	_inverse[3] = "BottomLeft"
	TimerPosition.BottomRight = 4
	_inverse[4] = "BottomRight"
	TimerPosition.Bottom = 5
	_inverse[5] = "Bottom"
end
local Timer
do
	Timer = setmetatable({}, {
		__tostring = function()
			return "Timer"
		end,
	})
	Timer.__index = Timer
	function Timer.new(...)
		local self = setmetatable({}, Timer)
		return self:constructor(...) or self
	end
	function Timer:constructor(_type, start)
		self.ClassName = "Timer"
		self._activeTween = nil
		self._type = _type
		local _condition = start
		if not (_condition ~= 0 and (_condition == _condition and _condition)) then
			_condition = 0
		end
		self._time = _condition
		self._lastStartTime = self._time
		if _type == TimerType.Bar then
			local back = Instance.new("Frame")
			back.Name = "TimeUI"
			back.Size = UDim2.new(1, 0, 0.15, 0)
			back.BackgroundColor3 = Color3.fromRGB(68, 68, 68)
			local bar = Instance.new("Frame")
			bar.Name = "Bar"
			bar.Size = UDim2.new(1, 0, 1, 0)
			back.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
			bar.Parent = back
			self._timeUI = back
		elseif _type == TimerType.Digit then
			local tl = Instance.new("TextLabel")
			tl.Name = "TimeUI"
			self._timeUI = tl
		else
			error("Failed to create Timer with invalid _type of TimerType: " .. tostring(_type))
		end
	end
	function Timer:Increment(n)
		local _condition = n
		if not (_condition ~= 0 and (_condition == _condition and _condition)) then
			_condition = 1
		end
		self._time += _condition
		self:updateUI()
	end
	function Timer:Decrement(n)
		if not (n ~= 0 and (n == n and n)) then
			n = 1
		end
		if (self._time - n) < 0 then
			self._time = 0
		else
			self._time -= n
		end
		self:updateUI()
	end
	function Timer:Reset()
		self._time = self._lastStartTime
		if self._type == TimerType.Bar then
			-- Reset the Timer bar
			local _result = self._activeTween
			if _result ~= nil then
				_result:Cancel()
			end
			self._activeTween = nil
			self._timeUI.Size = UDim2.new(1, 0, 1, 0)
		end
		self:updateUI()
	end
	function Timer:Set(_time)
		self._lastStartTime = _time
		self._time = _time
		if self._type == TimerType.Bar then
			-- Reset the Timer bar
			local _result = self._activeTween
			if _result ~= nil then
				_result:Cancel()
			end
			self._activeTween = nil
			self._timeUI.Size = UDim2.new(1, 0, 1, 0)
		end
		self:updateUI()
	end
	function Timer:SetPosition(pos)
		if pos == TimerPosition.TopLeft then
			-- TopLeft should only work with digital timers.
			if self._type == TimerType.Bar then
				warn("Invalid position of [TimerType.Bar] to TopLeft.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(0, 0)
			self._timeUI.Position = UDim2.new(0.03, 0, 0.03, 0)
			self._timeUI.Visible = true
		elseif pos == TimerPosition.TopRight then
			-- TopRight should only work with digital timers.
			if self._type == TimerType.Bar then
				warn("Invalid position of [TimerType.Bar] to TopRight.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(1, 0)
			self._timeUI.Position = UDim2.new(0.97, 0, 0.03, 0)
			self._timeUI.Visible = true
		elseif pos == TimerPosition.Top then
			-- Top should only work with bar timers.
			if self._type == TimerType.Digit then
				warn("Invalid position of [TimerType.Digit] to Top.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(0.5, 0)
			self._timeUI.Position = UDim2.new(0.5, 0, -self._timeUI.Size.Y.Scale, 0)
			self._timeUI.Visible = true
		elseif pos == TimerPosition.BottomLeft then
			-- BottomLeft should only work with digital timers.
			if self._type == TimerType.Bar then
				warn("Invalid position of [TimerType.Bar] to BottomLeft.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(0, 1)
			self._timeUI.Position = UDim2.new(0.03, 0, 0.97, 0)
			self._timeUI.Visible = true
		elseif pos == TimerPosition.BottomRight then
			-- BottomRight should only work with digital timers.
			if self._type == TimerType.Bar then
				warn("Invalid position of [TimerType.Bar] to BottomRight.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(1, 1)
			self._timeUI.Position = UDim2.new(0.97, 0, 0.97, 0)
			self._timeUI.Visible = true
		elseif pos == TimerPosition.Bottom then
			-- Bottom should only work with bar timers.
			if self._type == TimerType.Digit then
				warn("Invalid position of [TimerType.Digit] to Bottom.")
				return nil
			end
			self._timeUI.Visible = false
			self._timeUI.AnchorPoint = Vector2.new(0.5, 0)
			self._timeUI.Position = UDim2.new(0.5, 0, 1, 0)
			self._timeUI.Visible = true
		end
	end
	function Timer:Destroy()
		if self._timeUI then
			self._timeUI:Destroy()
			self._timeUI = nil
		end
		if self._activeTween then
			self._activeTween:Cancel()
			self._activeTween = nil
		end
	end
	function Timer:updateUI()
		if self._type == TimerType.Bar then
			local bar = self._timeUI:FindFirstChild("Bar")
			assert(bar, "Bar Frame is not assigned could not updateUI for TimerType.Bar")
			-- If the time is 0 do not create a new tween
			if self._time <= 0 then
				return nil
			end
			if self._activeTween and self._activeTween.PlaybackState == Enum.PlaybackState.Playing then
				return nil
			end
			self._activeTween = TweenService:Create(bar, TweenInfo.new(self._time, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut), {
				Size = UDim2.new(0, 0, 1, 0),
			})
		elseif self._type == TimerType.Digit then
			(self._timeUI).Text = tostring(self._time)
		end
	end
end
return {
	default = Timer,
	TimerType = TimerType,
	TimerPosition = TimerPosition,
}
