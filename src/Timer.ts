import { TweenService } from '@rbxts/services';

/** The Timer Instance for the TimerType.Bar */
export type TimerBar = Frame & {
    Bar: Frame;
}

/** The Timer Instance for the TimerType.Digit */
export type TimerDigit = Frame & {
    Digit: TextLabel;
}

/**
 * @enum
 * This enum represents the types of Time display that this Timer will use.
 */
export enum TimerType {
    /** The Timer on the Prompt will be displayed with a bar. */
    Bar,
    /** The Timer on the Prompt will be displayed as a TextLabel in seconds. */
    Digit
}

/**
 * @enum
 * The preset Position's of the Timer within the Prompt.
 */
export enum TimerPosition {
    /** The [TopLeft] position used for Prompt_Choice digital label mode. */
    TopLeft,
    /** The [TopRight] position used for Prompt_Choice digital label mode. */
    TopRight,
    /** The [Top] position used for a bar placed in the top above the prompt. */
    Top,
    /** The [BottomLeft] position used for `Prompt_Compact` digital label mode. */
    BottomLeft,
    /** The [BottomRight] position used for `Prompt_Compact` digital label mode. */
    BottomRight,
    /** The [Bottom] position used for a bar placed on the bottom under the prompt. */
    Bottom,
}

/**
 * **Timer**
 * 
 * 
 * The Timer class is designed to create a timer in seconds that
 * can be displayed on a Bar or with a digital TextLabel.
 */
class Timer<T extends TimerType> {
    readonly ClassName: "Timer" = "Timer";

    /** The BorderSize of the element that will be the _timeUI Parent. */
    ParentBorderSize: number = 0;

// #region INTERNAL_MEMBERS

    /**
     * @internal
     * @readonly
     * The {@link TimerType} of this Timer.
     */
    readonly _type: TimerType;

    /**
     * @internal
     * @defaultValue `0` if no start is passed to the constructor.
     * The current time in seconds of this timer.
    */
    _time: number;

    /**
     * @internal
     * This is the Instance that will represent the time for a {@link TimerType.Digit} it would be a TextLabel; {@link TimerType.Bar}.
     */
    _timeUI: T extends TimerType.Digit ? TimerDigit : TimerBar;

// #endregion

// #region PRIVATE_MEMBERS

    /**
     * @private
     * The last time that was started on this Timer. It's mainly for {@link Timer.Reset}.
     */
    private _lastStartTime: number;

    /**
     * @private
     * This is the active tween on the bar if the {@link Timer._type} is {@link TimerType.Bar}.
     */
    private _activeTween?: T extends TimerType.Bar ? Tween : undefined = undefined;

// #endregion

    /**
     * @private
     * @param _type - The type of Timer to create
     * @param start - What time the Timer should start at
     */
    constructor(_type: T,start?: number) {
        this._type = _type;
        this._time = start || 0;
        this._lastStartTime = this._time;

        if (_type === TimerType.Bar) {
            const back: Frame = new Instance("Frame");
            back.Name = "TimeUI";
            back.Size = new UDim2(1,0,0.05,0);
            back.BackgroundColor3 = Color3.fromRGB(50,50,50);

            const bar: Frame = new Instance("Frame");
            bar.Name = "Bar";
            bar.Size = new UDim2(1,0,1,0);
            bar.BackgroundColor3 = Color3.fromRGB(80,80,80);
            bar.Parent = back;

            this._timeUI = back as T extends TimerType.Digit ? TimerDigit : TimerBar;
            this.SetPosition(TimerPosition.Bottom);

        } else if(_type === TimerType.Digit) {
            const back: Frame = new Instance("Frame");
            back.Name = "TimeUI";
            back.SizeConstraint = Enum.SizeConstraint.RelativeYY;
            back.Size = new UDim2(0.1,0,0.1,0);
            back.BackgroundColor3 = Color3.fromRGB(68,68,68);

            const tl: TextLabel = new Instance("TextLabel");
            tl.Name = "Digit";
            tl.BackgroundTransparency = 1
            tl.Size = new UDim2(0.97,0,0.97,0);
            tl.AnchorPoint = new Vector2(0.5,0.5);
            tl.Position = new UDim2(0.5,0,0.5,0);
            tl.TextColor3 = Color3.fromRGB(255,255,255);
            tl.Font = Enum.Font.Code;
            tl.TextScaled = true;
            tl.Parent = back;
            
            this._timeUI = back as T extends TimerType.Digit ? TimerDigit : TimerBar;
            this.SetPosition(TimerPosition.BottomLeft);
            
        } else error("Failed to create Timer with invalid _type of TimerType: " + tostring(_type));
    }

    /**
     * Increments the time by 'n' second('s).
     * @param n - The number to increment on the Timer. Default(1)
     */
    Increment(n?: number) {
        this._time += (n || 1);
        this.updateUI();
    }

