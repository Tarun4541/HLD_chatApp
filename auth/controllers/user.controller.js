import User from '../models/user.model.js';

const getUsers = async (req, res) => {
    
    try {
       // Fetch all users, including only the username field
       const users = await User.find({}, 'username');
       res.status(200).json(users);
   } catch (error) {
       console.log(error.message);	
       res.status(500).json({ message: 'Server Error' });
   }

}

export default getUsers;