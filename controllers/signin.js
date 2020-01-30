const handleSignin = (req,res,db,bcrypt) => {
	const {email, password} = req.body;
	console.log('email pass in signim:', email, password);
	if( !email || !password ){
		return res.status(400).json('incorrect form submission');
	}
	db.select('email','hash').from('login')
	.where('email', '=', email).then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid){
			return db.select('*').from('users').where('email', '=', email).then(user => {
				res.json(user[0]);
			}).catch(err => res.status(400).json('unable to get user'))
		} else {
			res.status(404).json('incorrect login credentials')
		}
	}).catch(err => res.status(400).json('Error getting users data'));
}

module.exports = {
	handleSignin : handleSignin
};