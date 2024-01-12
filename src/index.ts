import { Players as PlayersService } from '@rbxts/services';
import { Signal } from '@rbxts/beacon';

import { script } from './types/script';
import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import UIResolver from './UIResolver';
import Timer, { TimerType } from './Timer';

enum PromptType {
    /** The custom mode can include any prompt UI but must have it's elements linked to the Prompt Instance. */
    Custom = "Custom",
    /** The Compact mode includes a close button at the top right with a confirm button in the bottom middle. */
    Compact = "Compact",
    /** The Choice mode includes a title with a message box and a accept or decline button next to each other at the bottom. */
    Choice = "Choice"
}

type PromptPayload = {
    prompt: Prompt;
    promptContent: Map<string,string>;
}

const _script: script = script as script;

const promptChoice: Prompt_Choice = _script.PromptInstances.Prompt_Choice;
const promptCompact: Prompt_Compact = _script.PromptInstances.Prompt_Compact;

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

function extractDataFromElement(element: GuiObject): string | undefined {
    if (element.IsA("Frame") || element.IsA("ScrollingFrame")) return extractDataFromElement(element);
    else if (element.IsA("TextLabel") || element.IsA("TextBox")) return element.Text;
    return undefined;
}

function extractDataFromContent(content: ScrollingFrame | Frame,contentPayload: Map<string,string>): void {
    for (const child of content.GetChildren()) {
        if (!child.IsA("GuiObject")) continue;
        const data: string | undefined = extractDataFromElement(child);
        if (data) contentPayload.set(child.Name,data);
    }
}

interface PromptOptions {

    /** When the Prompt is timed out it will then also be destroyed. Default(true) */
    destroyOnTimeout: boolean;

}

class Prompt {
    static ClassName: string = "Prompt";

    /** The ScreenGui that stores all the Prompt instances in the game. */
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

    /** The title of the Prompt. */
    title: string;
    /** The message of the Prompt. */
    message?: string;
    /** The timeOut in seconds of the prompt if no input is given. Defaults to '0' which means no timeOut is present. */
    timeOut: number = 0;

    /** The configurable options of this Prompt. */
    options: PromptOptions = {
        destroyOnTimeout: true
    };

    // #region Events

    /** This event is fired when an input or timeout is received. */
    OnFullfill: Signal<[accepted: boolean,payload?: PromptPayload]> = new Signal();
    /** This event is fired when a prompt is cancelled for external reasons. */
    OnCancel: Signal<string | undefined> = new Signal();

    // #endregion

    private _type: PromptType;
    private _timer?: Timer;
    /** Whether the Prompt is already triggered or not. @readonly */
    private _triggered: boolean = false;
    /** Whether the Prompt was cancelled or not. @readonly */
    private _cancelled: boolean = false;
    /** Whether the Prompt has been destroyed or not. @readonly */
    private _destroyed: boolean = false;

    private _UI: UIResolver;
    private _UIConnections: RBXScriptConnection[] = [];

    constructor(promptType: PromptType.Custom,title: string,message: string | undefined,UI: UIResolver);
    constructor(promptType: PromptType.Compact,title: string,message: string | undefined);
    constructor(promptType: PromptType.Choice,title: string,message: string | undefined);
    constructor(promptType: PromptType,title: string,message: string | undefined,UI?: UIResolver) {
        if (promptType === PromptType.Custom) {
            this.title = title;
            this.message = message;

            // Validate the UI
            if (!UI) error("UIResolver must be given when using custom prompt type.");
            UI.validate();

            this._UI = UI;
        } else if (promptType === PromptType.Compact) {
            this.title = title;
            this.message = message;

            this._UI = new UIResolver()
            .setBG(promptCompact)
            .setTitle(promptCompact.Title)
            .setContent(promptCompact.Content)
            .setAccept(promptCompact.ConfirmBtn)
            .setDecline(promptCompact.CloseBtn);
            
            // Create a timer for this prompt
            if (this.timeOut > 1) this._timer = new Timer(TimerType.Digit,this.timeOut);

        } else if (promptType === PromptType.Choice) {
            this.title = title;
            this.message = message;

            this._UI = new UIResolver()
            .setBG(promptChoice)
            .setTitle(promptChoice.Title)
            .setContent(promptChoice.Content)
            .setAccept(promptChoice.YBtn)
            .setDecline(promptChoice.NBtn);

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
     * Triggers the prompt showing the prompt on top of the players screen. If a time out is specified then a timer will start if no input is given then the prompt will auto-fullfill with declined.
     * {@param payloadMap} The map that links instance names to a key in the payload data.
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

                this.OnFullfill.Fire(true,promptPayload);
                this._triggered = false;
            })
        );

        this._UIConnections.push(
            this._UI.declineBtn.MouseButton1Click.Connect(() => {

                // Clean the UI connections connections
                this.cleanConnections();

                this.OnFullfill.Fire(false);
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
                        prompt.OnFullfill.Fire(false);

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

    Cancel(reason?: string) {
        this._triggered = false;
        this._cancelled = true;
        this.cleanConnections();
        this.OnCancel.Fire(reason);
    }

    Destroy() {
        this.cleanConnections();
        if (this._timer) {
            this._timer.Destroy();
            this._timer = undefined;
        }
        this._destroyed = true;
    }

    /** Cleans the UI Connections that belong to this Prompt. */
    private cleanConnections() {
        this._UIConnections.forEach(conn => conn.Disconnect());
        this._UIConnections = [];
    }

};

export { Prompt, PromptType, promptChoice, promptCompact, UIResolver };