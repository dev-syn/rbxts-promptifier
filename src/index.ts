import { Players as PlayersService } from '@rbxts/services';
import { Signal } from '@rbxts/beacon';

import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import { UIResolver } from './UIResolver';
import { Timer, TimerPosition, TimerType } from './Timer';

const MODULE_PREFIX: "[Promptifier]:" = "[Promptifier]:";

/**
 * @category Prompt
 * The PromptTypes that can be used when creating a new Prompt object.
 */
export enum PromptType {
    /** The custom mode can include any prompt UI but must have it's elements linked to the Prompt Instance. */
    Custom = "Custom",
    /** The Compact mode includes a close button at the top right with a confirm button in the bottom middle. */
    Compact = "Compact",
    /** The Choice mode includes a title with a message box and a accept or decline button next to each other at the bottom. */
    Choice = "Choice"
}

/**
 * @category Prompt
 * The PromptPayload that is sent during accepted fullfillment of the prompt.
 * @example
 * ```
 * prompt.OnFulfill.Connect((accepted: boolean,payload?: PromptPayload) => {
 *     if (accepted && payload) {
 *         print(payload.promptContent);
 *     }
 * });
 * ```
 * 
 * Assuming we had a Prompt with a ScrollingFrame as the Content
 * and it contains 1 TextLabel named 'Money' and 1 TextBox named 'Nickname'
 * 
 * Your output would look like this
 * ```
 * {
 *     ["Money"] = "350",
 *     ["Nickname"] = "Jen"
 * }
 * ```
 */
export type PromptPayload<TimerT extends TimerType | null = null> = {
    /** The Prompt that this payload belongs too. */
    prompt: Prompt<TimerT>;
    /** A map of the extracted content of this prompt. { [InstanceName]: Content } */
    promptContent: Map<string,string>;
}

const promptChoice: Prompt_Choice = script.FindFirstChild("PromptInstances")!.FindFirstChild("Prompt_Choice") as Prompt_Choice;
const promptCompact: Prompt_Compact = script.FindFirstChild("PromptInstances")!.FindFirstChild("Prompt_Compact") as Prompt_Compact;

const player: Player = PlayersService.LocalPlayer;

/** Creates the default UIListLayout inserted into Prompt._UI.content if it's a Scrolling Frame. */
function createDefaultUIListLayout(): UIListLayout {
    const listLayout: UIListLayout = new Instance("UIListLayout");
    listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center;
    listLayout.VerticalAlignment = Enum.VerticalAlignment.Top;
    listLayout.ItemLineAlignment = Enum.ItemLineAlignment.Center;
    listLayout.Padding = new UDim(0.025,0);
    listLayout.Wraps = true;
    listLayout.SortOrder = Enum.SortOrder.LayoutOrder;
    listLayout.FillDirection = Enum.FillDirection.Vertical;
    return listLayout;
}

/** Creates the default message label used for the Prompt.Message property. */
function createDefaultMessageLabel(text: string): TextLabel {
    const messageLabel: TextLabel = new Instance("TextLabel");
    messageLabel.Name = "Message";
    messageLabel.Size = new UDim2(1,0,0.2,0);
    messageLabel.Text = text;
    messageLabel.TextColor3 = new Color3(255,255,255);
    messageLabel.TextStrokeTransparency = 0.5;
    messageLabel.TextStrokeColor3 = new Color3(0,0,0);
    messageLabel.BorderSizePixel = 0;
    return messageLabel;
}

/** Gets the lowest layout order of all child elements if no elements are present '0' is returned. */
function getLowestLayoutOrder(element: GuiObject): number {
    let lowestOrder: number | undefined = undefined;
    for (const child of element.GetChildren()) {
        if (!child.IsA("GuiObject")) continue;

        if (!lowestOrder) lowestOrder = child.LayoutOrder;
        if (child.LayoutOrder < lowestOrder) lowestOrder = child.LayoutOrder;
    }
    return lowestOrder !== undefined ? lowestOrder : 0;
}

/** Extracts content data from UI elements currently supports TextLabel & TextBox Instances.*/
function extractDataFromElement(element: GuiObject,contentPayload: Map<string,string>): string | undefined {
    if (element.IsA("Frame") || element.IsA("ScrollingFrame")) extractDataFromContent(element,contentPayload);
    else if (element.IsA("TextLabel") || element.IsA("TextBox")) return element.Text;
    return undefined;
}

