CREATE TABLE book(
    id BIGINT PRIMARY KEY     NOT NULL,
    title VARCHAR(100),
    author VARCHAR(100),
    isbn VARCHAR(100),
    published INT(1),
    genre VARCHAR(100) 
);

CREATE SEQUENCE hibernate_sequence START 1;