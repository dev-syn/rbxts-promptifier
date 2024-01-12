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
type PromptPayload = {
    prompt: Prompt;
    promptContent: Map<string, string>;
};
declare const promptChoice: Prompt_Choice;
declare const promptCompact: Prompt_Compact;
interface PromptOptions {
    /** When the Prompt is timed out it will then also be destroyed. Default(true) */
    destroyOnTimeout: boolean;
}
declare class Prompt {
    static ClassName: string;
    /** The ScreenGui that stores all the Prompt instances in the game. */
    private static _promptsScreenUI;
    /** The title of the Prompt. */
    title: string;
    /** The message of the Prompt. */
    message?: string;
    /** The timeOut in seconds of the prompt if no input is given. Defaults to '0' which means no timeOut is present. */
    timeOut: number;
    /** The configurable options of this Prompt. */
    options: PromptOptions;
    /** This event is fired when an input or timeout is received. */
    OnFullfill: Signal<[accepted: boolean, payload?: PromptPayload]>;
    /** This event is fired when a prompt is cancelled for external reasons. */
    OnCancel: Signal<string | undefined>;
    private _type;
    private _timer?;
    /** Whether the Prompt is already triggered or not. @readonly */
    private _triggered;
    /** Whether the Prompt was cancelled or not. @readonly */
    private _cancelled;
    /** Whether the Prompt has been destroyed or not. @readonly */
    private _destroyed;
    private _UI;
    private _UIConnections;
    constructor(promptType: PromptType.Custom, title: string, message: string | undefined, UI: UIResolver);
    constructor(promptType: PromptType.Compact, title: string, message: string | undefined);
    constructor(promptType: PromptType.Choice, title: string, message: string | undefined);
    /**
     * Triggers the prompt showing the prompt on top of the players screen.
     * If a time out is specified, a timer will start if no input is given
     * and the prompt will auto-fullfill with a declined status.
     */
    Trigger(): void;
    Cancel(reason?: string): void;
    Destroy(): void;
    /** Cleans the UI Connections that belong to this Prompt. */
    private cleanConnections;
}
export { Prompt, PromptType, promptChoice, promptCompact, UIResolver, PromptPayload };
