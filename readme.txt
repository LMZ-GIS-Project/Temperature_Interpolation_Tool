1) What does the project do?
This project is created for pupils to practically learn how an interpolation works. It is an 
interactive application with responsive design. Pupils go out in the field and take temperature
values, to automatically get an interpolatet heatmap.
2) How to set it up?
- Install xampp locally
- Copy the folder into the htdocs-folder
- Make sure you have no comment in the php-folder in  the file php.ini under "extension=php_sqlite3.dll"
- An SQLite-Browser is recommended, e.g. Sqliteman
- Run xampp by executing "xampp_start.exe"
- Choose a browser and type "localhost"
	- navigate to the folder with the application
- To stop xampp, execute "xampp_stop.exe"
3) Folder structure
	--> app
		--> components
			--> used libraries <--
	--> partials
		-->controllers
			--> Controller      	<--
			--> php-files 		<--
			--> database-template 	<--
		-->module
			-->module file of AngularJS app	<--


