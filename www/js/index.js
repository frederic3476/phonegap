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
        document.getElementById("contacts-list-validate").addEventListener("click", this.onContactsListValidate, false); 
        //document.getElementById("get-location").addEventListener("click", this.onGetLocation, false); 
        //document.getElementById("get-message").addEventListener("click", this.onGetMessage, false);
        //document.getElementById("get-picture").addEventListener("click", this.onGetPicture, false);
    },
    onContactsListValidate: function(){
      var checked_contacts = document.getElementById("contacts-list").querySelectorAll(".check>input[type='checkbox']:checked");
      if (!checked_contacts){
          return false;
      }
      
      var selected_contacts = [];
      
      Array.prototype.forEach.call(
              checked_contacts, function(checkbox){
                  var id = checkbox.value;
                  var contact = app.local_contacts[id];
                  if (!contact) {
                      return;
                  }
                  console.dir(id, contact);
                  selected_contacts.push(contact);
              });
      
      console.dir(selected_contacts);
      document.getElementById("message-interface").classList.remove("off-screen");        
      
      //GEOLOCALISATION  
      if (navigator.geolocation) {
          app.startLocation();
          document.getElementById("get-location").addEventListener("click", app.startLocation, false);
      }
      else{
          document.getElementById("location-map-preview").parentNode.classList.add("hidden");
      }
      
      document.getElementById("message_validate").onclick = app.sendSMSToContacts.bind(null, selected_contacts);
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
                ],
                phoneNumbers: [
                    {
                        type: "Mobile",
                        value: "0616968210"
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
                ],
                phoneNumbers: [
                    {
                        type: "Work",
                        value: "0616968210"
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
        app.local_contacts = {};
        var contacts_list = document.getElementById("contacts-list");
        contacts_list.innerHTML = "";
        contacts_str = new Array(); 
        contacts.forEach(function(contact) {
            if (!contact.phoneNumbers || !contact.phoneNumbers.forEach){
                return;
            }
                
            if (!contact.displayName && !contact.nickname && (!contact.name || !contact.name.formatted)) {
                return; 
            }
            
            var pref_number = app.getPrefferedOrfirst(contact.phoneNumbers, function(phone_number){
                return phone_number.type.toLowerCase() === "mobile";
            });
            
            if (!pref_number){
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
            contacts_str.push("<h2>" + (contact.displayName || contact.nickname || contact.name.formatted).sanitize() + (contact.phoneNumbers[0] ? contact.phoneNumbers[0].value + contact.phoneNumbers[0].type : "") + "</h2>\
                    </a>\
                    <label class=\"check\"><input value=\"" + contact.id + "\" type=\"checkbox\" name=\"\" id=\"contact[" + contact.id + "]\" /></label>\
                </li>");
                    
             app.local_contacts[contact.id] = contact;       
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
    },
    startLocation: function(){
    navigator.geolocation.getCurrentPosition(app.onLocationSuccess, app.onLocationError,
                                                    { 
                                                        enableHighAccuracy: true,
                                                        timeout: 10000,
                                                        maximumAge: 5000
                                                    }
                                                    );
                                         
    },
    onLocationSuccess: function (position){
        var map = document.getElementById("location-map-preview");
        map.classList.remove("hidden");
        console.dir(position);       
        map.style.backgroundImage = "url(https://maps.googleapis.com/maps/api/staticmap?center="+position.coords.latitude+","+position.coords.longitude+"&zoom=13&size="+map.offsetWidth+"x"+map.offsetHeight+"&maptype=roadmap&markers=color:blue%7Clabel:S%7C"+position.coords.latitude+","+position.coords.longitude+")";
        map.dataset.latitude =   position.coords.latitude;
        map.dataset.longitude =   position.coords.longitude;
    },
    onLocationError: function (){
        document.getElementById("location-map-preview").classList.add("hidden");
        alert('error location');
    },
    sendSMSToContacts: function(selected_contacts) {
      
      var location_map = document.getElementById("location-map-preview");
      if (!location_map.classList.contains("hidden") && !location_map.parentNode.classList.contains("hidden")){
          var location = location_map.dataset;
      }
      
      var message = document.getElementById("message-zone").value;
      if (!sms){
          alert("SMS plugin is not ready");
          return;
      }
      
      var selected_numbers = [];
      
      selected_contacts.forEach(function(contact){
           
          if (!contact.phoneNumbers || !contact.phoneNumbers.forEach){
              return;
          }
          
          var pref_number = app.getPrefferedOrfirst(contact.phoneNumbers,
          function(phone_number){
              return phone_number.type.toLowerCase() === "mobile";
          });
          if (pref_number) {
              selected_numbers.push(app.cleanPhoneNumber(pref_number.value));
          };          
      });
      
      alert("sms send to " +selected_numbers[0] +"!!!!");
      var messageInfo = {
            phoneNumber: selected_numbers[0],
            textMessage: (message || "Aperoooo!!!")
      };
      sms.send(selected_numbers[0], (message || "Aperoooo!!!"),"INTENT",
      function(){
          console.info("SMS success");
          alert("SMS success");
      }, 
      function (error) {
          console.error(error);
          alert("SMS error");
      }
      );
    },
    
    getPrefferedOrfirst: function(list, customFilter){
        if (!list || !list.length){
            return;
        }
        
        if (customFilter){
            list = list.filter(customFilter);
            if (!list || !list.length){
                return;
            }
        }
        
        for (var i=0, nb=list.length;i<nb;i++){
            if(list[i].pref) {
                return list[i];
            }
        }
        
        return list[0];
    },
    
    cleanPhoneNumber: function (number){
        return nb.trim().split(" ").map(function (part) {
        return part.trim();
    }).join("");
    }
};
    
app.initialize();