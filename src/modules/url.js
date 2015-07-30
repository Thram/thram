/**
 * Created by thram on 23/07/15.
 */
thram.url = (function () {
    var _URLApi = {};

    _URLApi.encodeParams = function (object) {
        var encodedString = '';
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += encodeURI(prop + '=' + object[prop]);
            }
        }
        return encodedString;
    };
    return _URLApi;
})();