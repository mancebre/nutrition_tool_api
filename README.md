Hello Self

To be able to run Hello Self API on your system you must have node js installed. 

Follow instructions from this page to install node js:
http://howtonode.org/how-to-install-nodejs

After you successfully installed node js you have to install mongodb.
Follow instructions from this page to install mongodb:
http://docs.mongodb.org/manual/installation/

Next step is install of Linux, Apache, MySQL, PHP (LAMP) stack.

Windows:
For LAMP on windows I suggest using XAMPP:
https://www.apachefriends.org/index.html

Mac:
http://coolestguidesontheplanet.com/get-apache-mysql-php-phpmyadmin-working-osx-10-9-mavericks/

Linux:
https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu

Next you need to do is import a sr26 database, The database is located among git files (sr26.sql).
http://www.inmotionhosting.com/support/website/phpmyadmin/import-database-using-phpmyadmin

Now that we have everything set, go to the root folder of heloself API.\n
cd /path/to/hello_self/
And run:
	npm install
this will install all necessary node modules.

Next and final step is to run this:
	node server.js