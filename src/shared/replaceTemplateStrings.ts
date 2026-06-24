export const replaceTemplateStrings = (text: string, variables: { [key: string]: string }): string => {
    let newText = text;
    for (const key in variables) {
        const value = variables[key] || '';
        newText = newText.replace(new RegExp(`##${key}##`, 'g'), value);
    }
    return newText;
};
