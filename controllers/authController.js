
const usersDB = {
    users : require('../model/users.json'),
    setUsers : function (data) { this.users = data}
}
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = ('fs').promises;
const path = require('path'); 

const handleLogin = async (req,res) => {
    const { user,pwd } = req.body;
    if ( !user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser = usersDB.users.find(person => person.username === user);
    if (!foundUser) return res.sendStatus(401);   
      const match = await bcrypt.compare(pwd, foundUser.password);
      if (match) {
        const roles = Object.values(foundUser.roles);
       //create JWTs
        const accessToken = jwt.sign(
          { "UserInfo": {
          "username" : foundUser.username ,
          "roles" : roles
            }
        },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn : '30s' }
        );
        const refreshToken = jwt.sign(
          { "username" : foundUser.username},
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn : '1d' }
        );

       //saving refrehsToken with current user
        const otherUSers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser,refreshToken };
        usersDB.setUsers([...otherUSers,currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..' , 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
        res.json({ 'success': `User ${user} is logged in!`})
      } else {
        res.sendStatus(401);
      }
}

module.exports = { handleLogin };