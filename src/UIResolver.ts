import { t } from '@rbxts/t';

type Button = TextButton | ImageButton;

/**
 * @interface
 * The required UIStructure of Promptifier
 */
interface UIStructure {
    /** A Frame representing the background of the Prompt. */
    BG: Frame,
    /** A TextLabel which will act as the title/header for this Prompt. */
    title: TextLabel,
    /** A Frame | ScrollingFrame representing the container of the Prompt content. */
    content: Frame | ScrollingFrame,
    /** The confirm, yes and accept button that will fulfill as accepted. */
    acceptBtn: Button,
    /** The reject, no and decline button that will fulfill as declined. */
    declineBtn: Button
}

const TButton = t.union(t.instanceIsA("TextButton"),t.instanceIsA("ImageButton"));

const IUIResolver = t.interface({
    BG: t.instanceIsA("Frame"),
    title: t.instanceIsA("TextLabel"),
    content: t.union(t.instanceIsA("Frame"),t.instanceIsA("ScrollingFrame")),
    acceptBtn: TButton,
    declineBtn: TButton
});

/**
 * **UIResolver**
 * 
 * A utility class that allows you to patch any prompt designs into the Prompt class essentially
 * mapping your custom elements into the expected structure.
 */
class UIResolver {

    /** A Frame representing the background of the Prompt. */
    BG!: Frame;

    /** A TextLabel which will act as the title/header for this Prompt. */
    title!: TextLabel;

    /** A Frame | ScrollingFrame representing the container of the Prompt content. */
    content!: ScrollingFrame | Frame;

    /** The confirm, yes and accept button that will fulfill as accepted. */
    acceptBtn!: TextButton | ImageButton;

    /** The reject, no and decline button that will fulfill as declined. */
    declineBtn!: TextButton | ImageButton;

    /**
     * Sets the background of this Prompt.
     * @param bg - The background Frame of the Prompt
     * @returns - UIResolver for chaining
     */
    setBG(bg: Frame): this {
        this.BG = bg;
        return this;
    }

    /**
     * Sets the title of this Prompt.
     * @param tl - The title TextLabel of the Prompt
     * @returns - UIResolver for chaining
     */
    setTitle(tl: TextLabel): this {
        this.title = tl;
        return this;
    }

    /**
     * Sets the content of this Prompt.
     * @param frame - A ScrollingFrame or Frame that will contain the Prompt content
     * @returns - UIResolver for chaining
     */
    setContent(frame: ScrollingFrame | Frame): this {
        this.content = frame;
        return this;
    }

    /**
     * Sets the accept button of this Prompt.
     * @param btn - The TextButton or ImageButton that will represent accepting the Prompt
     * @returns - UIResolver for chaining
     */
    setAccept(btn: TextButton | ImageButton): this {
        this.acceptBtn = btn;
        return this;
    }

    /**
     * Sets the decline button of this Prompt.
     * @param btn - The TextButton or ImageButton that will represent declining the Prompt
     * @returns - UIResolver for chaining
     */
    setDecline(btn: TextButton | ImageButton): this {
        this.declineBtn = btn;
        return this;
    }

    /**
     * Reassigns the ZIndex of the Prompt UIResolver elements.
     */
    assignZIndex(): void {
        const bgZIndex: number = this.BG.ZIndex;
        this.title.ZIndex = bgZIndex + 1;
        this.content.ZIndex = bgZIndex + 1;
        this.acceptBtn.ZIndex = bgZIndex + 1;
        this.declineBtn.ZIndex = bgZIndex + 1;
    }

    /**
     * Resolves a structure of UI that is the required structure for Promptifier functionality.
     * This was designed to simplify the assignment when not chaining in roblox-ts.
     * @param structure The UIResolver required structure
     * @returns - A boolean indicating whether the structure is valid or not.
     */
    resolve(structure: UIStructure): boolean {
        // If structure doesn't match ignore
        if (!IUIResolver(structure)) {
            warn("Failed to validate UI structure for UIResolver, you are missing a required UI element.");
            return false;
        }

        this.BG = structure.BG;
        this.title = structure.title;
        this.content = structure.content;
        this.acceptBtn = structure.acceptBtn;
        this.declineBtn = structure.declineBtn;
        return true;
    }

    /** 
     * Validates the ui links to ensure they fill the requirements.
     * Errors if any of the elements are missing or invalid types.
     */
    validate(): void {
        if (!IUIResolver({
            BG: this.BG,
            title: this.title,
            content: this.content,
            acceptBtn: this.acceptBtn,
            declineBtn: this.declineBtn
        })) error("Failed to validate UI structure for UIResolver, you are missing a required UI element.");
    }

    /**
     * Validates the structure of the UIResolver ensuring the elements are within their background.
     * @returns - `true` if the structure is valid, otherwise `false`
     */
    validateStructure(): boolean {
        // Check that each prompt element is within the 'BG' element type.
        const bg: Frame = this.BG;
        return (
            this.title.Parent === bg &&
            this.content.Parent === bg &&
            this.acceptBtn.Parent === bg &&
            this.declineBtn.Parent === bg
        );
    }

};

export { UIResolver, UIStructure };