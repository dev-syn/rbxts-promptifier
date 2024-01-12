import { TweenService } from '@rbxts/services';

/**
 * @enum
 * This enum represents the types of Time display that this Timer will use.
 */
enum TimerType {
    /** The Timer on the Prompt will be displayed with a bar. */
    Bar,
    /** The Timer on the Prompt will be displayed as a TextLabel in seconds. */
    Digit
};

/**
 * @enum
 * The preset Position's of the Timer within the Prompt.
 */
enum TimerPosition {
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
class Timer {
    readonly ClassName: "Timer" = "Timer";
    /**
     * @internal
     * @readonly
     * The {@link TimerType} of this Timer.
     */
    readonly _type: TimerType;

    /**
     * @defaultValue `0` if no start is passed to the constructor.
     * The current time in seconds of this timer.
    */
    _time: number;

    /**
     * @private
     * The last time that was started on this Timer. It's mainly for {@link Timer.Reset}.
     */
    private _lastStartTime: number;

    /**
     * @private
     * This represents the actual Instances of the TimerType a TextLabel for digital and a Frame for a Bar.
     */
    private _timeUI: TextLabel | Frame;

    /**
     * @private
     * This is the active tween on the bar if the {@link Timer._type} is {@link Timer.TimerType}.
     */
    private _activeTween: Tween | undefined = undefined;

    /**
     * @private
     * @param _type - The type of Timer to create
     * @param start - What time the Timer should start at
     */
    constructor(_type: TimerType,start?: number) {
        this._type = _type;
        this._time = start || 0;
        this._lastStartTime = this._time;

        if (_type === TimerType.Bar) {
            const back: Frame = new Instance("Frame");
            back.Name = "TimeUI";
            back.Size = new UDim2(1,0,0.15,0);
            back.BackgroundColor3 = Color3.fromRGB(68,68,68);

            const bar: Frame = new Instance("Frame");
            bar.Name = "Bar";
            bar.Size = new UDim2(1,0,1,0);
            back.BackgroundColor3 = Color3.fromRGB(50,50,50);
            bar.Parent = back;

            this._timeUI = back;

        } else if(_type === TimerType.Digit) {
            const tl: TextLabel = new Instance("TextLabel");
            tl.Name = "TimeUI";
            
            this._timeUI = tl;
            
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
            this._timeUI.Size = new UDim2(1,0,1,0);
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

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(0,0);
            this._timeUI.Position = new UDim2(0.03,0,0.03,0);
            this._timeUI.Visible = true;
        } else if (pos === TimerPosition.TopRight) {
            // TopRight should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to TopRight.");
                return;
            }

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(1,0);
            this._timeUI.Position = new UDim2(0.97,0,0.03,0);
            this._timeUI.Visible = true;
        } else if(pos === TimerPosition.Top) {
            // Top should only work with bar timers.
            if (this._type === TimerType.Digit) {
                warn("Invalid position of [TimerType.Digit] to Top.");
                return;
            }

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(0.5,0);
            this._timeUI.Position = new UDim2(0.5,0,-this._timeUI.Size.Y.Scale,0);
            this._timeUI.Visible = true;
        } else if (pos === TimerPosition.BottomLeft) {
            // BottomLeft should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to BottomLeft.");
                return;
            }

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(0,1);
            this._timeUI.Position = new UDim2(0.03,0,0.97,0);

            this._timeUI.Visible = true;
        } else if (pos === TimerPosition.BottomRight) {
            // BottomRight should only work with digital timers.
            if (this._type === TimerType.Bar) {
                warn("Invalid position of [TimerType.Bar] to BottomRight.");
                return;
            }

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(1,1);
            this._timeUI.Position = new UDim2(0.97,0,0.97,0);
            this._timeUI.Visible = true;
        } else if(pos === TimerPosition.Bottom) {
            // Bottom should only work with bar timers.
            if (this._type === TimerType.Digit) {
                warn("Invalid position of [TimerType.Digit] to Bottom.");
                return;
            }

            this._timeUI.Visible = false;
            this._timeUI.AnchorPoint = new Vector2(0.5,0);
            this._timeUI.Position = new UDim2(0.5,0,1,0);
            this._timeUI.Visible = true;
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
     * @returns void
     */
    private updateUI() {
        if (this._type === TimerType.Bar) {
            const bar: Frame | undefined = this._timeUI.FindFirstChild("Bar") as Frame | undefined;
            assert(bar,"Bar Frame is not assigned could not updateUI for TimerType.Bar");

            // If the time is 0 do not create a new tween
            if (this._time <= 0) return;

            if (this._activeTween && this._activeTween.PlaybackState === Enum.PlaybackState.Playing) return;

            this._activeTween = TweenService.Create(
                bar,
                new TweenInfo(
                    this._time,
                    Enum.EasingStyle.Linear,
                    Enum.EasingDirection.InOut
                ),
                {
                    Size: new UDim2(0,0,1,0)
                }
            ); 
        } else if (this._type === TimerType.Digit) {
            (this._timeUI as TextLabel).Text = tostring(this._time);
        }
    }

};

export { Timer, TimerType, TimerPosition };