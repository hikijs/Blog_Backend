'use strict'
let mysql = require('mysql2'); // should be using mysql2 for authentication
const {DB_QUERYs} = require("../configs/configurations")
require('dotenv').config()

const MYSQL_HOST = process.env.MYSQL_HOST
const MYSQL_PORT = process.env.MYSQL_PORT
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_DATABASE = process.env.MYSQL_DATABASE
const MYSQL_NUMBER_CONNECTS = process.env.MYSQL_NUMBER_CONNECTS

const TYPE_CONNECTION_DB = {
	pool: "pool",
	single: "single"
}
class Database
{
    constructor(typeConnection = TYPE_CONNECTION_DB.single)
    {
		this.typeConnection = typeConnection
		// txConnection is flag for handling transaction connection
		this.txConnection = null
		if(typeConnection == TYPE_CONNECTION_DB.pool)
		{
			this.pool = this.createPoolConnetion()
		}
    }

	static getInstance()
    {
        if(!Database.instance)
        {
            Database.instance = new Database()
        }
        return Database.instance
    }

    createPoolConnetion()
    {
        return mysql.createPool({host: MYSQL_HOST || 'mysql',
								user: MYSQL_USER || 'hunghoang',
								password: MYSQL_PASSWORD || '123',
								database: MYSQL_DATABASE || 'blog',
								connectionLimit: MYSQL_NUMBER_CONNECTS || 10})
    }

    createNewConnection()
    {
		return mysql.createConnection({host: MYSQL_HOST || 'mysql',
										user: MYSQL_USER || 'hunghoang',
										password: MYSQL_PASSWORD || '123',
										database: MYSQL_DATABASE || 'blog'});
    }
	// this function supports for transaction query. Because the transaction was processed on an exactly one connection,
	// so that we need keep this connection till the transaction end
	async createTransactionConnection()
	{
		var getTxConnPromise = null
		if(this.typeConnection == TYPE_CONNECTION_DB.pool)
		{
			getTxConnPromise = new Promise((resolve, reject) =>
								{
									this.pool.getConnection((err, connection) => {
										if(err)
										{
											console.log("Error when get new connection from pool")
											reject(err)
										}
										console.log("DEBUG log transaction Connection")
										resolve(connection)
									});
								})
		}
		else if(this.typeConnection == TYPE_CONNECTION_DB.single)
		{
			getTxConnPromise = new Promise((resolve, reject) =>
								{
									const connection = this.createNewConnection()
									connection.connect(function(err) {
										if (err)
										{ 
										console.log(`Connect failed with error ${err}`)
										reject(err)
										}
										resolve(connection)
									});
								})
		}
		try
		{
			this.txConnection = await getTxConnPromise
		}
		catch (error) {
			throw new Error("Issue when getting transaction connection to db")
		}
	}

	// when rollback or commit, we should reset transaction connection
	removeTxConnection()
	{
		if(this.txConnection)
		{
			if(this.typeConnection == TYPE_CONNECTION_DB.single)
			{
				this.txConnection.end()
			}
			this.txConnection = null
		}
	}

	setTypeConnection(typeConnection)
	{
		if(typeConnection !== TYPE_CONNECTION_DB.pool || typeConnection !== TYPE_CONNECTION_DB.single)
		{
			console.log(`Set new types ${typeConnection} does not successfully`)
			return;
		}
		console.log(`Change connection to DB to new types ${typeConnection} successfully`)
		this.typeConnection = typeConnection
	}



    hitQuery(query, params)
    {
		if(this.typeConnection == TYPE_CONNECTION_DB.pool)
		{
			return this.poolQuery(query, params)
		}
		else if(this.typeConnection == TYPE_CONNECTION_DB.single)
		{
			return this.singleConnectionQuery(query, params)
		}
    }
    
    poolQuery(query, params) {
		if(this.txConnection)
		{
			return this.poolTxQuery(query, params)
		}
		else
		{
			return this.poolNormalQuery(query, params)
		}	
    }

	poolTxQuery(query, params)
	{
		if(!this.txConnection)
		{
			throw new Error("transaction connection does not exist")
		}
		return new Promise((resolve, reject) => {
			this.txConnection.query(query, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

	poolNormalQuery(query, params)
	{
		if(!this.pool)
		{
			throw new Error("The pool connection does not exist")
		}
		return new Promise((resolve, reject) => {
			this.pool.execute(query, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

 	async singleConnectionQuery(query, params)
	{
		if(this.isTxConnection)
		{
			return this.sigleTxConnectionQuery(query, params)
		}
		else
		{
			return this.singleConnectionNormalQuery(query, params)
		}
	}

	singleConnectionNormalQuery(query, params)
	{
		const connection = this.createNewConnection()
		connection.connect((err)  => {
			if (err)
			{ 
				console.log(`Connect failed with error ${err}`)
				return null;
			}
			});
		return new Promise((resolve, reject) =>
		{
			connection.query(query, params, (error, results) => {
				connection.end()
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

	sigleTxConnectionQuery(query, params)
	{
		if(!this.txConnection)
		{
			throw new Error("transaction connection does not exist")
		}	
		return new Promise((resolve, reject) => {
			this.txConnection.query(query, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}
}

const instanceMySqlDB = Database.getInstance()
module.exports = instanceMySqlDB