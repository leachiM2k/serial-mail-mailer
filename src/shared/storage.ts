export const getJsonFromLocalStorage = <T = unknown>(key: string): T | undefined => {
    const item = localStorage.getItem(key);
    if (item) {
        try {
            return JSON.parse(item) as T;
        } catch {
            return undefined;
        }
    }
    return undefined;
};
