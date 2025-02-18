const errorMessages = {
    emailInvalid: {
        'de-de': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        'de-ch': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        'en-en': 'Please enter a valid email address.',
        'en-ch': 'Please enter a valid email address.',
        'fr-fr': 'Veuillez entrer une adresse e-mail valide.',
        'fr-ch': 'Veuillez entrer une adresse e-mail valide.'
    },
    passwordEnter: {
        'de-de': 'Bitte geben Sie ein Passwort ein.',
        'de-ch': 'Bitte geben Sie ein Passwort ein.',
        'en-en': 'Please enter a password.',
        'en-ch': 'Please enter a password.',
        'fr-fr': 'Veuillez entrer un mot de passe.',
        'fr-ch': 'Veuillez entrer un mot de passe.'
    },
    passwordsDoNotMatch: {
        'de-de': 'Ihre Passwörter stimmen nicht überein.',
        'de-ch': 'Ihre Passwörter stimmen nicht überein.',
        'en-en': 'Your passwords do not match.',
        'en-ch': 'Your passwords do not match.',
        'fr-fr': 'Vos mots de passe ne correspondent pas.',
        'fr-ch': 'Vos mots de passe ne correspondent pas.'
    },
    minPriceLessThanMax: {
        'de-de': 'Min. Preis muss kleiner als Max. Preis sein.',
        'de-ch': 'Min. Preis muss kleiner als Max. Preis sein.',
        'en-en': 'Min. price must be less than Max. price.',
        'en-ch': 'Min. price must be less than Max. price.',
        'fr-fr': 'Le prix min. doit être inférieur au prix max.',
        'fr-ch': 'Le prix min. doit être inférieur au prix max.'
    },
    maxPriceRequired: {
        'de-de': 'Bitte geben Sie einen Max. Preis an.',
        'de-ch': 'Bitte geben Sie einen Max. Preis an.',
        'en-en': 'Please provide a Max. price.',
        'en-ch': 'Please provide a Max. price.',
        'fr-fr': 'Veuillez indiquer un prix max.',
        'fr-ch': 'Veuillez indiquer un prix max.'
    },
    minPriceRequired: {
        'de-de': 'Bitte geben Sie einen Min. Preis an.',
        'de-ch': 'Bitte geben Sie einen Min. Preis an.',
        'en-en': 'Please provide a Min. price.',
        'en-ch': 'Please provide a Min. price.',
        'fr-fr': 'Veuillez indiquer un prix min.',
        'fr-ch': 'Veuillez indiquer un prix min.'
    },
    inputGreaterThanZero: {
        'de-de': 'Der Eintrag muss grösser als 0 sein.',
        'de-ch': 'Der Eintrag muss grösser als 0 sein.',
        'en-en': 'The entry must be greater than 0.',
        'en-ch': 'The entry must be greater than 0.',
        'fr-fr': "L'entrée doit être supérieure à 0.",
        'fr-ch': "L'entrée doit être supérieure à 0."
    },
    stateCannotBeBlank: {
        'de-de': 'Bitte wählen Sie ein Bundesland aus.',
        'de-ch': 'Bitte wählen Sie einen Kanton aus.',
        'en-en': 'Please select a state.',
        'en-ch': 'Please select a state.',
        'fr-fr': 'Veuillez sélectionner un état.',
        'fr-ch': 'Veuillez sélectionner un canton.'
    },
    dateRangeError: {
        'de-de': (min_date, max_date) => `Das Datum muss zwischen ${min_date} und ${max_date} liegen.`,
        'de-ch': (min_date, max_date) => `Das Datum muss zwischen ${min_date} und ${max_date} liegen.`,
        'fr-fr': (min_date, max_date) => `La date doit être entre ${min_date} et ${max_date}.`,
        'fr-ch': (min_date, max_date) => `La date doit être entre ${min_date} et ${max_date}.`,
        'en-en': (min_date, max_date) => `The date must be between ${min_date} and ${max_date}.`,
        'en-ch': (min_date, max_date) => `The date must be between ${min_date} and ${max_date}.`
    },
    fieldCannotBeBlank: {
        'de-de': label => `'${label}' darf nicht leer sein.`,
        'de-ch': label => `'${label}' darf nicht leer sein.`,
        'fr-fr': label => `'${label}' ne peut pas être vide.`,
        'fr-ch': label => `'${label}' ne peut pas être vide.`,
        'en-en': label => `'${label}' cannot be blank.`,
        'en-ch': label => `'${label}' cannot be blank.`
    },
    numberRangeError: {
        'de-de': (label, min, max) => `${label} muss zwischen ${min} und ${max} sein.`,
        'de-ch': (label, min, max) => `${label} muss zwischen ${min} und ${max} sein.`,
        'fr-fr': (label, min, max) => `${label} doit être entre ${min} et ${max}.`,
        'fr-ch': (label, min, max) => `${label} doit être entre ${min} et ${max}.`,
        'en-en': (label, min, max) => `${label} must be between ${min} and ${max}.`,
        'en-ch': (label, min, max) => `${label} must be between ${min} and ${max}.`
    }
};

export default errorMessages;