/** Extracts content data from a ScrollingFrame or Frame Instance children. */
function extractDataFromContent(content: ScrollingFrame | Frame,contentPayload: Map<string,string>): void {
    for (const child of content.GetChildren()) {
        if (!child.IsA("GuiObject")) continue;

        const data: string | undefined = extractDataFromElement(child,contentPayload);
        if (data) contentPayload.set(child.Name,data);
    }
}

function getPromptsScreenGui(): ScreenGui {
    const playerGui: PlayerGui | undefined = player.FindFirstChildWhichIsA("PlayerGui");
    if (!playerGui) error(`${MODULE_PREFIX} No PlayerGui can be found.`);

    let _promptsScreenUI: ScreenGui | undefined = playerGui.FindFirstChild("Prompts") as ScreenGui | undefined;
    if (!_promptsScreenUI) {
        _promptsScreenUI = new Instance("ScreenGui");
        _promptsScreenUI.Name = "Prompts";
        _promptsScreenUI.ResetOnSpawn = false;
        // Try to have it so the prompts are drawn above every other UI
        _promptsScreenUI.DisplayOrder = 5000;
        _promptsScreenUI.Parent = playerGui;
    }
    return _promptsScreenUI;
}

/**
 * @enum {number}
 * This is an enum of the TimeoutBehavior which contains behaviour for when the Prompt times out.
 */
enum TimeoutBehavior {
    /** The Prompt will be cancelled when timed out. This will call the @see {@link Prompt.OnCancel} event. */
    CancelOnTimeout,
    /** The Prompt will be rejected when timed out. This will call the @see {@link Prompt.OnFullfilled} event with accepted as declined(false). */
    RejectOnTimeout
}

/**
 * @category Prompt
 * @interface
 * PromptOptions allow you to configure the prompts behavior.
 */
export interface PromptOptions {

    /** When the Prompt is timed out it will then also be destroyed. Default(true) */
    destroyOnTimeout: boolean;

    /** Controls the behavior when the Prompt is timed out @see {TimeoutBehavior} */
    timeoutBehavior: TimeoutBehavior;
}

/**
 * @category Prompt
 * The main class used to create & use Prompts.
 */
class Prompt<T extends TimerType | null = null> {
    static ClassName: string = "Prompt";
    static _promptsScreenUI?: ScreenGui;

    /** 
     * @public
     * The title of the Prompt.
     */
    title: string;
    /**
     * @public
     * The message of the Prompt. This is optional and when toggled a TextLabel
     * will be added to content for you with your specified message.
     */
    message?: string;
    /**
     * @defaultValue `0` No timeout will be present, and the prompt will function indefinitely until Destroyed.
     * The timeout of this Prompt, when a prompt times out it will fullfill as declined.
     */
    timeOut: number = 0;

    /** The configurable options of this Prompt. See {@link PromptOptions}*/
    options: PromptOptions = {
        destroyOnTimeout: true,
        timeoutBehavior: TimeoutBehavior.RejectOnTimeout
    };

    /**
     * A property that is meant to store a validate function
     * that will be fired before Prompt.OnFulfill is called; and will
     * only be called if this function returns true.
     * @param payload - The PromptPayload data of the Prompt.
     * @returns boolean - True if the prompt payload is valid, false otherwise.
     */
    Validator?: (payload: PromptPayload<T>) => boolean;

// #region Events

    /**
     * @event
     * This event is fired when an input or timeout is received.
     */
    OnFulfill: Signal<[accepted: boolean,payload?: PromptPayload<T>]> = new Signal();

    /** 
     * @event 
     * This event is fired when a prompt is cancelled for external reasons.
     */
    OnCancel: Signal<[reason?: string]> = new Signal();

// #endregion

// #region private_members

    /**
     * @private
     * The type of this Prompt.
     */
    private _type: PromptType;

    /**
     * @private
     * The {@link Timer} of this Prompt used for time management.
     */
    private _timer?: T extends TimerType ? Timer<T> : undefined;

    /** 
     * @private
     * @readonly
     * Whether the Prompt is already triggered or not.
     */
    private _triggered: boolean = false;

    /** 
     * @private
     * @readonly
     * Whether the Prompt was cancelled or not.
     */
    private _cancelled: boolean = false;

