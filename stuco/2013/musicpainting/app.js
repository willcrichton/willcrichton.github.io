define(function(require) {
    'use strict';

    requirejs.config({
        enforceDefine: true,
        inlineText: true,
        urlArgs: "bust=" + (new Date()).getTime()
    });

    require(['explosions'], function(exploder) {
       // $(document).click(function(e) {
            //for (var j = 0; j < 10; j++) {
                //exploder(e.clientX, e.clientY);
        exploder(10, 10);
            //}
        //});
    });
});


