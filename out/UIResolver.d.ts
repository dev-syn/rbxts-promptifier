/// <reference types="@rbxts/types" />
/**
 * **UIResolver**
 *
 * A utility class that allows you to patch any prompt designs into the Prompt class essentially
 * mapping your custom elements into the expected structure.
 */
declare class UIResolver {
    BG: Frame;
    title: TextLabel;
    content: ScrollingFrame | Frame;
    acceptBtn: TextButton | ImageButton;
    declineBtn: TextButton | ImageButton;
    /**
     * @param bg - The background Frame of the Prompt
     * @returns - UIResolver for chaining
     */
    setBG(bg: Frame): this;
    /**
     *
     * @param tl - The title TextLabel of the Prompt
     * @returns - UIResolver for chaining
     */
    setTitle(tl: TextLabel): this;
    /**
     *
     * @param frame - A ScrollingFrame or Frame that will contain the Prompt content
     * @returns - UIResolver for chaining
     */
    setContent(frame: ScrollingFrame | Frame): this;
    /**
     *
     * @param btn - The TextButton or ImageButton that will represent accepting the Prompt
     * @returns - UIResolver for chaining
     */
    setAccept(btn: TextButton | ImageButton): this;
    /**
     *
     * @param btn - The TextButton or ImageButton that will represent declining the Prompt
     * @returns - UIResolver for chaining
     */
    setDecline(btn: TextButton | ImageButton): this;
    /**
     * Validates the ui links to ensure they fill the requirements.
     * Throws if any of the elements are missing or invalid types.
     */
    validate(): void;
    /**
     * Validates the structure of the UIResolver ensuring the elements are within their background.
     * @returns - `true` if the structure is valid, otherwise `false`
     */
    validateStructure(): boolean;
}
export = UIResolver;