    /** 
     * @private
     * @readonly
     * Whether the Prompt has been destroyed or not.
     */
    private _destroyed: boolean = false;

    /**
     * @private
     * @readonly
     * This Prompts {@link UIResolver}.
     */
    private _UI: UIResolver;
    private _UIConnections: RBXScriptConnection[] = [];

// #endregion

    /**
     * 
     * @param promptType - {@link PromptType.Custom}
     * @param title - The title of this Prompt.
     * @param message - The message of this Prompt or undefined for no message.
     * @param UI - The UIResolver that is provided to link custom instances to the intended structure.
     */
    constructor(promptType: PromptType.Custom,title: string,message: string | undefined,UI: UIResolver);
    constructor(promptType: PromptType.Compact,title: string,message: string | undefined);
    constructor(promptType: PromptType.Choice,title: string,message: string | undefined);
    constructor(promptType: PromptType,title: string,message: string | undefined,UI?: UIResolver) {

        this.title = title;
        this.message = message;

        if (promptType === PromptType.Custom) {

            // If the prompt is custom validate it
            if (!UI) error("UIResolver must be given when using custom prompt type.");

            UI.validate();
            this._UI = UI;
        } else if (promptType === PromptType.Compact) {

            const _promptCompact: Prompt_Compact = promptCompact.Clone();

            const resolver: UIResolver = new UIResolver();
            const isResolvable: boolean = resolver.resolve({
                BG: _promptCompact,
                title: _promptCompact.Title,
                content: _promptCompact.Content,
                acceptBtn: _promptCompact.ConfirmBtn,
                declineBtn: _promptCompact.CloseBtn
            });

            if (!isResolvable) error("Failed to resolve UI Structure for prompt 'Compact' type.");
            this._UI = resolver;

        } else if (promptType === PromptType.Choice) {

            const _promptChoice: Prompt_Choice = promptChoice.Clone();

            const resolver: UIResolver = new UIResolver();
            const isResolvable: boolean = resolver.resolve({
                BG: _promptChoice,
                title: _promptChoice.Title,
                content: _promptChoice.Content,
                acceptBtn: _promptChoice.YBtn,
                declineBtn: _promptChoice.NBtn
            });

            if (!isResolvable) error("Failed to resolve UI Structure for prompt 'Choice' type.");
            this._UI = resolver;
        } else error(`Unknown PromptType: '${promptType}'`);

        this._type = promptType;
        this._UI.title.Text = this.title;

        if (this._UI.content.IsA("ScrollingFrame")) {

            // Check for a UIListLayout adding one if it doesn't exist
            let listLayout: UIListLayout | undefined = this._UI.content.FindFirstChildOfClass("UIListLayout");
            if (!listLayout) {
                listLayout = createDefaultUIListLayout();
                listLayout.Parent = this._UI.content;
            }
        }

        // Check if a message is present for this prompt
        if (this.message) {

            // Add a text label to the content to represent the message
            const messageLabel: TextLabel = createDefaultMessageLabel(this.message);
            messageLabel.LayoutOrder = getLowestLayoutOrder(this._UI.content) - 1;
            messageLabel.Parent = this._UI.content;

        }

        // Assign this UI to the Prompts ScreenGui
        if (!Prompt._promptsScreenUI) Prompt._promptsScreenUI = getPromptsScreenGui();
        this._UI.BG.Parent = Prompt._promptsScreenUI;
    }

