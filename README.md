# Simple Chat Server in Typescript

> This is a simple chat server that once started it listens by default on port 10000. The chat protocol is very simple, clients connect with "telnet" and write single lines of text. On each new line of text, the server will broadcast that line to all other connected clients. 

## Prerequisites

This project requires NodeJS and NPM.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

Start with cloning this repo on your local machine:

```sh
$ git clone https://github.com/grausof/simple-chat-server
$ cd simple-chat-server
```

To install and set up the library, run:

```sh
$ npm install
```

## Usage

### Serving the app

```sh
$ npm start
```

Now if everything is successful the server listens on port 10000 (default) and it is possible to initiate connections via telnet to the server. 

> **Warning:** The server can close the client's connection in case the connection is lost or the client sends "exit" string or ctrl + c

### Running the tests

Two integration tests are performed in jest and allow you to evaluate the sending and receiving of a message by all clients and manage the disconnection

```sh
$ npm test
```

