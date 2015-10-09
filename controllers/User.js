module.exports = {

	register: function * (next) {
  yield this.render('register.ejs')
},

registererr: function * (next) {
const registererr = true;
yield this.render('register.ejs')
},


create: function * () {
  // Get the 2 variables
  const pseudo = this.request.body.pseudo;
  const password = this.request.body.password;

  // Create the User
  User.create({
    pseudo:pseudo,
    password: password,
  }).exec(function(err, data){

  });
//Render the view
yield this.render('user.ejs', {pseudo:pseudo})}
}
