/**
 * Created by thram on 23/07/15.
 */
thram.exceptions = {
    'general': {
        code: 'general',
        name: "System Error",
        message: "Error detected. Please contact the system administrator."
    },
    'missing_id': {
        code: 'missing-id',
        name: "Missing id",
        message: "You need at least the ID."
    },
    'missing_key': {
        code: 'missing-key',
        name: "Missing key",
        message: "You need at least the key."
    },
    'missing_module': {
        code: 'missing-module',
        name: "Module not found",
        message: "There is a module dependency. Please check if you added the correct modules."
    },
    'view_not_valid': {
        code: 'view-not-valid',
        name: "View format not valid",
        message: "The View Object must have a 'controller' method."
    },
    'component_not_valid': {
        code: 'component-not-valid',
        name: "Component format not valid",
        message: "The Component Object must have a 'template' or 'templateURL' attached."
    }
};