var express = require('express');
var app = express();
var mysql = require('mysql');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pug = require('pug');

var current_User_ID;
var current_closet_id;


//login to server
//var connection = mysql.createConnection('mysql://be627f988962c9:a66b1e98@us-cdbr-iron-east-05.cleardb.net/heroku_4d509a908d16f19?reconnect=true?multipleStatements=true');
var connection = mysql.createPool({
	connectionLimit : 10,
	host: 'us-cdbr-iron-east-05.cleardb.net',
	user: 'be627f988962c9',
	password: 'a66b1e98',
	database: 'heroku_4d509a908d16f19',
	multipleStatements: true
});
connection.getConnection(function(err, connection) {
  if (err) throw err; // not connected!

  // Use the connection
  connection.query('SELECT * FROM user_table', function (error, results, fields) {
    // When done with the connection, release it.
    connection.release();

    // Handle error after the release.
    if (error) throw error;

    // Don't use the connection here, it has been returned to the pool.
  });
});

//set view engine to ejs
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/'));



app.get('/registration', function(req, res) {
	res.render('registration');
});

app.post('/registration', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;

	var insert_user_info = "INSERT INTO user_table(User_ID, first_name, last_name, user_name, password, email) VALUES (DEFAULT, '" + first_name + "', '" + last_name + "', '" + username + "', '" + password + "', '" + email + "');";
	console.log(insert_user_info);
	connection.query(insert_user_info, (err, result) => {
		if (err) {
			console.log(err);
			res.render('registration', {
				data: result
			})
		}
		else {
			var get_user_id = "SELECT User_ID FROM user_table WHERE user_name = '" + username + "';";
			connection.query(get_user_id, (err, result) => {
				console.log(result[0].User_ID);
				var insert_into_closet = "INSERT INTO closet(User_ID, closet_id) VALUES (" + result[0].User_ID + ", DEFAULT);";
				connection.query(insert_into_closet);
				res.redirect('login');
			})
		}
	});
});

app.get('/', function(req, res) {
	res.render('login');
});

app.post('/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	var verify_username = "SELECT EXISTS(SELECT * FROM user_table WHERE user_name = '" + username + "') AS exist;";
	connection.query(verify_username, (err, result) => {
		if (result[0].exist) {
			var verify_password = "SELECT password FROM user_table WHERE user_name = '" + username + "';";
			connection.query(verify_password, (err, result) => {
				console.log(result[0].password);
				if (result[0].password == password) {
					var get_User_ID = "SELECT User_ID FROM user_table WHERE user_name = '" + username + "';";
					connection.query(get_User_ID, (err, result) => {
						current_User_ID = result[0].User_ID;
						var get_closet_id = "SELECT closet_id FROM closet WHERE User_ID = '"  + current_User_ID + "';";
						connection.query(get_closet_id, (err, result) => {
							current_closet_id = result[0].closet_id;
						})
					})
					res.redirect('closet.html');
				}
				else {
					res.render('login', {
						data: result
					})
				}
			})

	}
})
});

//load add clothes page
app.get('/add_clothes', function(req, res) {

	res.render('additem');
});

//insert data into item table on submit
app.post('/add_clothes', function(req, res) {
	var article = req.body.article; //article of clothing selection
	var season = req.body.season; //season selection
	var brand = req.body.brand; //brand text
	var color = req.body.color; //color text
	var description = req.body.description; //description text
	var materials = req.body.materials; //materials text
	var image = req.body.image;
	console.log(image);

	if (description == undefined) {
		description = 'NULL';
	}

	//insert query
	var insert_item = "INSERT INTO item(item_id, brand, color, type, Season, description, materials, closet_id, image) VALUES (DEFAULT, '" + brand + "', '" + color + "', '" + article + "', '" + season + "', '" + description + "', '" + materials +  "', '" + current_closet_id + "', '" + image + "');";
	console.log(insert_item);
	//execute query
	connection.query(insert_item);
	res.redirect('add_washing_instructions');

});

//load add washing instructions page
app.get('/add_washing_instructions', function(req, res) {
	res.render('add_washing_instructions');
});

