# Promptifier
This is a package designed to ease the use of prompt-like UI structures prompting users based on a choice or just a notification that could be acknowledged.

This allows you to create "prompts" that popup on a players screen prompting with a choice or notice.

## Prompt Options

(destroyOnTimeout: boolean): Whether the prompt should be destroyed once it times out. Defaults(true)


## Promptifier Built-in Prompt Modes

### Compact
This prompt mode has a close button on the top right with a confirm button in the bottom middle.
### Choice
This prompt mode has a title with a message box and a accept or decline button next to each other at the bottom.

---
### Custom
This prompt mode allows you to use the UIResolver class which you assign instances to represent your prompt structure.

#### UIResolver
A more detailed description can be found within the UIResolver source file.

    ('BG': Frame): The background of the whole prompt interface.

        ('title': TextLabel): The title of the prompt.

        ('content': ScrollingFrame | Frame): The content of the prompt which can consist of
            a ScrollingFrame for any size of content or a Frame that contains a content.

        ('acceptBtn': TextButton | ImageButton): This is a button type for accept/proceed/submit,
            this is the button that proceeds the prompt as fulfilled.
            
        ('declineBtn': TextButton | ImageButton): This is a button type for decline/halt/dismiss,
            this is the button that dismisses the prompt as fulfilled.


## Promptifier Events
Prompt has event properties that can be used to listen to events that occur.

#### OnFullfill
    Signal<[accepted: boolean,payload?: PromptPayload]>  
This event is fired when the prompt has been submitted or dismissed.
##### Arguments
    accepted: boolean -> Whether the prompt was accepted or declined.
    payload?: PromptPayload -> If the prompt was accepted, It's response payload.
---
#### OnCancel
    Signal<string | undefined>
This event is fired when the `Promptifier:Cancel()` method is called for external reasons.
##### Arguments
    reason?: string -> The reason why the prompt was cancelled.