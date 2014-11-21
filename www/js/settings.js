/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

app.settings = {
    elems: {
        default_message: document.getElementById("setting-default-message"),
        theme: document.getElementById("setting-theme")
    },
    themes: [
        {
            slug:"beer",
            name: "Apéro"
        },
        {
            slug: "mountain",
            name: "Raclette",
        }
    ],
    initialize: function (){
        app.settings.elems.default_message.addEventListener("input", function (){
            local.Storage.setItem("default_message", this.value);
            console.info("message updated", this.value);
        }, false);
        
        app.settings.elems.theme.addEventListener("change", function (){
            local.Storage.setItem("theme", this.value);
            console.info("theme updated", this.value);
        }, false);
        
        //méthode plus rapide sur l'objet themes
        Array.prototype.forEach.call(app.settings.themes, function (name, index){
           var opt = document.createElement("option");
           opt.textContent = theme.name;
           opt.value = theme.slug;
           
           app.settings.elems.theme.appendChild(opt);
        });
    }
}

app.settings.initialize();