//insert data into washing_instructions on submit
app.post('/add_washing_instructions', function(req, res) {
	var wash_type = req.body.wash_type; //wash type selection
	var wash_temp = req.body.wash_temp; //wash temperature selection
	var wash_cycle = req.body.wash_cycle; //wash cycle selection
	var drying_type = req.body.drying_type; //drying type selection
	var drying_temp = req.body.drying_temp; // drying temperature selection
	var bleach = req.body.bleach; // bleach selection
	var iron = req.body.iron; //iron selection

	if (wash_temp == undefined) {
		wash_temp = 'NULL';
	}
	if (wash_cycle == undefined) {
		wash_cycle == 'NULL';
	}

	var get_item_id = "SELECT * FROM item ORDER BY item_id DESC LIMIT 1;"; //query to get most recent item_id which is necessary for washing_instructions primary key
	//execute query to get item_id
	connection.query(get_item_id, (err, result) => {
		//query to insert data into washing_instructions, includes results from get_item_id query
		var insert_wash = "INSERT INTO washing_instructions(wash_id, item_id, wash_type, wash_temp, wash_cycle, bleach) VALUES (DEFAULT, '" + result[0].item_id + "', '" + wash_type + "', '" + wash_temp + "', '" + wash_cycle + "', '"  + bleach  + "');";
		var insert_dry = "INSERT INTO drying_instructions(dry_id, item_id, drying_type, drying_temp, iron) VALUES (DEFAULT, '" + result[0].item_id + "', '" + drying_type + "', '" + drying_temp + "', '" + iron + "');";
		//execute query to insert
		console.log(result[0]);
		var query = insert_wash + insert_dry;
		console.log(query);
		connection.query(query);
	});

	//redirect to view_closet on completion
	res.redirect('/view_closet');
})

app.get('closet', function(req, res) {
	res.render('closet.html');
})

//load view closet page
app.get('/view_closet', function(req, res) {
	//query to get all clothes form item table
	var get_clothes = "SELECT * FROM item WHERE closet_id = " + current_closet_id + ";";

	//execute query
	connection.query(get_clothes, (err, result) => {
		//redirect to home page on error
		if (err) {
			res.redirect('closet.html');
		}
		res.render('view_closet', {
			//pass query results through reslt array
			data: result
		})
	})


});

//passes user selection of worn clothes to item table, updates worn column only
app.post('/view_closet', function(req, res) {

	//gets all clothes checked off as worn
	var worn_selections = req.body.worn;

	//query to set all worn selections to true
	var worn_clothes = "UPDATE item SET worn = true WHERE ";
	var x;

	if (worn_selections != undefined) {
		//single selection not given in array form, needs to be converted to array
		if (!Array.isArray(worn_selections)) {
			worn_selections = [worn_selections];
		}
		//add where clauses with or
		for (x=0; x<worn_selections.length; x++) {
			if (x>0) {
				var where = " OR item_id = '" + worn_selections[x] + "'";
			}
			else {
				var where = "item_id = '" + worn_selections[x] + "'";
			}
			worn_clothes += where;
		}
		worn_clothes += ";";

		//only execute query if user has made at least one selection
		connection.query(worn_clothes);
	}

	//render page
	res.redirect('view_closet');

});

//load available_loads page
app.get('/available_loads', function(req, res) {
	//query to get all worn clothes
	var get_machine_clothes = "SELECT a.*, b.* FROM item a, washing_instructions b WHERE a.item_id = b.item_id AND b.wash_type = 'machine' AND a.Worn = true AND closet_id = " + current_closet_id + " ; ";
	var get_hand_dry = "SELECT a.*, b.* FROM item a, washing_instructions b WHERE a.item_id = b.item_id AND b.wash_type = 'hand wash' AND a.Worn = true AND closet_id = " + current_closet_id + " ; ";
	var get_dry_clean = "SELECT a.*, b.* FROM item a, washing_instructions b WHERE a.item_id = b.item_id AND b.wash_type = 'dry clean' AND a.Worn = true AND closet_id = " + current_closet_id + " ; ";

	var get_clothes = get_machine_clothes + get_hand_dry + get_dry_clean;

	//execute query
	connection.query(get_clothes, (err, result) => {
		//redirect to home page on error
		if (err) {
			res.redirect('/closet.html');
		}
		var i;
		for (i=0; i < result.length; i++) {
			if (result[i] == []) {
				result[i] = 0;
			}
		}
		console.log(result[1]);

		if (result[1] == '[]') {
			console.log('test failed');
		}
		res.render('available_loads', {
			//query results stored in result array
			machine: result[0],
			hand: result[1],
			dry_clean: result[2]
		})
	})
});

