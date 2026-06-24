import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';

describe('CSV parsing', () => {
    it('parses a simple CSV with headers', () => {
        const csv = 'firstname,lastname,email\nJohn,Doe,john@example.com\nJane,Smith,jane@example.com';
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({ firstname: 'John', lastname: 'Doe', email: 'john@example.com' });
        expect(result.data[1]).toEqual({ firstname: 'Jane', lastname: 'Smith', email: 'jane@example.com' });
    });

    it('skips empty lines', () => {
        const csv = 'firstname,lastname,email\nJohn,Doe,john@example.com\n\nJane,Smith,jane@example.com';
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        expect(result.data).toHaveLength(2);
    });

    it('handles single row', () => {
        const csv = 'firstname,lastname,email\nJohn,Doe,john@example.com';
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({ firstname: 'John', lastname: 'Doe', email: 'john@example.com' });
    });

    it('handles extra columns beyond the required three', () => {
        const csv = 'firstname,lastname,email,city,country\nJohn,Doe,john@example.com,Berlin,Germany';
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        expect(result.data[0]).toEqual({
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            city: 'Berlin',
            country: 'Germany',
        });
    });

    it('handles quoted values with commas', () => {
        const csv = 'firstname,lastname,email\n"John, Jr.",Doe,"john@example.com"';
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        expect(result.data[0].firstname).toBe('John, Jr.');
        expect(result.data[0].email).toBe('john@example.com');
    });

    it('produces empty data for empty input', () => {
        const result = Papa.parse('', { header: true, skipEmptyLines: true });
        expect(result.data).toHaveLength(0);
    });

    it('can unparse data back to CSV', () => {
        const data = [
            { firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
            { firstname: 'Jane', lastname: 'Smith', email: 'jane@example.com' },
        ];
        const csv = Papa.unparse(data);
        expect(csv).toContain('firstname,lastname,email');
        expect(csv).toContain('John,Doe,john@example.com');
        expect(csv).toContain('Jane,Smith,jane@example.com');
    });
});
