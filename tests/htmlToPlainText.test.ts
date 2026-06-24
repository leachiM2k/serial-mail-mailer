import { describe, it, expect } from 'vitest';
import { htmlToPlainText } from '../src/shared/htmlToPlainText';

describe('htmlToPlainText', () => {
    it('strips simple HTML tags', () => {
        expect(htmlToPlainText('<p>Hello World</p>')).toBe('Hello World');
    });

    it('converts <br> to newlines', () => {
        expect(htmlToPlainText('Line 1<br>Line 2<br/>Line 3<br />Line 4')).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });

    it('converts </p> to double newlines', () => {
        expect(htmlToPlainText('<p>Para 1</p><p>Para 2</p>')).toBe('Para 1\n\nPara 2');
    });

    it('converts <li> to bullet points', () => {
        const result = htmlToPlainText('<ul><li>Item 1</li><li>Item 2</li></ul>');
        expect(result).toBe('- Item 1\n- Item 2');
    });

    it('decodes HTML entities', () => {
        expect(htmlToPlainText('Hello&amp;World')).toBe('Hello&World');
        expect(htmlToPlainText('&lt;tag&gt;')).toBe('<tag>');
        expect(htmlToPlainText('&quot;quoted&quot;')).toBe('"quoted"');
        expect(htmlToPlainText('&#39;apostrophe&#39;')).toBe("'apostrophe'");
        expect(htmlToPlainText('Hello&nbsp;World')).toBe('Hello World');
    });

    it('handles headings', () => {
        const result = htmlToPlainText('<h1>Title</h1><p>Body</p>');
        expect(result).toBe('Title\n\nBody');
    });

    it('collapses excessive newlines', () => {
        expect(htmlToPlainText('<p>A</p><p>B</p><p>C</p>')).toBe('A\n\nB\n\nC');
    });

    it('trims leading and trailing whitespace', () => {
        expect(htmlToPlainText('  <p>Hello</p>  ')).toBe('Hello');
    });

    it('handles empty string', () => {
        expect(htmlToPlainText('')).toBe('');
    });

    it('handles plain text without HTML', () => {
        expect(htmlToPlainText('Just plain text')).toBe('Just plain text');
    });

    it('handles nested tags', () => {
        expect(htmlToPlainText('<div><p>Nested</p></div>')).toBe('Nested');
    });

    it('converts </div> to newlines', () => {
        expect(htmlToPlainText('<div>Line 1</div><div>Line 2</div>')).toBe('Line 1\nLine 2');
    });
});
