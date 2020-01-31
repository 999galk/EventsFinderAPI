const handleRegister = (req,res,db,bcrypt,method, request) => {
	const { email, name , password} = req.body;
	console.log('got to register.js, details to db:', email, name , password);
	if( !email || !name || !password ){
		return res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password);
	// db.select('*').from('login').where({
	// 	id : 1}).then(user => {
	// 	if(user.length){
	// 		console.log(user[0]);
	// 	} else{
	// 		res.status(404).json('user doesnt exist');
	// 	}
	// }).catch(err => res.status(400).json('Error getting users'));


	db.transaction(trx =>{
		trx.insert({
			hash : hash,
			email : email
		}).into('login').returning('email').then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				name: name,
				email: loginEmail[0],
				joined : new Date()
			}).then(user => {
				console.log(user[0]);
				res.json(user[0]);
			}).catch(err => console.log('error writing to DB:', err))
		})
		.then(trx.commit)
		.catch(trx.rollback)
	}).catch(err => res.status(400).json(err));

}

module.exports = {
	handleRegister : handleRegister
};