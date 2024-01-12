/**
 * @enum
 * This enum represents the types of Time display that this Timer will use.
 */
declare enum TimerType {
    /** The Timer on the Prompt will be displayed with a bar. */
    Bar = 0,
    /** The Timer on the Prompt will be displayed as a TextLabel in seconds. */
    Digit = 1
}
/**
 * @enum
 * The preset Position's of the Timer within the Prompt.
 */
declare enum TimerPosition {
    /** The [TopLeft] position used for Prompt_Choice digital label mode. */
    TopLeft = 0,
    /** The [TopRight] position used for Prompt_Choice digital label mode. */
    TopRight = 1,
    /** The [Top] position used for a bar placed in the top above the prompt. */
    Top = 2,
    /** The [BottomLeft] position used for `Prompt_Compact` digital label mode. */
    BottomLeft = 3,
    /** The [BottomRight] position used for `Prompt_Compact` digital label mode. */
    BottomRight = 4,
    /** The [Bottom] position used for a bar placed on the bottom under the prompt. */
    Bottom = 5
}
/**
 * **Timer**
 *
 *
 * The Timer class is designed to create a timer in seconds that
 * can be displayed on a Bar or with a digital TextLabel.
 */
declare class Timer {
    readonly ClassName: "Timer";
    /**
     * @internal
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
    private _lastStartTime;
    /**
     * @private
     * This represents the actual Instances of the TimerType a TextLabel for digital and a Frame for a Bar.
     */
    private _timeUI;
    /**
     * @private
     * This is the active tween on the bar if the {@link Timer._type} is {@link Timer.TimerType}.
     */
    private _activeTween;
    /**
     *
     * @param _type - The type of Timer to create
     * @param start - What time the Timer should start at
     * @returns default - The Timer object
     */
    constructor(_type: TimerType, start?: number);
    /**
     * Increments the time by 'n' second('s).
     * @param n - The number to increment on the Timer. Default(1)
     */
    Increment(n?: number): void;
    /**
     * Decrements the time by 'n' second('s).
     * @param n - The number to decrement on the Timer. Default(1)
     */
    Decrement(n?: number): void;
    /** This resets the Timer to the last start time. */
    Reset(): void;
    /**
     * Sets the Timer to the given time.
     * @param _time - The amount of time to set in seconds
     */
    Set(_time: number): void;
    /**
     * Sets the position of the Time UI on the prompt. See {@link TimerPosition}.
     * @param pos - The position to set
     * @returns void
     */
    SetPosition(pos: TimerPosition): void;
    /** Removes references internally when use of the Timer is no longer needed. */
    Destroy(): void;
    /**
     * Updates the current {@link Timer._timeUI} to reflect the updated time.
     * @private
     * @returns void
     */
    private updateUI;
}
export { Timer, TimerType, TimerPosition };
