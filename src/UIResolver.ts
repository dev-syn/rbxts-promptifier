function isOfInstance(obj: Instance,instType: keyof Instances): boolean {
    return obj && typeOf(obj) === 'Instance' && obj.IsA(instType);
}

/**
 * **UIResolver**
 * 
 * A utility class that allows you to patch any prompt designs into the Prompt class essentially
 * mapping your custom elements into the expected structure.
 */
class UIResolver {
    BG!: Frame;
    title!: TextLabel;
    content!: ScrollingFrame | Frame;

    acceptBtn!: TextButton | ImageButton;
    declineBtn!: TextButton | ImageButton;

    /**
     * @param bg - The background Frame of the Prompt
     * @returns - UIResolver for chaining
     */
    setBG(bg: Frame): this {
        this.BG = bg;
        return this;
    }

    /**
     * 
     * @param tl - The title TextLabel of the Prompt
     * @returns - UIResolver for chaining
     */
    setTitle(tl: TextLabel): this {
        this.title = tl;
        return this;
    }

    /**
     * 
     * @param frame - A ScrollingFrame or Frame that will contain the Prompt content
     * @returns - UIResolver for chaining
     */
    setContent(frame: ScrollingFrame | Frame): this {
        this.content = frame;
        return this;
    }

    /**
     * 
     * @param btn - The TextButton or ImageButton that will represent accepting the Prompt
     * @returns - UIResolver for chaining
     */
    setAccept(btn: TextButton | ImageButton): this {
        this.acceptBtn = btn;
        return this;
    }

    /**
     * 
     * @param btn - The TextButton or ImageButton that will represent declining the Prompt
     * @returns - UIResolver for chaining
     */
    setDecline(btn: TextButton | ImageButton): this {
        this.declineBtn = btn;
        return this;
    }

    /** 
     * Validates the ui links to ensure they fill the requirements.
     * Throws if any of the elements are missing or invalid types.
     */
    validate() {
        const bg = this.BG;
        assert(isOfInstance(bg,"Frame"),"BG must be a Frame Instance.")
        const title = this.title;
        assert(isOfInstance(title,"TextLabel"),"Title must be a TextLabel Instance.");
        const content = this.content;
        assert(isOfInstance(content,"ScrollingFrame") || isOfInstance(content,"Frame"),"Content must be a ScrollingFrame or a Frame Instance.");
        const acceptBtn = this.acceptBtn;
        assert(isOfInstance(acceptBtn,"TextButton") || isOfInstance(acceptBtn,"ImageButton"),"AcceptBtn must be a TextButton or a ImageButton Instance.");
        const declineBtn = this.declineBtn;
        assert(isOfInstance(declineBtn,"TextButton") || isOfInstance(declineBtn,"ImageButton"),"DeclineBtn must be a TextButton or a ImageButton Instance.");
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

export = UIResolver;