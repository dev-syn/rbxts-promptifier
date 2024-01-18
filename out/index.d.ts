/// <reference types="@rbxts/compiler-types" />
import { Signal } from '@rbxts/beacon';
import { Prompt_Choice } from './types/Prompt_Choice';
import { Prompt_Compact } from './types/Prompt_Compact';
import UIResolver from './UIResolver';
/**
 * @category Prompt
 * The PromptTypes that can be used when creating a new Prompt object.
 */
export declare enum PromptType {
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
    promptContent: Map<string, string>;
};
declare const promptChoice: Prompt_Choice;
declare const promptCompact: Prompt_Compact;
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
declare class Prompt {
    static ClassName: string;
    /**
     * @private
     * The ScreenGui that stores all the Prompt instances in the game.
     */
    private static _promptsScreenUI;
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
    timeOut: number;
    /** The configurable options of this Prompt. See {@link PromptOptions}*/
    options: PromptOptions;
    /**
     * A property that is meant to store a validate function
     * that will be fired before Prompt.OnFulfill is called; and will
     * only be called if this function returns true.
     * @param payload - The PromptPayload data of the Prompt.
     * @returns boolean - True if the prompt payload is valid, false otherwise.
     */
    Validator?: (payload: PromptPayload) => boolean;
    /**
     * @event
     * This event is fired when an input or timeout is received.
     */
    OnFulfill: Signal<[accepted: boolean, payload?: PromptPayload]>;
    /**
     * @event
     * This event is fired when a prompt is cancelled for external reasons.
     */
    OnCancel: Signal<string | undefined>;
    /**
     * @private
     * The type of this Prompt.
     */
    private _type;
    /**
     * @private
     * The {@link Timer} of this Prompt used for time management.
     */
    private _timer?;
    /**
     * @private
     * @readonly
     * Whether the Prompt is already triggered or not.
     */
    private _triggered;
    /**
     * @private
     * @readonly
     * Whether the Prompt was cancelled or not.
     */
    private _cancelled;
    /**
     * @private
     * @readonly
     * Whether the Prompt has been destroyed or not.
     */
    private _destroyed;
    /**
     * @private
     * @readonly
     * This Prompts {@link UIResolver}.
     */
    private _UI;
    private _UIConnections;
    /**
     *
     * @param promptType - {@link PromptType.Custom}
     * @param title - The title of this Prompt.
     * @param message - The message of this Prompt or undefined for no message.
     * @param UI - The UIResolver that is provided to link custom instances to the intended structure.
     */
    constructor(promptType: PromptType.Custom, title: string, message: string | undefined, UI: UIResolver);
    constructor(promptType: PromptType.Compact, title: string, message: string | undefined);
    constructor(promptType: PromptType.Choice, title: string, message: string | undefined);
    /**
     * Triggers the prompt showing the prompt on top of the players screen.
     * If a time out is specified, a timer will start if no input is given
     * and the prompt will auto-fullfill with a declined status.
     */
    Trigger(): void;
    /**
     * @public
     * @param reason - The reason for cancelling the prompt.
     */
    Cancel(reason?: string): void;
    /**
     * @public
     * This method releases used resources and Destroys this Prompt.
     */
    Destroy(): void;
    /**
     * @private
     * Cleans the UI Connections that belong to this Prompt.
     */
    private cleanConnections;
}
export { Prompt, UIResolver, Prompt_Choice, Prompt_Compact, promptChoice, promptCompact };
