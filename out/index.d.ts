/// <reference types="@rbxts/compiler-types" />
/// <reference types="@rbxts/compiler-types" />
import { Signal } from '@rbxts/beacon';
import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import UIResolver from './UIResolver';
declare enum PromptType {
    /** The custom mode can include any prompt UI but must have it's elements linked to the Prompt Instance. */
    Custom = "Custom",
    /** The Compact mode includes a close button at the top right with a confirm button in the bottom middle. */
    Compact = "Compact",
    /** The Choice mode includes a title with a message box and a accept or decline button next to each other at the bottom. */
    Choice = "Choice"
}
type PromptPayload<T extends Map<string, string>> = T & {
    /**
     * **DO NOT USE!**
     *
     * This field exist to force TypeScript to recognize this as a nominal type
     * @hidden
     * @deprecated
     */
    readonly _nominal_PromptPayload: unique symbol;
};
declare const promptChoice: Prompt_Choice;
declare const promptCompact: Prompt_Compact;
declare class Prompt {
    static ClassName: string;
    /** The ScreenGui that stores all the Prompt instances in the game. */
    private static _promptsScreenUI;
    /** The title of the Prompt. */
    title: string;
    /** The message of the Prompt. */
    message: string;
    /** The timeOut of the prompt if no input is given. */
    timeOut: number;
    /** This event is fired when an input or timeout is received. */
    OnFullfill: Signal<[accepted: boolean, payload?: PromptPayload<Map<string, string>>]>;
    /** This event is fired when a prompt is cancelled for external reasons. */
    OnCancel: Signal<string | undefined>;
    /** Whether the Prompt was cancelled or not. @readonly */
    private _cancelled;
    private _UI;
    constructor(promptType: PromptType.Custom, title: string, message: string, UI: UIResolver);
    constructor(promptType: PromptType.Compact, title: string, message: string);
    constructor(promptType: PromptType.Choice, title: string, message: string);
    /**
     * Triggers the prompt showing the prompt on top of the players screen. If a time out is specified then a timer will start if no input is given then the prompt will auto-fullfill with declined.
     * {@param payloadMap} The map that links instance names to a key in the payload data.
     */
    trigger(payloadMap?: Map<string, string>): Promise<void>;
    cancel(reason?: string): void;
}
export { Prompt, PromptType, promptChoice, promptCompact };
