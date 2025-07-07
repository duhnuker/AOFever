CREATE DATABASE AOFever

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE aus_open_mens_singles (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    champion_country VARCHAR(3) NOT NULL,
    champion_name VARCHAR(100) NOT NULL,
    runners_up_country VARCHAR(3) NOT NULL,
    runners_up VARCHAR(100) NOT NULL,
    score VARCHAR(50) NOT NULL
);

CREATE TABLE aus_open_womens_singles (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    champion_country VARCHAR(3) NOT NULL,
    champion_name VARCHAR(100) NOT NULL,
    runners_up_country VARCHAR(3) NOT NULL,
    runners_up VARCHAR(100) NOT NULL,
    score VARCHAR(50) NOT NULL
);

CREATE TABLE aus_open_mens_doubles (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    champions_countries VARCHAR(10) NOT NULL,
    champions_names VARCHAR(100) NOT NULL,
    runners_up_countries VARCHAR(10) NOT NULL,
    runners_up_names VARCHAR(100) NOT NULL,
    score VARCHAR(50) NOT NULL
);

CREATE TABLE aus_open_womens_doubles (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    champions_countries VARCHAR(10) NOT NULL,
    champions_names VARCHAR(100) NOT NULL,
    runners_up_countries VARCHAR(10) NOT NULL,
    runners_up_names VARCHAR(100) NOT NULL,
    score VARCHAR(50) NOT NULL
);

CREATE TABLE atp (
    id SERIAL PRIMARY KEY,
    tournament VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    series VARCHAR(50) NOT NULL,
    court VARCHAR(25) NOT NULL,
    surface VARCHAR(10) NOT NULL,
    round VARCHAR(50) NOT NULL,
    best_of INT NOT NULL,
    player_1 VARCHAR(50) NOT NULL,
    player_2 VARCHAR(50) NOT NULL,
    winner VARCHAR(50) NOT NULL,
    rank_1 INT NOT NULL,
    rank_2 INT NOT NULL,
    pts_1 INT NOT NULL,
    pts_2 INT NOT NULL,
    odd_1 DOUBLE PRECISION NOT NULL,
    odd_2 DOUBLE PRECISION NOT NULL,
    score VARCHAR(50) NOT NULL
);

CREATE TABLE wta (
    id SERIAL PRIMARY KEY,
    tournament VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    court VARCHAR(25) NOT NULL,
    surface VARCHAR(10) NOT NULL,
    round VARCHAR(50) NOT NULL,
    best_of INT NOT NULL,
    player_1 VARCHAR(50) NOT NULL,
    player_2 VARCHAR(50) NOT NULL,
    winner VARCHAR(50) NOT NULL,
    rank_1 INT NOT NULL,
    rank_2 INT NOT NULL,
    pts_1 INT NOT NULL,
    pts_2 INT NOT NULL,
    odd_1 DOUBLE PRECISION NOT NULL,
    odd_2 DOUBLE PRECISION NOT NULL,
    score VARCHAR(50) NOT NULL
);