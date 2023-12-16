import { Prompt_Choice } from './Prompt_Choice';
import { Prompt_Compact } from './Prompt_Compact';

export type script = LuaSourceContainer & {
    PromptInstances: Folder & {
        Prompt_Choice: Prompt_Choice,
        Prompt_Compact: Prompt_Compact
    }
};