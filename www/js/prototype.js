String.prototype.sanitize = function(){
    return this.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