//passes user selection of washed clothes to item table, updates worn column only
app.post('/available_loads', function(req, res) {
	//gets all washed selections
	var wash_selections = req.body.wash;

	//query to set all user selections as not worn
	var wash_clothes = "UPDATE item SET worn = false WHERE ";
	var i;

	if (wash_selections != undefined) {
		//single selection not given in array form, needs to be converted to array
		if (!Array.isArray(wash_selections)) {
			wash_selections = [wash_selections];
		}
		//add where clauses with or
		for (i=0; i<wash_selections.length; i++) {
			if (i>0) {
				var where = " OR item_id = '" + wash_selections[i] + "'";
			}
			else {
				var where = "item_id = '" + wash_selections[i] + "'";
			}
			wash_clothes += where;
		}
		wash_clothes += ";";

		//only execute query if user has made at least one selection
		connection.query(wash_clothes);
	}
	//render page
	res.redirect('available_loads');
});

//loads delete_clothes page
app.get('/delete_clothes', function(req, res) {
	//query to load all clothes
	var get_clothes = "SELECT * FROM item WHERE closet_id = " + current_closet_id + ";";

	//execute query
	connection.query(get_clothes, (err, result) => {
		//redirect to home page on error
		if (err) {
			res.redirect('/closet.html');
		}

		//query results stored in result array
		res.render('delete_clothes', {
			data: result
		})
	})
});

//passes user selection of clothes to delete to item table, deletes selected rows from table
app.post('/delete_clothes', function(req, res) {
	//gets all selected items to delete
	var delete_selections = req.body.delete;

	//query to delete all user selected items
	var delete_clothes = "SET FOREIGN_KEY_CHECKS=0; DELETE FROM item WHERE closet_id = " + current_closet_id + "";
	var i;

	if (delete_selections != undefined) {
		//single selection not given in array form, needs to be converted to array
		if (!Array.isArray(delete_selections)) {
			delete_selections = [delete_selections];
		}

		//add where clauses with or
		for (i=0; i<delete_selections.length; i++) {
			if (i>0) {
				var where = " OR item_id = '" + delete_selections[i] + "'";
			}
			else {
				var where = " AND item_id = '" + delete_selections[i] + "'";
			}
			delete_clothes += where;
			delete_clothes += " ";
		}
		delete_clothes += "; SET FOREIGN_KEY_CHECKS=1;";
		console.log(delete_clothes);
		//only execute query if user has made at least one selection
		connection.query(delete_clothes);
	}

	res.redirect('delete_clothes');


})



//load view closet page
app.get('/mark_worn', function(req, res) {
	//query to get all clothes form item table
	var get_clothes = "SELECT * FROM item WHERE closet_id = " + current_closet_id + " AND worn = false;";

	//execute query
	connection.query(get_clothes, (err, result) => {
		//redirect to home page on error
		if (err) {
			res.redirect('closet');
		}
		res.render('mark_worn', {
			//pass query results through reslt array
			data: result
		})
	})


});

//passes user selection of worn clothes to item table, updates worn column only
app.post('/mark_worn', function(req, res) {

	//gets all clothes checked off as worn
	var worn_selections = req.body.worn;

	//query to set all worn selections to true
	var worn_clothes = "UPDATE item SET worn = true WHERE ";
	var x;

	if (worn_selections != undefined) {
		//single selection not given in array form, needs to be converted to array
		if (!Array.isArray(worn_selections)) {
			worn_selections = [worn_selections];
		}
		//add where clauses with or
		for (x=0; x<worn_selections.length; x++) {
			if (x>0) {
				var where = " OR item_id = '" + worn_selections[x] + "'";
			}
			else {
				var where = "item_id = '" + worn_selections[x] + "'";
			}
			worn_clothes += where;
		}
		worn_clothes += ";";

		//only execute query if user has made at least one selection
		connection.query(worn_clothes);
	}

	//render page
	res.redirect('mark_worn');

});



// app.listen(3000);
// console.log('3000 is the magic port');

  var port = process.env.PORT || 8080;
  app.listen(port, function() {
      console.log('Our app is running on http://localhost:' + port);
  });
