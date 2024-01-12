/// <reference types="@rbxts/types" />
/** A utility class that allows you to patch any prompt designs into the Prompt class essentially mapping your custom elements into the expected structure. */
declare class UIResolver {
    BG: Frame;
    title: TextLabel;
    content: ScrollingFrame | Frame;
    acceptBtn: TextButton | ImageButton;
    declineBtn: TextButton | ImageButton;
    setBG(bg: Frame): this;
    setTitle(tl: TextLabel): this;
    setContent(frame: ScrollingFrame | Frame): this;
    setAccept(btn: TextButton | ImageButton): this;
    setDecline(btn: TextButton | ImageButton): this;
    /** Throws if any of the elements are missing or invalid types. */
    validate(): void;
    /** Returns true if the structure of the prompt elements is valid otherwise false. */
    validateStructure(): boolean;
}
export = UIResolver;
