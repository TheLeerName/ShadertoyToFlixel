declare namespace dialogs {
    function dialog(config: {type: 'directory' | 'save-file' | 'open-file' | 'open-files', extra: {ext: string, types: Object<string, string>, startdir: string, startfile: string, title: string}}): Promise<string[]>;
}

export = dialogs
