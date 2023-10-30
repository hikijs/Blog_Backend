/* eslint-disable quotes */
const ConfigLoader = require('../../submodules/blogConfig/src/configLoader');

const DB_QUERYs = {
	CREATE_USER_TABLE:
		'CREATE TABLE IF NOT EXISTS USER(\
                        userId CHAR(36),\
                        userName VARCHAR(255) UNIQUE NOT NULL,\
                        email VARCHAR(255) UNIQUE NOT NULL,\
                        password VARCHAR(255) UNIQUE NOT NULL,\
                        bio LONGTEXT DEFAULT NULL,\
                        birthDay DATE,\
                        verified BOOLEAN DEFAULT FALSE,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        PRIMARY KEY(userId));',

	CREATE_POST_TABLE:
		"CREATE TABLE IF NOT EXISTS POST(\
                        postId CHAR(36),\
                        title VARCHAR(1500) NOT NULL,\
                        statusEdit ENUM('draft', 'publish', 'unpublish') DEFAULT 'draft',\
                        sharePermission ENUM('private', 'follower', 'public'),\
                        summarize TEXT NOT NULL,\
                        content LONGTEXT NOT NULL,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        userId CHAR(36),\
                        PRIMARY KEY (postId),\
                        FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);",

	CREATE_CATEGORY_TABLE:
		'CREATE TABLE IF NOT EXISTS CATEGORY(\
                            categroryId CHAR(36),\
                            categroryName VARCHAR(1500) NOT NULL,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            PRIMARY KEY (categroryId));',

	CREATE_TAG_TABLE:
		'CREATE TABLE IF NOT EXISTS TAG(\
                        tagId CHAR(36),\
                        tagName VARCHAR(1500) NOT NULL,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        PRIMARY KEY (tagId));',

	CREATE_POSTTAG_TABLE:
		'CREATE TABLE IF NOT EXISTS POSTTAG(\
                            tagId CHAR(36),\
                            postId CHAR(36),\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            FOREIGN KEY (tagId) REFERENCES TAG(tagId) ON DELETE CASCADE ON UPDATE CASCADE,\
                            FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);',

	CREATE_POSTCATEGORY_TABLE:
		'CREATE TABLE IF NOT EXISTS POSTCATEGORY(\
                                categroryId CHAR(36),\
                                postId CHAR(36),\
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                FOREIGN KEY (categroryId) REFERENCES CATEGORY(categroryId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);',

	CREATE_APIKEY_TABLE:
		"CREATE TABLE IF NOT EXISTS APIKEY(\
                            id int AUTO_INCREMENT PRIMARY KEY,\
                            keyString VARCHAR(255) UNIQUE NOT NULL,\
                            permission ENUM('admin', 'user') DEFAULT 'user',\
                            is_active BOOLEAN DEFAULT TRUE,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);",

	CREATE_KEY_STORE_TABLE:
		'CREATE TABLE IF NOT EXISTS KEYSTORE(\
                            keyStoreId CHAR(36),\
                            publicKey VARCHAR(255) UNIQUE NOT NULL,\
                            privateKey VARCHAR(255) UNIQUE NOT NULL,\
                            accessToken VARCHAR(255) UNIQUE NOT NULL,\
                            refreshToken VARCHAR(255) UNIQUE NOT NULL,\
                            refreshTokenUsed JSON DEFAULT NULL,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            userId CHAR(36),\
                            PRIMARY KEY(keyStoreId),\
                            FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE);',

	CREATE_IMAGE_TABLE:
		"CREATE TABLE IF NOT EXISTS IMAGE(\
                        imageId CHAR(36),\
                        imageUrl CHAR(255) NOT NULL,\
                        topic ENUM('avatar', 'thumnail', 'content') DEFAULT 'content',\
                        postId CHAR(36),\
                        userId CHAR(36),\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,\
                        FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);",

	CREATE_VERIFY_CODE_TABLE:
		"CREATE TABLE IF NOT EXISTS VERIFYCODE(\
                                codeId CHAR(36),\
                                code VARCHAR(255) UNIQUE NOT NULL,\
                                expireTime TIMESTAMP NOT NULL, \
                                typeCode ENUM('forgotPassword', 'verifyEmail'),\
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                userId CHAR(36),\
                                PRIMARY KEY(codeId),\
                                FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);",

	CREATE_FOLLOW_LIST_TABLE:
		'CREATE TABLE IF NOT EXISTS FOLLOW_LIST(\
                                    followingId CHAR(36) NOT NULL,\
                                    followerId CHAR(36) NOT NULL,\
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    FOREIGN KEY (followingId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (followerId) REFERENCES USER(userId)ON DELETE CASCADE ON UPDATE CASCADE,\
                                    CONSTRAINT uc_follow UNIQUE (followingId, followerId));',

	CREATE_FRIEND_REQUESTS_TABLE:
		"CREATE TABLE IF NOT EXISTS FRIEND_REQUESTS (\
                                    requestId CHAR(36),\
                                    requesterId CHAR(36) NOT NULL,\
                                    recipientId CHAR(36) NOT NULL,\
                                    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'pending',\
                                    PRIMARY KEY(requestId),\
                                    FOREIGN KEY (requesterId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (recipientId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    CONSTRAINT uc_friendRequest UNIQUE (requesterId, recipientId));",

	CREATE_TABLE_FRIENDSHIPS:
		'CREATE TABLE IF NOT EXISTS FRIENDSHIPS (\
                                    friendshipId CHAR(36),\
                                    userAId CHAR(36) NOT NULL,\
                                    userBId CHAR(36) NOT NULL,\
                                    FOREIGN KEY (userAId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (userBId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    CONSTRAINT uc_friendShip UNIQUE (userAId, userBId));',

	CREATE_COMMENT_TABLE:
		'CREATE TABLE IF NOT EXISTS COMMENT(\
                                    commentId CHAR(36) NOT NULL,\
                                    commentText TEXT NOT NULL,\
                                    userId CHAR(36) NOT NULL,\
                                    postId CHAR(36) NOT NULL,\
                                    parentCommentId CHAR(36) DEFAULT NULL,\
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    PRIMARY KEY(commentId),\
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (parentCommentId) REFERENCES COMMENT(commentId) ON DELETE CASCADE ON UPDATE CASCADE);',

	CREATE_LIKE_EMOTION_TABLE:
		'CREATE TABLE IF NOT EXISTS LIKE_EMOTION(\
                                    likeId CHAR(36) NOT NULL,\
                                    userId CHAR(36) NOT NULL,\
                                    postId CHAR(36) DEFAULT NULL,\
                                    commentId CHAR(36) DEFAULT NULL,\
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    PRIMARY KEY(likeId),\
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                    FOREIGN KEY (commentId) REFERENCES COMMENT(commentId) ON DELETE CASCADE ON UPDATE CASCADE);',

	CREATE_SAVELIST_TABLE:
		"CREATE TABLE IF NOT EXISTS SAVELIST(\
                                        saveListId CHAR(36) NOT NULL,\
                                        nameSaveList VARCHAR(500) DEFAULT 'NO NAME',\
                                        userId CHAR(36) NOT NULL,\
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                        PRIMARY KEY (saveListId),\
                                        FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);",

	CREATE_SAVELIST_POST_TABLE:
		'CREATE TABLE IF NOT EXISTS SAVELIST_POST(\
                                        saveListId CHAR(36) NOT NULL,\
                                        postId CHAR(36) NOT NULL,\
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                        FOREIGN KEY (saveListId) REFERENCES SAVELIST(saveListId) ON DELETE CASCADE ON UPDATE CASCADE,\
                                        FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);',
};

// const API = {
// 	API_KEY: '8da9be05-6d98-4c2f-ab9e-f1e76a43af01',
// };

const TIMEOUT = {
	verifyCode: 60 * 60 * 1000,
};

const CONTRAINS_UPDATE_POST = {
	post: {
		atributes: [
			'title',
			'statusEdit',
			'sharePermission',
			'summarize',
			'content',
		],
		statusEdit: ['publish', 'unpublish', 'draft'],
		sharePermission: ['private', 'follower', 'public'],
	},
};

const CONTRAINS_UPDATE_USER = {
	users: {
		atributes: ['userName', 'email', 'bio', 'birthDay'],
	},
};

const VERIFYCODE_TYPE = {
	FORGOT_PASSWORD: 'forgotPassword',
	VERIFY_EMAIL: 'verifyEmail',
};

// loading configuration
const sharingConfig = ConfigLoader.getInstance();
const NOTIFICATION_CONFIG = sharingConfig.getConfig()?.notifications;

module.exports = {
	DB_QUERYs,
	TIMEOUT,
	CONTRAINS_UPDATE_POST,
	CONTRAINS_UPDATE_USER,
	VERIFYCODE_TYPE,
	NOTIFICATION_CONFIG,
};
