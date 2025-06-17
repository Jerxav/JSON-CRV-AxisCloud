// ==UserScript==
// @name         Mostrar JSON CRV AxisCloud
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Muestra el JSON completo de la consulta de placa en AxisCloud
// @match        https://servicios.axiscloud.ec/CRV/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Interceptar fetch y XMLHttpRequest
    function mostrarJSON(json) {
        let div = document.getElementById('json-crv-tamper');
        if (!div) {
            div = document.createElement('div');
            div.id = 'json-crv-tamper';
            div.style.position = 'fixed';
            div.style.top = '10px';
            div.style.right = '10px';
            div.style.zIndex = 99999;
            div.style.background = 'white';
            div.style.border = '2px solid #006bff';
            div.style.padding = '10px';
            div.style.maxWidth = '600px';
            div.style.maxHeight = '400px';
            div.style.overflow = 'auto';
            div.style.fontSize = '12px';
            div.style.fontFamily = 'monospace';
            div.innerHTML = '<b>JSON CRV:</b><br><textarea style=\"width:100%;height:300px\">'+JSON.stringify(json, null, 2)+'</textarea>';
            document.body.appendChild(div);
        } else {
            div.querySelector('textarea').value = JSON.stringify(json, null, 2);
        }
    }

    // Interceptar fetch
    const origFetch = window.fetch;
    window.fetch = function() {
        return origFetch.apply(this, arguments).then(async response => {
            if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('datosVehiculo.jsp')) {
                let clone = response.clone();
                let text = await clone.text();
                try {
                    let json = JSON.parse(text);
                    mostrarJSON(json);
                } catch(e){}
            }
            return response;
        });
    };

    // Interceptar XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this._url = arguments[1];
        return origOpen.apply(this, arguments);
    };
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', function() {
            if (this._url && this._url.includes('datosVehiculo.jsp')) {
                try {
                    let json = JSON.parse(this.responseText);
                    mostrarJSON(json);
                } catch(e){}
            }
        });
        return origSend.apply(this, arguments);
    };
})();