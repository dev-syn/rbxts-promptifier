declare enum TimerType {
    Bar = 0,
    Digit = 1
}
declare enum TimerPosition {
    /** The [TopLeft] position used for Prompt_Choice mode. */
    TopLeft = 0,
    /** The [TopRight] position used for Prompt_Choice mode. */
    TopRight = 1,
    /** The [Top] position used for a bar placed in the top above the prompt. */
    Top = 2,
    /** The [BottomLeft] position used for Prompt_Compact mode. */
    BottomLeft = 3,
    /** The [BottomRight] position used for Prompt_Compact mode. */
    BottomRight = 4,
    /** The [Bottom] position used for a bar placed on the bottom under the prompt. */
    Bottom = 5
}
declare class Timer {
    readonly ClassName: "Timer";
    readonly _type: TimerType;
    /** The last started time of this Timer. */
    _lastStartTime: number;
    /** The current time in seconds of this timer. */
    _time: number;
    private _timeUI;
    private _activeTween;
    constructor(_type: TimerType, start?: number);
    /** Increments the time by 'n' second('s). */
    Increment(n?: number): void;
    /** Decrements the time by 'n' second('s). */
    Decrement(n?: number): void;
    /** This method resets the time to the last set time. */
    Reset(): void;
    /** Sets the current time of this Timer. */
    Set(_time: number): void;
    /** Sets the position of the Time UI on the prompt. */
    SetPosition(pos: TimerPosition): void;
    /** Removes references internally from Timer when use of the Timer is no longer needed. */
    Destroy(): void;
    private updateUI;
}
export { Timer as default, TimerType, TimerPosition };
