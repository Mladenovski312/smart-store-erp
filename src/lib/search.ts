/**
 * Bidirectional Latin ↔ Cyrillic transliteration for Macedonian.
 * Enables searching Cyrillic product names with Latin input and vice versa.
 */

// Macedonian Cyrillic → Latin (digraphs first for correct order)
const CYRILLIC_TO_LATIN: [string, string][] = [
    ['љ', 'lj'], ['њ', 'nj'], ['џ', 'dj'],
    ['ж', 'zh'], ['ш', 'sh'], ['ч', 'ch'],
    ['ѓ', 'gj'], ['ќ', 'kj'], ['ѕ', 'dz'],
    ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'],
    ['е', 'e'], ['з', 'z'], ['и', 'i'], ['ј', 'j'],
    ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'],
    ['о', 'o'], ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'],
    ['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ц', 'c'],
];

// Latin → Cyrillic (digraphs first so "sh" matches before "s")
const LATIN_TO_CYRILLIC: [string, string][] = [
    ['lj', 'љ'], ['nj', 'њ'], ['dj', 'џ'],
    ['zh', 'ж'], ['sh', 'ш'], ['ch', 'ч'],
    ['gj', 'ѓ'], ['kj', 'ќ'], ['dz', 'ѕ'],
    ['a', 'а'], ['b', 'б'], ['v', 'в'], ['g', 'г'], ['d', 'д'],
    ['e', 'е'], ['z', 'з'], ['i', 'и'], ['j', 'ј'],
    ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'],
    ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'],
    ['u', 'у'], ['f', 'ф'], ['h', 'х'], ['c', 'ц'],
];

function applyMap(text: string, map: [string, string][]): string {
    let result = '';
    let i = 0;
    while (i < text.length) {
        let matched = false;
        // Try digraphs (2-char) first
        for (const [from, to] of map) {
            if (text.substring(i, i + from.length) === from) {
                result += to;
                i += from.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += text[i];
            i++;
        }
    }
    return result;
}

/** Convert Cyrillic text to Latin transliteration */
export function cyrillicToLatin(text: string): string {
    return applyMap(text.toLowerCase(), CYRILLIC_TO_LATIN);
}

/** Convert Latin text to Cyrillic transliteration */
export function latinToCyrillic(text: string): string {
    return applyMap(text.toLowerCase(), LATIN_TO_CYRILLIC);
}

/**
 * Check if a product name matches a search query,
 * supporting both Latin and Cyrillic input.
 * e.g. "ranec" will match "ранец", and "ранец" will match "ранец".
 */
export function matchesSearch(productName: string, query: string): boolean {
    const nameLower = productName.toLowerCase();
    const queryLower = query.toLowerCase();

    // Direct match
    if (nameLower.includes(queryLower)) return true;

    // Latin query → transliterate to Cyrillic and check
    const queryCyrillic = latinToCyrillic(queryLower);
    if (nameLower.includes(queryCyrillic)) return true;

    // Cyrillic query → transliterate to Latin and check against latinized name
    const nameLatin = cyrillicToLatin(nameLower);
    if (nameLatin.includes(queryLower)) return true;

    return false;
}
