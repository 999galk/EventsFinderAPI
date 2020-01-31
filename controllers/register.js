const handleRegister = (req,res,db,bcrypt,method, request) => {
	const { email, name , password} = req.body;
	console.log('got to register.js, details to db:', email, name , password);
	console.log('db:',db);
	if( !email || !name || !password ){
		return res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx =>{
		trx.insert({
			hash : hash,
			email : email
		}).into('login').returning('email').then(loginEmail => {
			console.log('after getting email:', loginEmail[0]);
			return trx('users')
			.returning('*')
			.insert({
				name: name,
				email: loginEmail[0],
				joined : new Date()
			}).then(user => {
				console.log('after getting user:', user[0]);
				res.json(user[0]);
			}).catch(err => console.log('error writing to DB:', err))
		})
		.then(trx.commit)
		.catch(trx.rollback)
	}).catch(err => res.status(400).json('Unable to regiser user'));

}

module.exports = {
	handleRegister : handleRegister
};