-- 1 create USER table
CREATE TABLE IF NOT EXISTS USER(userId CHAR(36),
                                userName VARCHAR(255) UNIQUE NOT NULL,
                                email VARCHAR(255) NOT NULL,
                                password VARCHAR(255) DEFAULT NULL, -- The password can be NULL for OAuth users
                                bio LONGTEXT DEFAULT NULL,
                                birthDay DATE DEFAULT NULL,
                                verified BOOLEAN DEFAULT FALSE,
                                oauth_provider BOOLEAN DEFAULT FALSE, -- Column to store OAuth provider (e.g., Google, Facebook)
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                PRIMARY KEY(userId)
);
-- 2 create POST table
CREATE TABLE IF NOT EXISTS POST(postId CHAR(36),
                                title VARCHAR(1500) NOT NULL,
                                statusEdit ENUM('draft', 'publish', 'unpublish') DEFAULT 'draft',
                                sharePermission ENUM('private', 'follower', 'public'),
                                summarize TEXT NOT NULL,
                                content LONGTEXT NOT NULL,
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                userId CHAR(36),
                                PRIMARY KEY (postId),
                                FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 3 create category table
CREATE TABLE IF NOT EXISTS CATEGORY(categroryId CHAR(36),
                                    categroryName VARCHAR(150) NOT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY (categroryId),
                                    UNIQUE KEY unique_categroryName (categroryName));

-- create default category 
-- Insert category names into the CATEGORY table with UUIDs
INSERT IGNORE INTO CATEGORY (categroryId, categroryName)
VALUES
    (UUID(), 'Technologies'),
    (UUID(), 'Food'),
    (UUID(), 'Travel'),
    (UUID(), 'Sport'),
    (UUID(), 'Others');

-- 4 create tag table
CREATE TABLE IF NOT EXISTS TAG(tagId CHAR(36),
                               tagName VARCHAR(1500) NOT NULL,
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               PRIMARY KEY (tagId));

-- 5 create posttag table for many many relationship
CREATE TABLE IF NOT EXISTS POSTTAG(tagId CHAR(36),
                                   postId CHAR(36),
                                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   FOREIGN KEY (tagId) REFERENCES TAG(tagId) ON DELETE CASCADE ON UPDATE CASCADE,
                                   FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);                            

-- 6 create postcategory table for many many relationship
CREATE TABLE IF NOT EXISTS POSTCATEGORY(categroryId CHAR(36),
                                        postId CHAR(36),
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        FOREIGN KEY (categroryId) REFERENCES CATEGORY(categroryId) ON DELETE CASCADE ON UPDATE CASCADE,
                                        FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 7 create apikey table
CREATE TABLE IF NOT EXISTS APIKEY(id int AUTO_INCREMENT PRIMARY KEY,
                                  keyString VARCHAR(255) UNIQUE NOT NULL,
                                  permission ENUM('admin', 'user') DEFAULT 'user',
                                  is_active BOOLEAN DEFAULT TRUE,
                                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);

-- 8 create keystore table
CREATE TABLE IF NOT EXISTS KEYSTORE(keyStoreId CHAR(36),
                                    publicKey VARCHAR(255) UNIQUE NOT NULL,
                                    privateKey VARCHAR(255) UNIQUE NOT NULL,
                                    accessToken VARCHAR(255) UNIQUE NOT NULL,
                                    refreshToken VARCHAR(255) UNIQUE NOT NULL,
                                    refreshTokenUsed JSON DEFAULT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    userId CHAR(36),
                                    PRIMARY KEY(keyStoreId),
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE);

-- 9 create image table
CREATE TABLE IF NOT EXISTS IMAGE(imageId CHAR(36),
                                 imageUrl CHAR(255) NOT NULL,
                                 topic ENUM('avatar', 'thumnail', 'content') DEFAULT 'content',
                                 postId CHAR(36),
                                 userId CHAR(36),
                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,
                                 FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 10 create verify code table
CREATE TABLE IF NOT EXISTS VERIFYCODE(codeId CHAR(36),
                                code VARCHAR(255) UNIQUE NOT NULL,
                                expireTime TIMESTAMP NOT NULL, 
                                typeCode ENUM('forgotPassword', 'verifyEmail'),
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                userId CHAR(36),
                                PRIMARY KEY(codeId),
                                FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 11 create follow list table
CREATE TABLE IF NOT EXISTS FOLLOW_LIST(followingId CHAR(36) NOT NULL,
                                    followerId CHAR(36) NOT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    FOREIGN KEY (followingId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (followerId) REFERENCES USER(userId)ON DELETE CASCADE ON UPDATE CASCADE,
                                    CONSTRAINT uc_follow UNIQUE (followingId, followerId));

-- 12 create friend request table
CREATE TABLE IF NOT EXISTS FRIEND_REQUESTS (requestId CHAR(36),
                                    requesterId CHAR(36) NOT NULL,
                                    recipientId CHAR(36) NOT NULL,
                                    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'pending',
                                    PRIMARY KEY(requestId),
                                    FOREIGN KEY (requesterId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (recipientId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    CONSTRAINT uc_friendRequest UNIQUE (requesterId, recipientId));

-- 13 create friendships table
CREATE TABLE IF NOT EXISTS FRIENDSHIPS (friendshipId CHAR(36),
                                    userAId CHAR(36) NOT NULL,
                                    userBId CHAR(36) NOT NULL,
                                    FOREIGN KEY (userAId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (userBId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    CONSTRAINT uc_friendShip UNIQUE (userAId, userBId));

-- 14 create comment table
CREATE TABLE IF NOT EXISTS COMMENT( commentId CHAR(36) NOT NULL,
                                    commentText TEXT NOT NULL,
                                    userId CHAR(36) NOT NULL,
                                    postId CHAR(36) NOT NULL,
                                    parentCommentId CHAR(36) DEFAULT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY(commentId),
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (parentCommentId) REFERENCES COMMENT(commentId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 15 create like table
CREATE TABLE IF NOT EXISTS LIKE_EMOTION(
                                    likeId CHAR(36) NOT NULL,
                                    userId CHAR(36) NOT NULL,
                                    postId CHAR(36) DEFAULT NULL,
                                    commentId CHAR(36) DEFAULT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY(likeId),
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (commentId) REFERENCES COMMENT(commentId) ON DELETE CASCADE ON UPDATE CASCADE);                                    

-- 16 create save list table
CREATE TABLE IF NOT EXISTS SAVELIST(saveListId CHAR(36) NOT NULL,
                                    nameSaveList VARCHAR(500) NOT NULL,
                                    userId CHAR(36) NOT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY (saveListId),
                                    FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 17 create save list post table for many -- many relationship
CREATE TABLE IF NOT EXISTS SAVELIST_POST(saveListPostId CHAR(36) NOT NULL,
                                        saveListId CHAR(36) NOT NULL,
                                        postId CHAR(36) NOT NULL,
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        PRIMARY KEY (saveListId),
                                        FOREIGN KEY (saveListId) REFERENCES SAVELIST(saveListId) ON DELETE CASCADE ON UPDATE CASCADE,
                                        FOREIGN KEY (postId) REFERENCES POST(postId) ON DELETE CASCADE ON UPDATE CASCADE);

-- 18
CREATE TABLE IF NOT EXISTS OAUTH_PROVIDERS( oauthProviderId CHAR(36),
                                            userId CHAR(36),
                                            providerName ENUM('google', 'facebook', 'github') NOT NULL,
                                            tokenId LONGTEXT DEFAULT NULL,
                                            accessToken VARCHAR(500) NOT NULL,
                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                            PRIMARY KEY (oauthProviderId),
                                            FOREIGN KEY (userId) REFERENCES USER(userId) ON DELETE CASCADE);