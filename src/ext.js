export function ce(tag,className) {
    let el = document.createElement(tag);

    if (typeof className !== 'undefined') {
        el.classList.add(className);
    }

    return el;
}