    /**
     * Triggers the prompt showing the prompt on top of the players screen.
     * If a time out is specified, a timer will start if no input is given
     * and the prompt will auto-fullfill with a declined status.
     */
    Trigger() {
        // Only trigger if not already triggered
        if (this._triggered) return;

        this._triggered = true;

        // Adjust the ZIndex for this Prompt
        this._UI.BG.ZIndex = Prompt._promptsScreenUI!.GetChildren().size() + 1;
        this._UI.assignZIndex();

        const incrementedZIndex: number = this._UI.BG.ZIndex + 1;
        this._UI.content.ZIndex = incrementedZIndex;

        // For each GuiObject in content; assign ZIndex + 1
        (this._UI.content.GetChildren().filter(child => child.IsA("GuiObject")) as GuiObject[]).forEach(child => child.ZIndex = incrementedZIndex + 1);

        this._UIConnections.push(
            this._UI.acceptBtn.MouseButton1Click.Connect(() => {
                print(`${MODULE_PREFIX} Prompt has been accepted!`);

                // Clean the UI connections connections
                this.cleanConnections();

                const promptPayload: PromptPayload<T> = {
                    prompt: this,
                    promptContent: new Map()
                };
                extractDataFromContent(this._UI.content,promptPayload.promptContent);

                // If the Prompt is not validated or cancelled during validation then return.
                if (this.Validator) {
                    const validated: boolean = this.Validator(promptPayload);
                    if (!validated) {
                        warn("Prompt could not be validated.");
                        return;
                    }
                    if (this._cancelled) return;
                }

                this._UI.BG.Visible = false;
                this.OnFulfill.Fire(true,promptPayload);
                this._triggered = false;
            })
        );
        

        // Listen for when the prompt is declined
        this._UIConnections.push(
            this._UI.declineBtn.MouseButton1Click.Connect(() => {
                print(`${MODULE_PREFIX} Prompt has been declined!`);
                // Clean the UI connections connections
                this.cleanConnections();

                this._UI.BG.Visible = false;
                this.OnFulfill.Fire(false);
                this._triggered = false;
            })
        );
// #region TIMEOUT_HANDLER

        if (this.timeOut > 1) {

            // Create a timer for this prompt
            if (!this._timer) {
                if (this._type === PromptType.Choice) {
                    this._timer = new Timer<TimerType.Bar>(TimerType.Bar,this.timeOut) as T extends TimerType ? Timer<T> : undefined;
                    this._timer!.parentBorderSize = this._UI.BG.BorderSizePixel;
                    this._timer!.SetPosition(TimerPosition.Bottom);
                } else if (this._type === PromptType.Compact) {
                    this._timer = new Timer<TimerType.Digit>(TimerType.Digit,this.timeOut) as T extends TimerType ? Timer<T> : undefined;
                    this._timer!.parentBorderSize = this._UI.BG.BorderSizePixel;
                    this._timer!.SetPosition(TimerPosition.BottomLeft);
                }
            }

            // If a timer is present; start the timer
            if (this._timer) {
                this._timer.SetZIndex(incrementedZIndex);
                this._timer._timeUI.Parent = this._UI.BG;
                this._timer.Set(this.timeOut);

                task.defer((prompt: Prompt<T>) => {
                    let initial: number = os.time();
                    while (prompt._triggered && !prompt._cancelled && !prompt._destroyed) {
    
                        if (prompt._timer) prompt._timer.Decrement();
    
                        // Check if the prompt has timed out
                        if (os.difftime(os.time(),initial) >= prompt.timeOut) {
                            prompt._UI.BG.Visible = false;

                            if (prompt.options.timeoutBehavior === TimeoutBehavior.CancelOnTimeout)
                                prompt.OnCancel.Fire("Prompt has timed out.");
                            else prompt.OnFulfill.Fire(false);
    
                            if (prompt.options.destroyOnTimeout) {
                                // Destroy the Prompt since it has timed out.
                                prompt.Destroy();
                            } else break; // Remember to break to ensure that this thread closes.
                        }
                        task.wait(1);
                    }
                },this);
            }
        }

// #endregion

        this._UI.BG.Visible = true;
    }

    /** This method exposes _timer allowing you to set custom timer objects for your custom prompts. */
    SetTimer(timer: Timer<T extends TimerType ? T : never>) {
        this._timer = timer as T extends TimerType ? Timer<T> : undefined;
    }

    /**
     * @public
     * @param reason - The reason for cancelling the prompt.
     */
    Cancel(reason?: string) {
        this._triggered = false;
        this._cancelled = true;
        this.cleanConnections();
        this.OnCancel.Fire(reason);
    }

    /**
     * @public
     * This method releases used resources and Destroys this Prompt.
     */
    Destroy() {
        this.cleanConnections();
        if (this._timer) {
            this._timer.Destroy();
            this._timer = undefined;
        }
        this._UI.BG.Destroy();
        this._UI = undefined!;
        this._destroyed = true;
    }

    /**
     * @private
     * Cleans the UI Connections that belong to this Prompt.
     */
    private cleanConnections() {
        this._UIConnections.forEach(conn => conn.Disconnect());
        this._UIConnections = [];
    }

};

export { Prompt, UIResolver, Prompt_Choice, Prompt_Compact, promptChoice, promptCompact };