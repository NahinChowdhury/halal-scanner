export function isNumber(str: string): boolean {
    // Use a regular expression to check if the string contains only digits (0-9)
    const regex = /^\d+$/;
    return regex.test(str);
  }