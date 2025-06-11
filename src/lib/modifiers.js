// Event modifiers
export function preventDefault(fn) {
    return function (event) {
        event.preventDefault();
        fn.call(this, event);
    };
}