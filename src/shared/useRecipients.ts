import React from "react";
import Papa from "papaparse";
import { RecipientType } from "../frontend/Recipients";
import { getJsonFromLocalStorage } from "./storage";

export const useRecipients = (recipients?: RecipientType[]): RecipientType[] => {
    return React.useMemo<RecipientType[]>(() => {
        if (recipients && recipients.length > 0) {
            return recipients;
        }
        const stored = getJsonFromLocalStorage<{ recipients?: string }>('recipients');
        if (stored?.recipients) {
            const result = Papa.parse<RecipientType>(stored.recipients, {
                header: true,
                skipEmptyLines: true,
            });
            return result.data;
        }
        return [];
    }, [recipients]);
};