    /**
     * Decrements the time by 'n' second('s).
     * @param n - The number to decrement on the Timer. Default(1)
     */
    Decrement(n?: number) {
        if (!n) n = 1;

        if ((this._time - n) < 0) this._time = 0;
        else this._time -= n;
        
        this.updateUI();
    }

    /** This resets the Timer to the last start time. */
    Reset() {
        this._time = this._lastStartTime;

        if (this._type === TimerType.Bar) {
            // Reset the Timer bar
            this._activeTween?.Cancel();
            this._activeTween = undefined;
            this._timeUI.Size = new UDim2(1,0,1,0);
        }

        this.updateUI();
    }

    /**
     * Sets the Timer to the given time.
     * @param _time - The amount of time to set in seconds
     */
    Set(_time: number) {
        this._lastStartTime = _time;
        this._time = _time;

        if (this._type === TimerType.Bar) {
            // Reset the Timer bar
            this._activeTween?.Cancel();
            this._activeTween = undefined;
            (this._timeUI as TimerBar).Bar.Size = new UDim2(1,0,1,0);
        }

        this.updateUI();
    }

    /**
     * Sets the position of the Time UI on the prompt. See {@link TimerPosition}.
     * @param pos - The position to set
     * @returns void
     */
    SetPosition(pos: TimerPosition) {
        if (pos === TimerPosition.TopLeft) {
            // TopLeft should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to TopLeft.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(0,0);
            this._timeUI.Position = new UDim2(0.03,0,0.03,0);
        } else if (pos === TimerPosition.TopRight) {
            // TopRight should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to TopRight.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(1,0);
            this._timeUI.Position = new UDim2(0.97,0,0.03,0);
        } else if(pos === TimerPosition.Top) {
            // Top should only work with bar timers.
            if (this._type === TimerType.Digit) {
                warn("Invalid position of [TimerType.Digit] to Top.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(0,0);
            this._timeUI.Position = new UDim2(0,0,-this._timeUI.Size.Y.Scale,-(this.ParentBorderSize + 2));
        } else if (pos === TimerPosition.BottomLeft) {
            // BottomLeft should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to BottomLeft.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(0,1);
            this._timeUI.Position = new UDim2(0.03,0,0.97,0);
        } else if (pos === TimerPosition.BottomRight) {
            // BottomRight should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to BottomRight.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(1,1);
            this._timeUI.Position = new UDim2(0.97,0,0.97,0);
        } else if(pos === TimerPosition.Bottom) {
            // Bottom should only work with bar timers.
            if (this._type === TimerType.Digit) {
                warn("Invalid position of [TimerType.Digit] to Bottom.");
                return;
            }

            this._timeUI.AnchorPoint = new Vector2(0,0);
            this._timeUI.Position = new UDim2(0,0,1,this.ParentBorderSize);
        }
    }

    /** Sets the ZIndex of the Timer depending on the TimerType. */
    SetZIndex(zIndex: number) {
        if (!this._timeUI) return;

        if (this._type === TimerType.Bar) {
            const timerBar: TimerBar = this._timeUI as TimerBar;

            timerBar.ZIndex = zIndex;
            timerBar.Bar.ZIndex = zIndex + 1;
        } else if (this._type === TimerType.Digit) {
            const timerDigit: TimerDigit = this._timeUI as TimerDigit;

            timerDigit.ZIndex = zIndex;
            timerDigit.Digit.ZIndex = zIndex + 1;
        }
    }

    /** Removes references internally when use of the Timer is no longer needed. */
    Destroy() {
        if (this._timeUI) {
            this._timeUI.Destroy();
            this._timeUI = undefined!;
        }

        if (this._activeTween) {
            this._activeTween.Cancel();
            this._activeTween = undefined;
        }
    }

    /**
     * Updates the current {@link Timer._timeUI} to reflect the updated time.
     * @private
     */
    private updateUI() {
        if (this._type === TimerType.Bar) {
            const timeBar: TimerBar = this._timeUI as TimerBar;

            // If the time is 0 do not create a new tween
            if (this._time <= 0) return;

            if (this._activeTween && this._activeTween.PlaybackState === Enum.PlaybackState.Playing) return;

            this._activeTween = TweenService.Create(
                timeBar.Bar,
                new TweenInfo(
                    this._time,
                    Enum.EasingStyle.Linear,
                    Enum.EasingDirection.InOut
                ),
                {
                    Size: new UDim2(0,0,timeBar.Bar.Size.Y.Scale,0)
                }
            ) as T extends TimerType.Bar ? Tween : undefined;
            this._activeTween!.Play();
        } else if (this._type === TimerType.Digit) {
            const timerDigit = this._timeUI as TimerDigit;
        
            timerDigit.Digit.Text = tostring(this._time);
        }
    }

};

export { Timer };