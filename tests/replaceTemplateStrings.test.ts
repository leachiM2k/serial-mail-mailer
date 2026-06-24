import { describe, it, expect } from 'vitest';
import { replaceTemplateStrings } from '../src/shared/replaceTemplateStrings';

describe('replaceTemplateStrings', () => {
    it('replaces a single variable', () => {
        const result = replaceTemplateStrings('Hello ##name##!', { name: 'World' });
        expect(result).toBe('Hello World!');
    });

    it('replaces multiple different variables', () => {
        const result = replaceTemplateStrings(
            '##firstname## ##lastname## <##email##>',
            { firstname: 'John', lastname: 'Doe', email: 'john@example.com' }
        );
        expect(result).toBe('John Doe <john@example.com>');
    });

    it('replaces multiple occurrences of the same variable', () => {
        const result = replaceTemplateStrings('##name## and ##name##', { name: 'Bob' });
        expect(result).toBe('Bob and Bob');
    });

    it('returns the original text if no variables match', () => {
        const result = replaceTemplateStrings('Hello World!', { name: 'Bob' });
        expect(result).toBe('Hello World!');
    });

    it('handles empty variables object', () => {
        const result = replaceTemplateStrings('Hello ##name##!', {});
        expect(result).toBe('Hello ##name##!');
    });

    it('handles empty text', () => {
        const result = replaceTemplateStrings('', { name: 'Bob' });
        expect(result).toBe('');
    });

    it('handles undefined variable value gracefully', () => {
        const result = replaceTemplateStrings('Hello ##name##!', { name: '' });
        expect(result).toBe('Hello !');
    });

    it('does not replace partial matches', () => {
        const result = replaceTemplateStrings('##nam## and ##name##', { name: 'Bob' });
        expect(result).toBe('##nam## and Bob');
    });

    it('handles special characters in variable values', () => {
        const result = replaceTemplateStrings('##text##', { text: 'Hello <world> & "friends"' });
        expect(result).toBe('Hello <world> & "friends"');
    });
});
