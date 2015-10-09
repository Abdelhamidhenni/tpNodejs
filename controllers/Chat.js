
module.exports = {

createMsg: function * () {

    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');

    pseudo = localStorage.getItem("pseudo");
    message = localStorage.getItem("message");
    // Create the User
    Msg.create({
        message:message,
        author:pseudo
    }).exec(function(err, data){

    });
//Render the view
    yield this.render('chat.ejs',message)
},
chat: function * (){
    listMsg = yield Msg.find();
    yield this.redirect('chat.ejs', listMsg);
}

}

