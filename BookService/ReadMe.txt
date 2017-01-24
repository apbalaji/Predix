Read Me
_________________________


1. Connect to the postgres database and create the book table based on the pojo object use the pg-studio one web mentioned in https://www.predix.io/support/article/KB0010829. The binaries to deploy are here  https://github.com/john-k-ge/pg_studio_1.2_cf 

2. Run the command CREATE SEQUENCE hibernate_sequence START 1; to set the sequence for use by the id for the book table 

3. The books.sh contains postman command to create the records on the books table

4. The project uses spring boot rest and JPA to expose CRUD on the books table

5. Change the service instance in manifest.yml to point to your predix Postgres and logstash. (Logstash is optional but recommended).


