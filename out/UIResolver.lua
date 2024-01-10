-- Compiled with roblox-ts v2.2.0
local function isOfInstance(obj, instType)
	local _condition = obj
	if _condition ~= 0 and (_condition == _condition and (_condition ~= "" and _condition)) then
		local _obj = obj
		_condition = typeof(_obj) == "Instance"
		if _condition then
			_condition = obj:IsA(instType)
		end
	end
	return _condition
end
--* A utility class that allows you to patch any prompt designs into the Prompt class essentially mapping your custom elements into the expected structure. 
local UIResolver
do
	UIResolver = setmetatable({}, {
		__tostring = function()
			return "UIResolver"
		end,
	})
	UIResolver.__index = UIResolver
	function UIResolver.new(...)
		local self = setmetatable({}, UIResolver)
		return self:constructor(...) or self
	end
	function UIResolver:constructor()
	end
	function UIResolver:setBG(bg)
		self.BG = bg
		return self
	end
	function UIResolver:setTitle(tl)
		self.title = tl
		return self
	end
	function UIResolver:setContent(frame)
		self.content = frame
		return self
	end
	function UIResolver:setAccept(btn)
		self.acceptBtn = btn
		return self
	end
	function UIResolver:setDecline(btn)
		self.declineBtn = btn
		return self
	end
	function UIResolver:validate()
		local bg = self.BG
		local _arg0 = isOfInstance(bg, "Frame")
		assert(_arg0, "BG must be a Frame Instance.")
		local title = self.title
		local _arg0_1 = isOfInstance(title, "TextLabel")
		assert(_arg0_1, "Title must be a TextLabel Instance.")
		local content = self.content
		local _arg0_2 = isOfInstance(content, "ScrollingFrame") or isOfInstance(content, "Frame")
		assert(_arg0_2, "Content must be a ScrollingFrame or a Frame Instance.")
		local acceptBtn = self.acceptBtn
		local _arg0_3 = isOfInstance(acceptBtn, "TextButton") or isOfInstance(acceptBtn, "ImageButton")
		assert(_arg0_3, "AcceptBtn must be a TextButton or a ImageButton Instance.")
		local declineBtn = self.declineBtn
		local _arg0_4 = isOfInstance(declineBtn, "TextButton") or isOfInstance(declineBtn, "ImageButton")
		assert(_arg0_4, "DeclineBtn must be a TextButton or a ImageButton Instance.")
	end
end
return UIResolver
