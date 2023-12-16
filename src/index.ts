import { Players as PlayersService } from '@rbxts/services';

import { Signal } from '@rbxts/beacon';
import { script } from './types/script';
import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import UIResolver from './UIResolver';

enum PromptType {
    /** The custom mode can include any prompt UI but must have it's elements linked to the Prompt Instance. */
    Custom = "Custom",
    /** The Compact mode includes a close button at the top right with a confirm button in the bottom middle. */
    Compact = "Compact",
    /** The Choice mode includes a title with a message box and a accept or decline button next to each other at the bottom. */
    Choice = "Choice"
}

type PromptPayload<T extends Map<string,string>> = T & {
    /**
     * **DO NOT USE!**
     * 
     * This field exist to force TypeScript to recognize this as a nominal type
     * @hidden
     * @deprecated
     */
    readonly _nominal_PromptPayload: unique symbol;
}

const _script: script = script as script;

const promptChoice: Prompt_Choice = _script.PromptInstances.Prompt_Choice;
const promptCompact: Prompt_Compact = _script.PromptInstances.Prompt_Compact;

const player: Player = PlayersService.LocalPlayer;

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
    message: string;
    /** The timeOut of the prompt if no input is given. */
    timeOut: number = -1;

    /** This event is fired when an input or timeout is received. */
    OnFullfill: Signal<[accepted: boolean,payload?: PromptPayload<Map<string,string>>]> = new Signal();
    /** This event is fired when a prompt is cancelled for external reasons. */
    OnCancel: Signal<string | undefined> = new Signal();

    /** Whether the Prompt was cancelled or not. @readonly */
    private _cancelled: boolean = false;
    private _UI: UIResolver;

    constructor(promptType: PromptType.Custom,title: string,message: string,UI: UIResolver);
    constructor(promptType: PromptType.Compact,title: string,message: string);
    constructor(promptType: PromptType.Choice,title: string,message: string);
    constructor(promptType: PromptType,title: string,message: string,UI?: UIResolver) {
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
            
        } else if (promptType === PromptType.Choice) {
            this.title = title;
            this.message = message;

            this._UI = new UIResolver()
            .setBG(promptChoice)
            .setTitle(promptChoice.Title)
            .setContent(promptChoice.Content)
            .setAccept(promptChoice.YBtn)
            .setDecline(promptChoice.NBtn);

        } else error(`Unknown PromptType: '${promptType}'`);

        this._UI.BG.Parent = Prompt._promptsScreenUI;
    }

    /**
     * Triggers the prompt showing the prompt on top of the players screen. If a time out is specified then a timer will start if no input is given then the prompt will auto-fullfill with declined.
     * {@param payloadMap} The map that links instance names to a key in the payload data.
     */
    trigger(payloadMap?: Map<string,string>): Promise<void> {

        // Show the prompt UI
        this._UI.BG.LayoutOrder = Prompt._promptsScreenUI.GetChildren().size() + 1;
        this._UI.BG.Visible = true;

        return new Promise<void>((resolve,reject) => {
            this._UI.acceptBtn.MouseButton1Click.Connect(() => {
                this.OnFullfill.Fire(true);
            });
            this._UI.declineBtn.MouseButton1Click.Connect(() => {
                this.OnFullfill.Fire(false);
            });
        }); 
    }

    cancel(reason?: string) {
        this._cancelled = true;
        this.OnCancel.Fire(reason);
    }

};

export { Prompt, PromptType };