import { t } from '@rbxts/t';

type Button = TextButton | ImageButton;

/**
 * @interface
 * The required UIStructure of Promptifier
 */
interface UIStructure {
    /** A Frame representing the background of the Prompt. */
    bg: Frame,
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
    bg: t.instanceIsA("Frame"),
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
    Title!: TextLabel;

    /** A Frame | ScrollingFrame representing the container of the Prompt content. */
    Content!: ScrollingFrame | Frame;

    /** The confirm, yes and accept button that will fulfill as accepted. */
    AcceptBtn!: Button;

    /** The reject, no and decline button that will fulfill as declined. */
    DeclineBtn!: Button;

    /**
     * Sets the background of this Prompt.
     * @param bg - The background Frame of the Prompt
     * @returns - UIResolver for chaining
     */
    SetBG(bg: Frame): this {
        this.BG = bg;
        return this;
    }

    /**
     * Sets the title of this Prompt.
     * @param tl - The title TextLabel of the Prompt
     * @returns - UIResolver for chaining
     */
    SetTitle(tl: TextLabel): this {
        this.Title = tl;
        return this;
    }

    /**
     * Sets the content of this Prompt.
     * @param frame - A ScrollingFrame or Frame that will contain the Prompt content
     * @returns - UIResolver for chaining
     */
    SetContent(frame: ScrollingFrame | Frame): this {
        this.Content = frame;
        return this;
    }

    /**
     * Sets the accept button of this Prompt.
     * @param btn - The TextButton or ImageButton that will represent accepting the Prompt
     * @returns - UIResolver for chaining
     */
    SetAccept(btn: Button): this {
        this.AcceptBtn = btn;
        return this;
    }

    /**
     * Sets the decline button of this Prompt.
     * @param btn - The TextButton or ImageButton that will represent declining the Prompt
     * @returns - UIResolver for chaining
     */
    SetDecline(btn: Button): this {
        this.DeclineBtn = btn;
        return this;
    }

    /**
     * Reassigns the ZIndex of the Prompt UIResolver elements.
     */
    ReassignZIndex(): void {
        const bgZIndex: number = this.BG.ZIndex;
        this.Title.ZIndex = bgZIndex + 1;
        this.Content.ZIndex = bgZIndex + 1;
        this.AcceptBtn.ZIndex = bgZIndex + 1;
        this.DeclineBtn.ZIndex = bgZIndex + 1;
    }

    /**
     * Resolves a structure of UI that is the required structure for Promptifier functionality.
     * This was designed to simplify the assignment when not chaining in roblox-ts.
     * @param structure The UIResolver required structure
     * @returns - A boolean indicating whether the structure is valid or not.
     */
    Resolve(structure: UIStructure): boolean {
        // If structure doesn't match ignore
        if (!IUIResolver(structure)) {
            warn("Failed to validate UI structure for UIResolver, you are missing a required UI element.");
            return false;
        }

        this.BG = structure.bg;
        this.Title = structure.title;
        this.Content = structure.content;
        this.AcceptBtn = structure.acceptBtn;
        this.DeclineBtn = structure.declineBtn;
        return true;
    }

    /** 
     * Validates the ui links to ensure they fill the requirements.
     * Errors if any of the elements are missing or invalid types.
     */
    Validate(): void {
        if (!IUIResolver({
            bg: this.BG,
            title: this.Title,
            content: this.Content,
            acceptBtn: this.AcceptBtn,
            declineBtn: this.DeclineBtn
        })) error("Failed to validate UI structure for UIResolver, you are missing a required UI element.");
    }

    /**
     * Validates the structure of the UIResolver ensuring the elements are within their background.
     * @returns - `true` if the structure is valid, otherwise `false`
     */
    ValidateStructure(): boolean {
        // Check that each prompt element is within the 'BG' element type.
        const bg: Frame = this.BG;
        return (
            this.Title.Parent === bg &&
            this.Content.Parent === bg &&
            this.AcceptBtn.Parent === bg &&
            this.DeclineBtn.Parent === bg
        );
    }

};

export { UIResolver, UIStructure };