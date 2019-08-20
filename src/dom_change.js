let MutationObserver = typeof window !== 'undefined' ? window.MutationObserver || window.WebKitMutationObserver : undefined,
    eventListenerSupported = typeof window !== 'undefined' ? window.addEventListener : undefined;

export default class TableFits_Prepare_DomChange {

    static addEvent(obj, callback) {
        if (MutationObserver) {
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer) {
                if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                    callback();
            });

            obs.observe(obj, {childList: true, subtree: true});

            if (!(obj in TableFits_Prepare_DomChange._storage)) {
                TableFits_Prepare_DomChange._storage[obj] = {};
            }

            TableFits_Prepare_DomChange._storage[obj][callback] = obs;

        } else if (eventListenerSupported) {
            obj.addEventListener('DOMSubtreeModified', callback, false);
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }

    static removeEvent(obj, callback) {
        if (MutationObserver) {
            if (!(obj in TableFits_Prepare_DomChange._storage)) {
                return;
            }

            if (!(callback in TableFits_Prepare_DomChange._storage[obj])) {
                return;
            }

            TableFits_Prepare_DomChange._storage[obj][callback].disconnect();

            delete TableFits_Prepare_DomChange._storage[obj][callback];

        } else if (eventListenerSupported) {
            obj.removeEventListener('DOMSubtreeModified', callback, false);
            obj.removeEventListener('DOMNodeInserted', callback, false);
            obj.removeEventListener('DOMNodeRemoved', callback, false);
        }
    }
}

TableFits_Prepare_DomChange._storage = {};