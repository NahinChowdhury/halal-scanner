To connect to db, download pgadmin 4 and then in the left panel, right click on Servers->PostgreSQL 15->Databases
Click create and then database and fill up the information.

To create a table, expand your database created and find Schemas. You can right click the already exisiting 'public' schema to create tables or create your own schemas and create tables there.

Replace the database and password in Client of models/index.ts file to connect to your database. 
In your database, you can create a table named User in the public schema to test if your database connected to the server. To test, you will have to uncomment line 32 onwards in models/index.ts file and run the application.
You will have to recreate all the database tables with columns if you want to run what I have.

I might leave all the table and column names down in the future.


I use DBEAVER application to manipulate the data on the database tables by connecting to the DB. You can run sql queries on DBEAVER too.