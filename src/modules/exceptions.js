/**
 * Created by thram on 23/07/15.
 */
(function () {
    window.thram            = window.thram || {};
    window.thram.exceptions = {
        'general'             : {
            code   : 'general',
            name   : "System Error",
            message: "Error detected. Please contact the system administrator."
        },
        'missing_id'          : {
            code   : 'missing-id',
            name   : "Missing id",
            message: "You need at least the ID."
        },
        'missing_argument'    : {
            code   : 'missing-argument',
            name   : "Missing argument",
            message: "This method needs arguments, please check the documentation."
        },
        'wrong_type_arguments': {
            code   : 'wrong-type-arguments',
            name   : "Wrong type arguments",
            message: "The arguments don't match with any valid combination,  please check the documentation."
        },
        'missing_key'         : {
            code   : 'missing-key',
            name   : "Missing key",
            message: "You need at least the key."
        },
        'missing_module'      : {
            code   : 'missing-module',
            name   : "Module not found",
            message: "There is a module dependency. Please check if you added the correct modules."
        },
        'view_not_valid'      : {
            code   : 'view-not-valid',
            name   : "View format not valid",
            message: "The View Object must have a 'controller' method."
        },
        'component_not_valid' : {
            code   : 'component-not-valid',
            name   : "Component format not valid",
            message: "The Component Object must have a 'template' or 'templateURL' attached."
        },
        'no_view'             : {
            code   : 'no-view',
            name   : "No View attached",
            message: "There is no View attached to the route. Please add one. Ex.: thram.router.register('/', {view: 'viewId' }"
        },
        'no_template'             : {
            code   : 'no_template',
            name   : "No Template attached",
            message: "There is no Template or URL attached to the view or component."
        }
    };
})();