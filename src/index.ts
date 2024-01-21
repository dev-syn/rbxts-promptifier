import { Players as PlayersService } from '@rbxts/services';
import { Signal } from '@rbxts/beacon';

import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import UIResolver from './UIResolver';
import { Timer, TimerType } from './Timer';

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
export type PromptPayload = {
    /** The Prompt that this payload belongs too. */
    prompt: Prompt;
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
function extractDataFromElement(element: GuiObject): string | undefined {
    if (element.IsA("Frame") || element.IsA("ScrollingFrame")) return extractDataFromElement(element);
    else if (element.IsA("TextLabel") || element.IsA("TextBox")) return element.Text;
    return undefined;
}

/** Extracts content data from a ScrollingFrame or Frame Instance children. */
function extractDataFromContent(content: ScrollingFrame | Frame,contentPayload: Map<string,string>): void {
    for (const child of content.GetChildren()) {
        if (!child.IsA("GuiObject")) continue;
        const data: string | undefined = extractDataFromElement(child);
        if (data) contentPayload.set(child.Name,data);
    }
}

/**
 * @category Prompt
 * PromptOptions allow you to configure the prompts behavior.
 */
export interface PromptOptions {

    /** When the Prompt is timed out it will then also be destroyed. Default(true) */
    destroyOnTimeout: boolean;

}

/**
 * @category Prompt
 * The main class used to create & use Prompts.
 */
class Prompt {
    static ClassName: string = "Prompt";

    /**
     * @private
     * The ScreenGui that stores all the Prompt instances in the game.
     */
    private static _promptsScreenUI: ScreenGui = new Instance("ScreenGui");

    static {
        this._promptsScreenUI.Name = "Prompts";
        this._promptsScreenUI.ResetOnSpawn = false;

        // Try to have it so the prompts are drawn above every other UI
        this._promptsScreenUI.DisplayOrder = 5000;

        Promise.promisify(() => player.WaitForChild("PlayerGui",25))()
        .then((playerGui: Instance | undefined) => {
            this._promptsScreenUI.Parent = playerGui;
        })
        .catch((reason: unknown) => warn("Yield timed out for 'PlayerGui' in Prompts with: " + reason));
    }

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
        destroyOnTimeout: true
    };

    /**
     * A property that is meant to store a validate function
     * that will be fired before Prompt.OnFulfill is called; and will
     * only be called if this function returns true.
     * @param payload - The PromptPayload data of the Prompt.
     * @returns boolean - True if the prompt payload is valid, false otherwise.
     */
    Validator?: (payload: PromptPayload) => boolean;

// #region Events

    /**
     * @event
     * This event is fired when an input or timeout is received.
     */
    OnFulfill: Signal<[accepted: boolean,payload?: PromptPayload]> = new Signal();

    /** 
     * @event 
     * This event is fired when a prompt is cancelled for external reasons.
     */
    OnCancel: Signal<string | undefined> = new Signal();

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
    private _timer?: Timer;

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
        if (promptType === PromptType.Custom) {
            this.title = title;
            this.message = message;

            if (!UI) error("UIResolver must be given when using custom prompt type.");
            // Validate the UI
            UI.validate();

            this._UI = UI;
        } else if (promptType === PromptType.Compact) {
            this.title = title;
            this.message = message;

            const _promptCompact: Prompt_Compact = promptCompact.Clone();

            this._UI = new UIResolver()
            .setBG(_promptCompact)
            .setTitle(_promptCompact.Title)
            .setContent(_promptCompact.Content)
            .setAccept(_promptCompact.ConfirmBtn)
            .setDecline(_promptCompact.CloseBtn);
            
            // Create a timer for this prompt
            if (this.timeOut > 1) this._timer = new Timer(TimerType.Digit,this.timeOut);

        } else if (promptType === PromptType.Choice) {
            this.title = title;
            this.message = message;

            const _promptChoice: Prompt_Choice = promptChoice.Clone();

            this._UI = new UIResolver()
            .setBG(_promptChoice)
            .setTitle(_promptChoice.Title)
            .setContent(_promptChoice.Content)
            .setAccept(_promptChoice.YBtn)
            .setDecline(_promptChoice.NBtn);

            // Create a timer for this prompt
            if (this.timeOut > 1) this._timer = new Timer(TimerType.Bar,this.timeOut);

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

        if (this.message) {
            // Add a text label to the content to represent the message
            const messageLabel: TextLabel = createDefaultMessageLabel(this.message);
            messageLabel.LayoutOrder = getLowestLayoutOrder(this._UI.content) - 1;
            messageLabel.Parent = this._UI.content;
        }

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

        // Show the prompt UI
        this._UI.BG.ZIndex = Prompt._promptsScreenUI.GetChildren().size() + 1;
        this._UI.BG.Visible = true;

        this._UIConnections.push(
            this._UI.acceptBtn.MouseButton1Click.Connect(() => {

                // Clean the UI connections connections
                this.cleanConnections();

                const promptPayload: PromptPayload = {
                    prompt: this,
                    promptContent: new Map()
                };
                extractDataFromContent(this._UI.content,promptPayload.promptContent);

                // If the Prompt is not validated or cancelled during validation then return.
                if (this.Validator) {
                    const validated: boolean = this.Validator(promptPayload);
                    if (!validated || this._cancelled) return;
                }

                this.OnFulfill.Fire(true,promptPayload);
                this._triggered = false;
            })
        );

        this._UIConnections.push(
            this._UI.declineBtn.MouseButton1Click.Connect(() => {

                // Clean the UI connections connections
                this.cleanConnections();

                this.OnFulfill.Fire(false);
                this._triggered = false;
            })
        );

        if (this.timeOut > 1) {
            
            this._timer?.Set(this.timeOut);

            task.defer((prompt: Prompt) => {
                let initial: number = os.time();
                while (prompt._triggered && !prompt._cancelled && !prompt._destroyed) {

                    if (prompt._timer) {
                        prompt._timer.Decrement(1);
                    }

                    // Check if the prompt has timed out
                    if (os.difftime(os.time(),initial) >= prompt.timeOut) {
                        prompt.OnFulfill.Fire(false);

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