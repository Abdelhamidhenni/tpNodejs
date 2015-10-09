module.exports = {

login: function*(){
  // Generate 2 variables
  const pseudo = this.request.body.pseudo;
  const password = this.request.body.password;

  // Use the findOne method to get the data of the Users
 dataUser = yield User.findOne({where:{
      pseudo: pseudo,
      password: password
    }});
  // Look if the User exists in the data base and make the redirections
  if (!dataUser) {
    this.redirect('/');
  } else {
      localStorage.setItem("pseudo",pseudo);
    this.redirect('/chat', dataUser);
  }
  }
}


