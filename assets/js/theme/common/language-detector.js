/**
 * Determine the locale based on the current domain.
 */
function getLocaleBasedOnDomain() {
    const domain = window.location.hostname;

    switch (domain) {
        case 'en.ofinto.ch':
            return 'en-ch';
        case 'fr.ofinto.ch':
            return 'fr-ch';
        case 'ofinto.ch':
            return 'de-ch';
        case 'ofinto.fr':
            return 'fr-fr';
        case 'ofinto.de':
            return 'de-de';
        case 'ofinto.co.uk':
            return 'en-en';
        case 'ofinto.at':
            return 'de-de'; // use de-de for .at domain
        default:
            return 'en-en'; // Default to en-en if not matched
    }
}

export default getLocaleBasedOnDomain;
