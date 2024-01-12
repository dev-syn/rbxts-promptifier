function isOfInstance(obj: any,instType: keyof Instances): boolean {
    return obj && typeOf(obj) === 'Instance' && (obj as Instance).IsA(instType);
}

/** A utility class that allows you to patch any prompt designs into the Prompt class essentially mapping your custom elements into the expected structure. */
class UIResolver {
    BG!: Frame;
    title!: TextLabel;
    content!: ScrollingFrame | Frame;

    acceptBtn!: TextButton | ImageButton;
    declineBtn!: TextButton | ImageButton;

    setBG(bg: Frame): this {
        this.BG = bg;
        return this;
    }

    setTitle(tl: TextLabel): this {
        this.title = tl;
        return this;
    }

    setContent(frame: ScrollingFrame | Frame): this {
        this.content = frame;
        return this;
    }

    setAccept(btn: TextButton | ImageButton): this {
        this.acceptBtn = btn;
        return this;
    }

    setDecline(btn: TextButton | ImageButton): this {
        this.declineBtn = btn;
        return this;
    }

    /** Throws if any of the elements are missing or invalid types. */
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

    /** Returns true if the structure of the prompt elements is valid otherwise false. */
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