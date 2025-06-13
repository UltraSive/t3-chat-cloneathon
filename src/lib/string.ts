export function getFirstAndLastCharacter(input: string): { first: string, last: string } | null {
    // Check if the input string is empty
    if (input.length === 0) {
        return null; // or you can also throw an error or return an appropriate value
    }

    // Get the first and last characters
    const firstCharacter = input.charAt(0);
    const lastCharacter = input.charAt(input.length - 1);

    // Return the result as an object
    return {
        first: firstCharacter,
        last: lastCharacter
    };
}