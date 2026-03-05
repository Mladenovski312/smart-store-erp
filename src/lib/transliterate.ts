const MULTI_CHARS: Record<string, string> = {
    'sh': 'ш', 'Sh': 'Ш', 'SH': 'Ш',
    'zh': 'ж', 'Zh': 'Ж', 'ZH': 'Ж',
    'ch': 'ч', 'Ch': 'Ч', 'CH': 'Ч',
    'dz': 'ѕ', 'Dz': 'Ѕ', 'DZ': 'Ѕ',
    'dzh': 'џ', 'Dzh': 'Џ', 'DZH': 'Џ',
    'gj': 'ѓ', 'Gj': 'Ѓ', 'GJ': 'Ѓ',
    'kj': 'ќ', 'Kj': 'Ќ', 'KJ': 'Ќ',
    'nj': 'њ', 'Nj': 'Њ', 'NJ': 'Њ',
    'lj': 'љ', 'Lj': 'Љ', 'LJ': 'Љ',
};

const SINGLE_CHARS: Record<string, string> = {
    'a': 'а', 'A': 'А',
    'b': 'б', 'B': 'Б',
    'v': 'в', 'V': 'В',
    'g': 'г', 'G': 'Г',
    'd': 'д', 'D': 'Д',
    'e': 'е', 'E': 'Е',
    'z': 'з', 'Z': 'З',
    'i': 'и', 'I': 'И',
    'j': 'ј', 'J': 'Ј',
    'k': 'к', 'K': 'К',
    'l': 'л', 'L': 'Л',
    'm': 'м', 'M': 'М',
    'n': 'н', 'N': 'Н',
    'o': 'о', 'O': 'О',
    'p': 'п', 'P': 'П',
    'r': 'р', 'R': 'Р',
    's': 'с', 'S': 'С',
    't': 'т', 'T': 'Т',
    'u': 'у', 'U': 'У',
    'f': 'ф', 'F': 'Ф',
    'h': 'х', 'H': 'Х',
    'c': 'ц', 'C': 'Ц',
    // Fallbacks for characters not present in Macedonian
    'w': 'в', 'W': 'В',
    'y': 'и', 'Y': 'И',
    'q': 'к', 'Q': 'К',
};

export function latinToCyrillic(text: string): string {
    let result = text;

    // First replace multi-character combinations
    for (const [latin, cyrillic] of Object.entries(MULTI_CHARS)) {
        result = result.replace(new RegExp(latin, 'g'), cyrillic);
    }

    // Then replace single characters
    let finalResult = '';
    for (const char of result) {
        finalResult += SINGLE_CHARS[char] || char;
    }

    return finalResult;
}
