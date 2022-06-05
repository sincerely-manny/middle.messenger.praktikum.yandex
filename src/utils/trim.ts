export default function trim(str: String, sym: String = '\\s'): String {
    const reSym = `[${sym}\\s]+`;
    const re = new RegExp(`(^${reSym})|(${reSym}$)`, 'g');
    return str.replace(re, '');
}
