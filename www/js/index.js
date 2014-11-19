/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    isPhoneGapApp: !!window.cordova,
    
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        if (app.isPhoneGapApp) {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        }
        else {
            document.addEventListener("DOMContentLoaded", this.onDOMContentReady, false);
            
        }
    },
    defaultContents: {
        contacts: [
            {
                id: "1",
                displayName: "toto martin"
            },
            {
                id: "2",
                displayName: "foo bar",
                photos: [
                    {
                        type: "url",
                        value: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg"
                    }
                ]
            },
            {
                id: "3",
                nickname: "françois hollande",
                photos: [
                    {
                        type: "url",
                        value: "https://s3.amazonaws.com/uifaces/faces/twitter/fffabs/128.jpg"
                    }
                ]
            },
            {
                id: "4",
                name: {
                    formatted: "toto martin"
                },
                photos: [
                    {
                        type: "url",
                        value: "https://s3.amazonaws.com/uifaces/faces/twitter/BillSKenney/128.jpg"
                    }
                ]
            }
        ]
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        var options      = new ContactFindOptions();
        options.filter   = "";
        options.multiple = true;
        var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
        navigator.contacts.find(fields, app.onContactFindSuccess, app.onContactFindError, options);
    },
    onDOMContentReady: function() {
        app.receivedEvent('DOMContentLoaded');
        app.onContactFindSuccess(app.defaultContents.contacts);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    onContactFindSuccess: function(contacts) {
        console.dir(contacts);
        var contacts_list = document.getElementById("contacts-list");
        contacts_list.innerHTML = "";
        contacts_str = new Array(); 
        contacts.forEach(function(contact) {
            if (!contact.displayName && !contact.nickname && (!contact.name || !contact.name.formatted)) {
                return; 
            }
            contacts_str.push("<li>\
                    <a onclick=\"alert('ok'+this.querySelector('h2').textContent+'fin')\" href=\"#contact-" + contact.id + "\" class=\"contact\">");
            if (contact.photos && contact.photos[0]) {
                switch (contact.photos[0].type) {
                    case "url":
                        contacts_str.push("<img src =\"" + contact.photos[0].value + "\" alt=\"photo\" class=\"avatar\" />");
                    break;
                    case "data":
                        contacts_str.push("<img src =\"data:image/jpeg;base64," + contact.photos[0].value + "\" alt=\"photo\" class=\"avatar\" />");
                    break;
                }
            }
            contacts_str.push("<h2>" + (contact.displayName || contact.nickname || contact.name.formatted).sanitize()) + "</h2>\
                    </a>\
                    <label class=\"check\"><input type=\"checkbox\" name=\"\" id=\"contact-" + contact.id + "\" /></label>\
                </li>");
        });
        contacts_list.innerHTML = contacts_str.join("");
        
        console.dir(contacts);
        
        var contacts_avatars = contacts_list.querySelectorAll(".avatar"); //renvoie une nodeList
        Array.prototype.forEach.call(contacts_avatars, function (img){
            img.onerror = function () {
                img.parentNode.removeChild(img);
            }
        })
    },
    onContactFindError: function(error) {
        console.dir(error);
    }
};
app.initialize();